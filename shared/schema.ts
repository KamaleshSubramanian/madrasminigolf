import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: varchar("player_id").notNull().references(() => players.id),
  playerNames: text("player_names").array().notNull(),
  playerCount: integer("player_count").notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  isWeekend: boolean("is_weekend").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const scores = pgTable("scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull().references(() => games.id),
  playerName: text("player_name").notNull(),
  hole: integer("hole").notNull(),
  strokes: integer("strokes").notNull(),
});

export const pricing = pgTable("pricing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  weekdayPrice: decimal("weekday_price", { precision: 10, scale: 2 }).notNull(),
  weekendPrice: decimal("weekend_price", { precision: 10, scale: 2 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: varchar("updated_by").notNull().references(() => users.id),
});

// Relations
export const playersRelations = relations(players, ({ many }) => ({
  games: many(games),
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
  player: one(players, {
    fields: [games.playerId],
    references: [players.id],
  }),
  scores: many(scores),
}));

export const scoresRelations = relations(scores, ({ one }) => ({
  game: one(games, {
    fields: [scores.gameId],
    references: [games.id],
  }),
}));

export const pricingRelations = relations(pricing, ({ one }) => ({
  updatedByUser: one(users, {
    fields: [pricing.updatedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  createdAt: true,
});

export const insertGameSchema = createInsertSchema(games, {
  playerNames: z.array(z.string()).min(1),
  playerCount: z.number().int().min(1).max(8),
  isWeekend: z.boolean(),
}).omit({
  id: true,
  completedAt: true,
  totalCost: true,
});

export const insertScoreSchema = createInsertSchema(scores).omit({
  id: true,
});

export const insertPricingSchema = createInsertSchema(pricing).omit({
  id: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;

export type Score = typeof scores.$inferSelect;
export type InsertScore = z.infer<typeof insertScoreSchema>;

export type Pricing = typeof pricing.$inferSelect;
export type InsertPricing = z.infer<typeof insertPricingSchema>;
