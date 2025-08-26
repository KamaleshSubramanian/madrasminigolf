import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { insertPlayerSchema, insertScoreSchema, insertPricingSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import { pool } from "./db";

// Custom game creation schema without totalCost
const createGameSchema = z.object({
  playerId: z.string(),
  playerNames: z.array(z.string()).min(1),
  playerCount: z.number().int().min(1).max(8),
  isWeekend: z.boolean(),
});

// Session user type
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  const PgSession = ConnectPgSimple(session);
  
  app.use(session({
    store: new PgSession({
      pool: pool,
      tableName: 'session',
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key-here',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  }));

  // Initialize default admin user and pricing if not exists
  const initializeDefaults = async () => {
    try {
      const adminUser = await storage.getUserByUsername("admin");
      if (!adminUser) {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        await storage.createUser({
          username: "admin",
          password: hashedPassword,
        });
      }

      const currentPricing = await storage.getCurrentPricing();
      if (!currentPricing) {
        const admin = await storage.getUserByUsername("admin");
        if (admin) {
          await storage.createPricing({
            weekdayPrice: "60.00",
            weekendPrice: "80.00",
            updatedBy: admin.id,
          });
        }
      }
    } catch (error) {
      // Handle initialization error silently
    }
  };

  await initializeDefaults();

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Player registration
  app.post("/api/players", async (req, res) => {
    try {
      const playerData = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(playerData);
      res.json(player);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Create game
  app.post("/api/games", async (req, res) => {
    try {
      const gameData = createGameSchema.parse(req.body);
      
      // Calculate cost based on pricing and day
      const currentPricing = await storage.getCurrentPricing();
      if (!currentPricing) {
        return res.status(400).json({ message: "Pricing not configured" });
      }

      const pricePerPlayer = gameData.isWeekend 
        ? parseFloat(currentPricing.weekendPrice) 
        : parseFloat(currentPricing.weekdayPrice);
      
      const totalCost = (pricePerPlayer * gameData.playerCount).toFixed(2);

      const game = await storage.createGame({
        ...gameData,
        totalCost,
      });

      res.json(game);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Add scores to game
  app.post("/api/games/:gameId/scores", async (req, res) => {
    try {
      const { gameId } = req.params;
      const scoresData = z.array(insertScoreSchema.omit({ gameId: true })).parse(req.body);
      
      const scores = await Promise.all(
        scoresData.map(scoreData => 
          storage.createScore({ ...scoreData, gameId })
        )
      );

      res.json(scores);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get game with scores
  app.get("/api/games/:gameId", async (req, res) => {
    try {
      const { gameId } = req.params;
      const game = await storage.getGame(gameId);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      const scores = await storage.getScoresByGame(gameId);
      res.json({ ...game, scores });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get current pricing
  app.get("/api/pricing", async (req, res) => {
    try {
      const pricing = await storage.getCurrentPricing();
      if (!pricing) {
        return res.status(404).json({ message: "Pricing not found" });
      }
      res.json(pricing);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json({ message: "Login successful", user: { id: user.id, username: user.username } });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin logout
  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Check auth status
  app.get("/api/admin/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ id: user.id, username: user.username });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Dashboard stats
  app.get("/api/admin/dashboard-stats", requireAuth, async (req, res) => {
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const todayStats = await storage.getDailySales(today);
      const yesterdayStats = await storage.getDailySales(yesterday);

      // Calculate today's average score
      const startOfToday = new Date(today);
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);
      
      const todayGames = await storage.getGamesByDateRange(startOfToday, endOfToday);
      let averageScore = 0;
      
      if (todayGames.length > 0) {
        let totalScore = 0;
        let totalPlayers = 0;
        
        // Get scores for each game
        for (const game of todayGames) {
          try {
            const gameScores = await storage.getScoresByGame(game.id);
            
            // Group scores by player name and calculate totals
            const playerScores: { [playerName: string]: number } = {};
            
            for (const score of gameScores) {
              if (!playerScores[score.playerName]) {
                playerScores[score.playerName] = 0;
              }
              playerScores[score.playerName] += score.strokes;
            }
            
            // Add each player's total to the overall totals
            for (const playerName in playerScores) {
              if (playerScores[playerName] > 0) {
                totalScore += playerScores[playerName];
                totalPlayers++;
              }
            }
          } catch (error) {
            // Skip games with missing score data
            continue;
          }
        }
        
        averageScore = totalPlayers > 0 ? (totalScore / totalPlayers) : 0;
      }

      // Calculate growth percentages
      const gamesGrowth = yesterdayStats.totalGames > 0 
        ? ((todayStats.totalGames - yesterdayStats.totalGames) / yesterdayStats.totalGames * 100).toFixed(1)
        : "0";

      const revenueGrowth = parseFloat(yesterdayStats.totalRevenue) > 0
        ? ((parseFloat(todayStats.totalRevenue) - parseFloat(yesterdayStats.totalRevenue)) / parseFloat(yesterdayStats.totalRevenue) * 100).toFixed(1)
        : "0";

      res.json({
        todayGames: todayStats.totalGames,
        todayRevenue: `₹${parseFloat(todayStats.totalRevenue).toLocaleString()}`,
        totalPlayers: todayStats.totalPlayers,
        averageScore: averageScore.toFixed(1),
        gamesGrowth: `${gamesGrowth}%`,
        revenueGrowth: `${revenueGrowth}%`,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Recent games
  app.get("/api/admin/recent-games", requireAuth, async (req, res) => {
    try {
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const games = await storage.getGamesByDateRange(startOfDay, endOfDay);
      
      const recentGames = await Promise.all(games.slice(0, 10).map(async game => {
        const player = await storage.getPlayer(game.playerId);
        return {
          id: game.id,
          playerCount: game.playerCount,
          leadPlayer: player?.name || "Unknown",
          cost: `₹${parseFloat(game.totalCost).toLocaleString()}`,
          time: new Date(game.completedAt).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          }),
        };
      }));

      res.json(recentGames);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Sales analytics
  app.get("/api/admin/sales/:period", requireAuth, async (req, res) => {
    try {
      const { period } = req.params;
      const today = new Date();

      let stats;
      switch (period) {
        case "day":
          stats = await storage.getDailySales(today);
          break;
        case "week":
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - 7);
          stats = await storage.getWeeklySales(weekStart);
          break;
        case "month":
          const monthStart = new Date(today);
          monthStart.setMonth(today.getMonth() - 1);
          stats = await storage.getMonthlySales(monthStart);
          break;
        case "custom":
          const { from, to } = req.query;
          if (!from || !to) {
            return res.status(400).json({ message: "Start and end dates are required for custom period" });
          }
          
          const fromDate = new Date(from as string);
          const toDate = new Date(to as string);
          
          // Validation: prevent future dates (allow today and past dates)
          const now = new Date();
          now.setHours(23, 59, 59, 999); // Set to end of today to allow all of today
          
          if (fromDate > now || toDate > now) {
            return res.status(400).json({ message: "Cannot query future dates" });
          }
          
          // Set time boundaries
          fromDate.setHours(0, 0, 0, 0);
          toDate.setHours(23, 59, 59, 999);
          
          stats = await storage.getSalesStats(fromDate, toDate);
          break;
        default:
          return res.status(400).json({ message: "Invalid period" });
      }

      res.json({
        totalGames: stats.totalGames,
        totalRevenue: `₹${parseFloat(stats.totalRevenue).toLocaleString()}`,
        totalPlayers: stats.totalPlayers,
        avgPerGame: stats.totalGames > 0 
          ? `₹${(parseFloat(stats.totalRevenue) / stats.totalGames).toFixed(0)}`
          : "₹0",
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Hourly sales breakdown
  app.get("/api/admin/hourly-sales", requireAuth, async (req, res) => {
    try {
      const today = new Date();
      const hourlyData = await storage.getHourlySales(today);
      
      // Fill in missing hours with zero data (covering all 24 hours)
      const completeHourlyData = [];
      for (let hour = 0; hour <= 23; hour++) {
        const existingData = hourlyData.find(h => h.hour === hour);
        let label;
        if (hour === 0) label = "12AM";
        else if (hour < 12) label = `${hour}AM`;
        else if (hour === 12) label = "12PM";
        else label = `${hour - 12}PM`;
        
        completeHourlyData.push({
          hour,
          games: existingData?.games || 0,
          revenue: existingData?.revenue || "0",
          label: label,
        });
      }

      res.json(completeHourlyData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Weekly sales breakdown (7 days)
  app.get("/api/admin/weekly-sales", requireAuth, async (req, res) => {
    try {
      const today = new Date();
      const weeklyData = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        const stats = await storage.getSalesStats(startOfDay, endOfDay);
        
        weeklyData.push({
          day: i,
          games: stats.totalGames,
          revenue: stats.totalRevenue,
          label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        });
      }

      res.json(weeklyData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Monthly sales breakdown (30 days)
  app.get("/api/admin/monthly-sales", requireAuth, async (req, res) => {
    try {
      const today = new Date();
      const monthlyData = [];
      
      // Get last 30 days, group by week
      for (let week = 3; week >= 0; week--) {
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - (week * 7 + 6));
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() - (week * 7));
        weekEnd.setHours(23, 59, 59, 999);
        
        const stats = await storage.getSalesStats(weekStart, weekEnd);
        
        monthlyData.push({
          week: 3 - week,
          games: stats.totalGames,
          revenue: stats.totalRevenue,
          label: `Week ${4 - week}`,
        });
      }

      res.json(monthlyData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get custom sales data for chart (date range)
  app.get("/api/admin/custom-sales", requireAuth, async (req, res) => {
    try {
      const { from, to } = req.query;
      
      if (!from || !to) {
        return res.status(400).json({ message: "Start and end dates are required" });
      }
      
      const fromDate = new Date(from as string);
      const toDate = new Date(to as string);
      
      // Validation: prevent future dates (allow today and past dates)
      const now = new Date();
      now.setHours(23, 59, 59, 999); // Set to end of today to allow all of today
      
      if (fromDate > now || toDate > now) {
        return res.status(400).json({ message: "Cannot query future dates" });
      }
      
      // Set time boundaries
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);

      const games = await storage.getGamesByDateRange(fromDate, toDate);
      
      // Group by date and calculate revenue
      const salesByDate: { [key: string]: { games: number; revenue: number } } = {};
      
      games.forEach(game => {
        // Handle null or undefined completedAt dates
        const completedDate = game.completedAt || new Date();
        const dateKey = new Date(completedDate).toISOString().split('T')[0]; // YYYY-MM-DD format
        
        if (!salesByDate[dateKey]) {
          salesByDate[dateKey] = { games: 0, revenue: 0 };
        }
        
        salesByDate[dateKey].games += 1;
        salesByDate[dateKey].revenue += parseFloat(game.totalCost);
      });
      
      // Convert to array format for chart, covering all dates in range
      const chartData = [];
      const currentDate = new Date(fromDate);
      
      while (currentDate <= toDate) {
        const dateKey = currentDate.toISOString().split('T')[0];
        const data = salesByDate[dateKey] || { games: 0, revenue: 0 };
        
        chartData.push({
          date: dateKey,
          label: currentDate.getDate().toString(),
          fullDate: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          games: data.games,
          revenue: data.revenue.toFixed(2)
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      res.json(chartData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update pricing
  app.post("/api/admin/pricing", requireAuth, async (req, res) => {
    try {
      const pricingData = insertPricingSchema.parse({
        ...req.body,
        updatedBy: req.session.userId,
      });

      const pricing = await storage.createPricing(pricingData);
      res.json(pricing);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get pricing history
  app.get("/api/admin/pricing-history", requireAuth, async (req, res) => {
    try {
      const history = await storage.getPricingHistory();
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all transactions for a date
  app.get("/api/admin/transactions", requireAuth, async (req, res) => {
    try {
      const { date, month, year, from, to } = req.query;
      let startDate: Date, endDate: Date;
      
      if (month && year) {
        // Legacy month/year query support
        const customMonth = parseInt(month as string);
        const customYear = parseInt(year as string);
        
        // Validation: prevent future dates
        const now = new Date();
        const customDate = new Date(customYear, customMonth - 1);
        if (customDate > new Date(now.getFullYear(), now.getMonth())) {
          return res.status(400).json({ message: "Cannot query future dates" });
        }
        
        startDate = new Date(customYear, customMonth - 1, 1);
        endDate = new Date(customYear, customMonth, 0, 23, 59, 59, 999);
      } else if (from && to) {
        // Date range query
        const fromDate = new Date(from as string);
        const toDate = new Date(to as string);
        
        // Validation: prevent future dates (allow today and past dates)
        const now = new Date();
        now.setHours(23, 59, 59, 999); // Set to end of today to allow all of today
        
        if (fromDate > now || toDate > now) {
          return res.status(400).json({ message: "Cannot query future dates" });
        }
        
        startDate = new Date(fromDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
      } else {
        // Single date query (existing functionality)
        const targetDate = date ? new Date(date as string) : new Date();
        startDate = new Date(targetDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(targetDate);
        endDate.setHours(23, 59, 59, 999);
      }

      const games = await storage.getGamesByDateRange(startDate, endDate);
      
      const transactions = games.map(game => ({
        id: game.id,
        time: new Date(game.completedAt).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        }),
        player: game.playerNames[0] || "Unknown",
        playerCount: game.playerCount,
        cost: `₹${parseFloat(game.totalCost).toLocaleString()}`,
        type: game.isWeekend ? "Weekend" : "Weekday",
      }));

      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
