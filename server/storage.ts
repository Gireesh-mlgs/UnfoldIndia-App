import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  users,
  categories,
  items,
  userLikes,
  userBookmarks,
  userFollows,
  type User,
  type InsertUser,
  type Category,
  type Item,
} from "@shared/schema";
import { hash, compare } from "bcrypt";

const SALT_ROUNDS = 10;

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  verifyPassword(email: string, password: string): Promise<User | null>;
  getUserStats(userId: string): Promise<{ collections: number; favorites: number; following: number }>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  
  // Items
  getItems(options?: { limit?: number; offset?: number; categoryId?: string; isTrending?: boolean; isRecommended?: boolean }): Promise<Item[]>;
  getItemById(id: string): Promise<Item | undefined>;
  searchItems(query: string): Promise<Item[]>;
  
  // Likes
  likeItem(userId: string, itemId: string): Promise<void>;
  unlikeItem(userId: string, itemId: string): Promise<void>;
  isItemLiked(userId: string, itemId: string): Promise<boolean>;
  getUserLikedItems(userId: string): Promise<Item[]>;
  
  // Bookmarks
  bookmarkItem(userId: string, itemId: string): Promise<void>;
  unbookmarkItem(userId: string, itemId: string): Promise<void>;
  isItemBookmarked(userId: string, itemId: string): Promise<boolean>;
  getUserBookmarkedItems(userId: string): Promise<Item[]>;
  
  // Follows
  followUser(followerId: string, followingId: string): Promise<void>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  
  // Seed
  seedInitialData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await hash(insertUser.password, SALT_ROUNDS);
    const [user] = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
    }).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    const isValid = await compare(password, user.password);
    return isValid ? user : null;
  }

  async getUserStats(userId: string): Promise<{ collections: number; favorites: number; following: number }> {
    const [likesResult] = await db.select({ count: sql<number>`count(*)` }).from(userLikes).where(eq(userLikes.userId, userId));
    const [bookmarksResult] = await db.select({ count: sql<number>`count(*)` }).from(userBookmarks).where(eq(userBookmarks.userId, userId));
    const [followingResult] = await db.select({ count: sql<number>`count(*)` }).from(userFollows).where(eq(userFollows.followerId, userId));
    
    return {
      collections: Number(bookmarksResult?.count || 0),
      favorites: Number(likesResult?.count || 0),
      following: Number(followingResult?.count || 0),
    };
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(categories.sortOrder);
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  // Items
  async getItems(options?: { limit?: number; offset?: number; categoryId?: string; isTrending?: boolean; isRecommended?: boolean }): Promise<Item[]> {
    let query = db.select().from(items);
    
    const conditions = [];
    if (options?.categoryId) {
      conditions.push(eq(items.categoryId, options.categoryId));
    }
    if (options?.isTrending !== undefined) {
      conditions.push(eq(items.isTrending, options.isTrending));
    }
    if (options?.isRecommended !== undefined) {
      conditions.push(eq(items.isRecommended, options.isRecommended));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    
    query = query.orderBy(desc(items.createdAt)) as typeof query;
    
    if (options?.limit) {
      query = query.limit(options.limit) as typeof query;
    }
    if (options?.offset) {
      query = query.offset(options.offset) as typeof query;
    }
    
    return query;
  }

  async getItemById(id: string): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item;
  }

  async searchItems(query: string): Promise<Item[]> {
    return db.select().from(items).where(
      sql`${items.title} ILIKE ${'%' + query + '%'} OR ${items.description} ILIKE ${'%' + query + '%'}`
    );
  }

  // Likes
  async likeItem(userId: string, itemId: string): Promise<void> {
    await db.insert(userLikes).values({ userId, itemId }).onConflictDoNothing();
    await db.update(items).set({ likesCount: sql`${items.likesCount} + 1` }).where(eq(items.id, itemId));
  }

  async unlikeItem(userId: string, itemId: string): Promise<void> {
    const result = await db.delete(userLikes).where(and(eq(userLikes.userId, userId), eq(userLikes.itemId, itemId))).returning();
    if (result.length > 0) {
      await db.update(items).set({ likesCount: sql`GREATEST(${items.likesCount} - 1, 0)` }).where(eq(items.id, itemId));
    }
  }

  async isItemLiked(userId: string, itemId: string): Promise<boolean> {
    const [like] = await db.select().from(userLikes).where(and(eq(userLikes.userId, userId), eq(userLikes.itemId, itemId)));
    return !!like;
  }

  async getUserLikedItems(userId: string): Promise<Item[]> {
    return db.select({ 
      id: items.id,
      title: items.title,
      subtitle: items.subtitle,
      description: items.description,
      imageUrl: items.imageUrl,
      categoryId: items.categoryId,
      gradientStart: items.gradientStart,
      gradientEnd: items.gradientEnd,
      rating: items.rating,
      isTrending: items.isTrending,
      isRecommended: items.isRecommended,
      likesCount: items.likesCount,
      bookmarksCount: items.bookmarksCount,
      createdAt: items.createdAt,
    }).from(userLikes).innerJoin(items, eq(userLikes.itemId, items.id)).where(eq(userLikes.userId, userId));
  }

  // Bookmarks
  async bookmarkItem(userId: string, itemId: string): Promise<void> {
    await db.insert(userBookmarks).values({ userId, itemId }).onConflictDoNothing();
    await db.update(items).set({ bookmarksCount: sql`${items.bookmarksCount} + 1` }).where(eq(items.id, itemId));
  }

  async unbookmarkItem(userId: string, itemId: string): Promise<void> {
    const result = await db.delete(userBookmarks).where(and(eq(userBookmarks.userId, userId), eq(userBookmarks.itemId, itemId))).returning();
    if (result.length > 0) {
      await db.update(items).set({ bookmarksCount: sql`GREATEST(${items.bookmarksCount} - 1, 0)` }).where(eq(items.id, itemId));
    }
  }

  async isItemBookmarked(userId: string, itemId: string): Promise<boolean> {
    const [bookmark] = await db.select().from(userBookmarks).where(and(eq(userBookmarks.userId, userId), eq(userBookmarks.itemId, itemId)));
    return !!bookmark;
  }

  async getUserBookmarkedItems(userId: string): Promise<Item[]> {
    return db.select({
      id: items.id,
      title: items.title,
      subtitle: items.subtitle,
      description: items.description,
      imageUrl: items.imageUrl,
      categoryId: items.categoryId,
      gradientStart: items.gradientStart,
      gradientEnd: items.gradientEnd,
      rating: items.rating,
      isTrending: items.isTrending,
      isRecommended: items.isRecommended,
      likesCount: items.likesCount,
      bookmarksCount: items.bookmarksCount,
      createdAt: items.createdAt,
    }).from(userBookmarks).innerJoin(items, eq(userBookmarks.itemId, items.id)).where(eq(userBookmarks.userId, userId));
  }

  // Follows
  async followUser(followerId: string, followingId: string): Promise<void> {
    await db.insert(userFollows).values({ followerId, followingId }).onConflictDoNothing();
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await db.delete(userFollows).where(and(eq(userFollows.followerId, followerId), eq(userFollows.followingId, followingId)));
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [follow] = await db.select().from(userFollows).where(and(eq(userFollows.followerId, followerId), eq(userFollows.followingId, followingId)));
    return !!follow;
  }

  // Seed initial data
  async seedInitialData(): Promise<void> {
    // Check if already seeded
    const existingCategories = await db.select().from(categories);
    if (existingCategories.length > 0) return;

    // Seed categories
    const categoryData = [
      { name: "All", gradientStart: "#8B5CF6", gradientEnd: "#3B82F6", sortOrder: 0 },
      { name: "Art", gradientStart: "#EC4899", gradientEnd: "#8B5CF6", sortOrder: 1 },
      { name: "Music", gradientStart: "#3B82F6", gradientEnd: "#06B6D4", sortOrder: 2 },
      { name: "Design", gradientStart: "#F59E0B", gradientEnd: "#EF4444", sortOrder: 3 },
      { name: "Tech", gradientStart: "#10B981", gradientEnd: "#3B82F6", sortOrder: 4 },
      { name: "Nature", gradientStart: "#06B6D4", gradientEnd: "#10B981", sortOrder: 5 },
    ];
    
    const insertedCategories = await db.insert(categories).values(categoryData).returning();
    const categoryMap = new Map(insertedCategories.map((c: Category) => [c.name, c.id]));

    // Seed items
    const itemData = [
      { title: "Neon Nights", subtitle: "Premium Collection", description: "Experience the vibrant glow of the city at night.", imageUrl: "https://picsum.photos/seed/neon/400/300", gradientStart: "#8B5CF6", gradientEnd: "#EC4899", categoryId: categoryMap.get("Art"), isTrending: true, rating: 49 },
      { title: "Ocean Breeze", subtitle: "Nature Series", description: "Immerse yourself in the calming sounds of the ocean.", imageUrl: "https://picsum.photos/seed/ocean/400/300", gradientStart: "#3B82F6", gradientEnd: "#06B6D4", categoryId: categoryMap.get("Nature"), isTrending: true, rating: 47 },
      { title: "Golden Hour", subtitle: "Exclusive Drop", description: "Capture the magic of sunset in every moment.", imageUrl: "https://picsum.photos/seed/golden/400/300", gradientStart: "#F59E0B", gradientEnd: "#EF4444", categoryId: categoryMap.get("Art"), isTrending: true, rating: 48 },
      { title: "Mystic Forest", subtitle: "Limited Edition", description: "Journey through enchanted woodland realms.", imageUrl: "https://picsum.photos/seed/forest/400/300", gradientStart: "#10B981", gradientEnd: "#3B82F6", categoryId: categoryMap.get("Nature"), isTrending: true, rating: 46 },
      { title: "Abstract Dreams", subtitle: "Art Collection", description: "A curated collection of abstract art pieces that inspire creativity and wonder.", imageUrl: "https://picsum.photos/seed/abstract/400/400", categoryId: categoryMap.get("Art"), isRecommended: true, rating: 49 },
      { title: "Digital Harmony", subtitle: "Tech Fusion", description: "Explore the intersection of technology and design in this unique experience.", imageUrl: "https://picsum.photos/seed/digital/400/400", categoryId: categoryMap.get("Tech"), isRecommended: true, rating: 47 },
      { title: "Zen Garden", subtitle: "Wellness Journey", description: "Find your inner peace with this calming meditation journey.", imageUrl: "https://picsum.photos/seed/zen/400/400", categoryId: categoryMap.get("Nature"), isRecommended: true, rating: 48 },
      { title: "Urban Explorer", subtitle: "City Adventures", description: "Discover hidden gems in cities around the world with local guides.", imageUrl: "https://picsum.photos/seed/urban/400/400", categoryId: categoryMap.get("Design"), isRecommended: true, rating: 46 },
      { title: "Cosmic Voyage", subtitle: "Space Art", description: "Travel through the cosmos with stunning visuals.", imageUrl: "https://picsum.photos/seed/cosmic/400/400", categoryId: categoryMap.get("Art"), rating: 45 },
      { title: "Electric Dreams", subtitle: "Synth Music", description: "Retro-futuristic sounds for the modern listener.", imageUrl: "https://picsum.photos/seed/electric/400/400", categoryId: categoryMap.get("Music"), rating: 44 },
      { title: "Future Vision", subtitle: "Design Concepts", description: "Preview tomorrow's design trends today.", imageUrl: "https://picsum.photos/seed/future/400/400", categoryId: categoryMap.get("Design"), rating: 43 },
      { title: "Neural Network", subtitle: "AI Art", description: "Art created by artificial intelligence.", imageUrl: "https://picsum.photos/seed/neural/400/400", categoryId: categoryMap.get("Tech"), rating: 47 },
      { title: "Aurora Lights", subtitle: "Natural Wonder", description: "Witness the magic of the northern lights.", imageUrl: "https://picsum.photos/seed/aurora/400/400", categoryId: categoryMap.get("Nature"), rating: 49 },
      { title: "Crystal Cave", subtitle: "Mineral Art", description: "Explore the beauty of crystalline formations.", imageUrl: "https://picsum.photos/seed/crystal/400/400", categoryId: categoryMap.get("Art"), rating: 45 },
      { title: "Synth Wave", subtitle: "Electronic Beats", description: "Dive into the world of synthwave music.", imageUrl: "https://picsum.photos/seed/synth/400/400", categoryId: categoryMap.get("Music"), rating: 46 },
      { title: "Minimal Space", subtitle: "Clean Design", description: "Less is more in this minimalist collection.", imageUrl: "https://picsum.photos/seed/minimal/400/400", categoryId: categoryMap.get("Design"), rating: 44 },
    ];

    await db.insert(items).values(itemData);
  }
}

export const storage = new DatabaseStorage();
