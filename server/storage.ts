import { 
  users, players, games, scores, pricing,
  type User, type InsertUser,
  type Player, type InsertPlayer,
  type Game, type InsertGame,
  type Score, type InsertScore,
  type Pricing, type InsertPricing
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, gte, lte, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Player methods
  createPlayer(player: InsertPlayer): Promise<Player>;
  getPlayer(id: string): Promise<Player | undefined>;

  // Game methods
  createGame(game: InsertGame): Promise<Game>;
  getGame(id: string): Promise<Game | undefined>;
  getGames(startDate?: Date, endDate?: Date): Promise<Game[]>;
  getGamesByDateRange(startDate: Date, endDate: Date): Promise<Game[]>;

  // Score methods
  createScore(score: InsertScore): Promise<Score>;
  getScoresByGame(gameId: string): Promise<Score[]>;

  // Pricing methods
  getCurrentPricing(): Promise<Pricing | undefined>;
  createPricing(pricing: InsertPricing): Promise<Pricing>;
  getPricingHistory(): Promise<Pricing[]>;

  // Analytics methods
  getDailySales(date: Date): Promise<{ totalGames: number; totalRevenue: string; totalPlayers: number }>;
  getWeeklySales(startDate: Date): Promise<{ totalGames: number; totalRevenue: string; totalPlayers: number }>;
  getMonthlySales(startDate: Date): Promise<{ totalGames: number; totalRevenue: string; totalPlayers: number }>;
  getHourlySales(date: Date): Promise<Array<{ hour: number; games: number; revenue: string }>>;
  getSalesStats(startDate: Date, endDate: Date): Promise<{ totalGames: number; totalRevenue: string; totalPlayers: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const [player] = await db
      .insert(players)
      .values(insertPlayer)
      .returning();
    return player;
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || undefined;
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const [game] = await db
      .insert(games)
      .values(insertGame)
      .returning();
    return game;
  }

  async getGame(id: string): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game || undefined;
  }

  async getGames(startDate?: Date, endDate?: Date): Promise<Game[]> {
    let query = db.select().from(games);
    
    if (startDate && endDate) {
      query = query.where(and(
        gte(games.completedAt, startDate),
        lte(games.completedAt, endDate)
      ));
    }
    
    return await query.orderBy(desc(games.completedAt));
  }

  async getGamesByDateRange(startDate: Date, endDate: Date): Promise<Game[]> {
    return await db.select().from(games)
      .where(and(
        gte(games.completedAt, startDate),
        lte(games.completedAt, endDate)
      ))
      .orderBy(desc(games.completedAt));
  }

  async createScore(insertScore: InsertScore): Promise<Score> {
    const [score] = await db
      .insert(scores)
      .values(insertScore)
      .returning();
    return score;
  }

  async getScoresByGame(gameId: string): Promise<Score[]> {
    return await db.select().from(scores)
      .where(eq(scores.gameId, gameId))
      .orderBy(scores.hole, scores.playerName);
  }

  async getCurrentPricing(): Promise<Pricing | undefined> {
    const [currentPricing] = await db.select().from(pricing)
      .orderBy(desc(pricing.updatedAt))
      .limit(1);
    return currentPricing || undefined;
  }

  async createPricing(insertPricing: InsertPricing): Promise<Pricing> {
    const [newPricing] = await db
      .insert(pricing)
      .values(insertPricing)
      .returning();
    return newPricing;
  }

  async getPricingHistory(): Promise<Pricing[]> {
    return await db.select().from(pricing)
      .orderBy(desc(pricing.updatedAt));
  }

  async getDailySales(date: Date): Promise<{ totalGames: number; totalRevenue: string; totalPlayers: number }> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [result] = await db
      .select({
        totalGames: sql<number>`count(*)::int`,
        totalRevenue: sql<string>`sum(${games.totalCost})::text`,
        totalPlayers: sql<number>`sum(${games.playerCount})::int`,
      })
      .from(games)
      .where(and(
        gte(games.completedAt, startOfDay),
        lte(games.completedAt, endOfDay)
      ));

    return {
      totalGames: result?.totalGames || 0,
      totalRevenue: result?.totalRevenue || "0",
      totalPlayers: result?.totalPlayers || 0,
    };
  }

  async getWeeklySales(startDate: Date): Promise<{ totalGames: number; totalRevenue: string; totalPlayers: number }> {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    const [result] = await db
      .select({
        totalGames: sql<number>`count(*)::int`,
        totalRevenue: sql<string>`sum(${games.totalCost})::text`,
        totalPlayers: sql<number>`sum(${games.playerCount})::int`,
      })
      .from(games)
      .where(and(
        gte(games.completedAt, startDate),
        lte(games.completedAt, endDate)
      ));

    return {
      totalGames: result?.totalGames || 0,
      totalRevenue: result?.totalRevenue || "0",
      totalPlayers: result?.totalPlayers || 0,
    };
  }

  async getMonthlySales(startDate: Date): Promise<{ totalGames: number; totalRevenue: string; totalPlayers: number }> {
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const [result] = await db
      .select({
        totalGames: sql<number>`count(*)::int`,
        totalRevenue: sql<string>`sum(${games.totalCost})::text`,
        totalPlayers: sql<number>`sum(${games.playerCount})::int`,
      })
      .from(games)
      .where(and(
        gte(games.completedAt, startDate),
        lte(games.completedAt, endDate)
      ));

    return {
      totalGames: result?.totalGames || 0,
      totalRevenue: result?.totalRevenue || "0",
      totalPlayers: result?.totalPlayers || 0,
    };
  }

  async getHourlySales(date: Date): Promise<Array<{ hour: number; games: number; revenue: string }>> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const results = await db
      .select({
        hour: sql<number>`extract(hour from ${games.completedAt})::int`,
        games: sql<number>`count(*)::int`,
        revenue: sql<string>`sum(${games.totalCost})::text`,
      })
      .from(games)
      .where(and(
        gte(games.completedAt, startOfDay),
        lte(games.completedAt, endOfDay)
      ))
      .groupBy(sql`extract(hour from ${games.completedAt})`)
      .orderBy(sql`extract(hour from ${games.completedAt})`);

    return results.map(r => ({
      hour: r.hour,
      games: r.games,
      revenue: r.revenue || "0"
    }));
  }

  async getSalesStats(startDate: Date, endDate: Date): Promise<{ totalGames: number; totalRevenue: string; totalPlayers: number }> {
    const [result] = await db
      .select({
        totalGames: sql<number>`count(*)::int`,
        totalRevenue: sql<string>`sum(${games.totalCost})::text`,
        totalPlayers: sql<number>`sum(${games.playerCount})::int`,
      })
      .from(games)
      .where(and(
        gte(games.completedAt, startDate),
        lte(games.completedAt, endDate)
      ));

    return {
      totalGames: result?.totalGames || 0,
      totalRevenue: result?.totalRevenue || "0",
      totalPlayers: result?.totalPlayers || 0,
    };
  }
}

export const storage = new DatabaseStorage();
