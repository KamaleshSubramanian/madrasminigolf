import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { insertPlayerSchema, insertGameSchema, insertScoreSchema, insertPricingSchema } from "@shared/schema";
import { z } from "zod";

// Session user type
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
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
      console.error("Error initializing defaults:", error);
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
      const gameData = insertGameSchema.parse(req.body);
      
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
      
      const recentGames = games.slice(0, 10).map(game => ({
        id: game.id,
        playerCount: game.playerCount,
        leadPlayer: game.playerNames[0] || "Unknown",
        cost: `₹${parseFloat(game.totalCost).toLocaleString()}`,
        time: new Date(game.completedAt).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        }),
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
      
      // Fill in missing hours with zero data
      const completeHourlyData = [];
      for (let hour = 9; hour <= 20; hour++) {
        const existingData = hourlyData.find(h => h.hour === hour);
        completeHourlyData.push({
          hour,
          games: existingData?.games || 0,
          revenue: existingData?.revenue || "0",
          label: hour <= 12 ? `${hour}AM` : `${hour - 12}PM`,
        });
      }

      res.json(completeHourlyData);
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
      const { date } = req.query;
      const targetDate = date ? new Date(date as string) : new Date();
      
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const games = await storage.getGamesByDateRange(startOfDay, endOfDay);
      
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
