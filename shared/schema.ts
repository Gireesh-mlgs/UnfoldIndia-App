import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  hasCompletedOnboarding: boolean("has_completed_onboarding").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  gradientStart: text("gradient_start").notNull(),
  gradientEnd: text("gradient_end").notNull(),
  sortOrder: integer("sort_order").default(0),
});

export const items = pgTable("items", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  categoryId: varchar("category_id").references(() => categories.id),
  gradientStart: text("gradient_start"),
  gradientEnd: text("gradient_end"),
  rating: integer("rating").default(0),
  isTrending: boolean("is_trending").default(false),
  isRecommended: boolean("is_recommended").default(false),
  likesCount: integer("likes_count").default(0),
  bookmarksCount: integer("bookmarks_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userLikes = pgTable("user_likes", {
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  itemId: varchar("item_id").notNull().references(() => items.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.itemId] })
]);

export const userBookmarks = pgTable("user_bookmarks", {
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  itemId: varchar("item_id").notNull().references(() => items.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.itemId] })
]);

export const userFollows = pgTable("user_follows", {
  followerId: varchar("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  followingId: varchar("following_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.followerId, table.followingId] })
]);

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  displayName: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  gradientStart: true,
  gradientEnd: true,
  sortOrder: true,
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
  createdAt: true,
  likesCount: true,
  bookmarksCount: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Item = typeof items.$inferSelect;
export type UserLike = typeof userLikes.$inferSelect;
export type UserBookmark = typeof userBookmarks.$inferSelect;
