import { db } from "./db";
import { eq, and, desc, sql, ilike, or } from "drizzle-orm";
import {
  users,
  categories,
  places,
  items,
  userLikes,
  userBookmarks,
  savedPlaces,
  userFollows,
  type User,
  type InsertUser,
  type Category,
  type Place,
  type Item,
} from "@shared/schema";
import { hash, compare } from "bcrypt";

const SALT_ROUNDS = 10;

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  verifyPassword(email: string, password: string): Promise<User | null>;
  getUserStats(userId: string): Promise<{ collections: number; favorites: number; following: number }>;
  
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  
  getPlaces(options?: { limit?: number; offset?: number; categoryId?: string; isTrending?: boolean; isRecommended?: boolean; isHiddenGem?: boolean; neighborhood?: string }): Promise<Place[]>;
  getPlaceById(id: string): Promise<Place | undefined>;
  searchPlaces(query: string): Promise<Place[]>;
  
  savePlace(userId: string, placeId: string): Promise<void>;
  unsavePlace(userId: string, placeId: string): Promise<void>;
  isPlaceSaved(userId: string, placeId: string): Promise<boolean>;
  getUserSavedPlaces(userId: string): Promise<Place[]>;
  
  getItems(options?: { limit?: number; offset?: number; categoryId?: string; isTrending?: boolean; isRecommended?: boolean }): Promise<Item[]>;
  getItemById(id: string): Promise<Item | undefined>;
  searchItems(query: string): Promise<Item[]>;
  
  likeItem(userId: string, itemId: string): Promise<void>;
  unlikeItem(userId: string, itemId: string): Promise<void>;
  isItemLiked(userId: string, itemId: string): Promise<boolean>;
  getUserLikedItems(userId: string): Promise<Item[]>;
  
  bookmarkItem(userId: string, itemId: string): Promise<void>;
  unbookmarkItem(userId: string, itemId: string): Promise<void>;
  isItemBookmarked(userId: string, itemId: string): Promise<boolean>;
  getUserBookmarkedItems(userId: string): Promise<Item[]>;
  
  followUser(followerId: string, followingId: string): Promise<void>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  
  seedInitialData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
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
    const [savedResult] = await db.select({ count: sql<number>`count(*)` }).from(savedPlaces).where(eq(savedPlaces.userId, userId));
    const [likesResult] = await db.select({ count: sql<number>`count(*)` }).from(userLikes).where(eq(userLikes.userId, userId));
    const [followingResult] = await db.select({ count: sql<number>`count(*)` }).from(userFollows).where(eq(userFollows.followerId, userId));
    
    return {
      collections: Number(savedResult?.count || 0),
      favorites: Number(likesResult?.count || 0),
      following: Number(followingResult?.count || 0),
    };
  }

  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(categories.sortOrder);
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getPlaces(options?: { limit?: number; offset?: number; categoryId?: string; isTrending?: boolean; isRecommended?: boolean; isHiddenGem?: boolean; neighborhood?: string }): Promise<Place[]> {
    let query = db.select().from(places);
    
    const conditions = [];
    if (options?.categoryId) {
      conditions.push(eq(places.categoryId, options.categoryId));
    }
    if (options?.isTrending !== undefined) {
      conditions.push(eq(places.isTrending, options.isTrending));
    }
    if (options?.isRecommended !== undefined) {
      conditions.push(eq(places.isRecommended, options.isRecommended));
    }
    if (options?.isHiddenGem !== undefined) {
      conditions.push(eq(places.isHiddenGem, options.isHiddenGem));
    }
    if (options?.neighborhood) {
      conditions.push(eq(places.neighborhood, options.neighborhood));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    
    query = query.orderBy(desc(places.createdAt)) as typeof query;
    
    if (options?.limit) {
      query = query.limit(options.limit) as typeof query;
    }
    if (options?.offset) {
      query = query.offset(options.offset) as typeof query;
    }
    
    return query;
  }

  async getPlaceById(id: string): Promise<Place | undefined> {
    const [place] = await db.select().from(places).where(eq(places.id, id));
    return place;
  }

  async searchPlaces(query: string): Promise<Place[]> {
    const searchTerm = `%${query}%`;
    return db.select().from(places).where(
      or(
        ilike(places.title, searchTerm),
        ilike(places.description, searchTerm),
        ilike(places.neighborhood, searchTerm)
      )
    );
  }

  async savePlace(userId: string, placeId: string): Promise<void> {
    await db.insert(savedPlaces).values({ userId, placeId }).onConflictDoNothing();
    await db.update(places).set({ bookmarksCount: sql`${places.bookmarksCount} + 1` }).where(eq(places.id, placeId));
  }

  async unsavePlace(userId: string, placeId: string): Promise<void> {
    const result = await db.delete(savedPlaces).where(and(eq(savedPlaces.userId, userId), eq(savedPlaces.placeId, placeId))).returning();
    if (result.length > 0) {
      await db.update(places).set({ bookmarksCount: sql`GREATEST(${places.bookmarksCount} - 1, 0)` }).where(eq(places.id, placeId));
    }
  }

  async isPlaceSaved(userId: string, placeId: string): Promise<boolean> {
    const [saved] = await db.select().from(savedPlaces).where(and(eq(savedPlaces.userId, userId), eq(savedPlaces.placeId, placeId)));
    return !!saved;
  }

  async getUserSavedPlaces(userId: string): Promise<Place[]> {
    return db.select({
      id: places.id,
      title: places.title,
      subtitle: places.subtitle,
      description: places.description,
      imageUrl: places.imageUrl,
      categoryId: places.categoryId,
      neighborhood: places.neighborhood,
      address: places.address,
      latitude: places.latitude,
      longitude: places.longitude,
      hours: places.hours,
      entryFee: places.entryFee,
      bestTimeToVisit: places.bestTimeToVisit,
      localTip: places.localTip,
      gradientStart: places.gradientStart,
      gradientEnd: places.gradientEnd,
      rating: places.rating,
      isTrending: places.isTrending,
      isRecommended: places.isRecommended,
      isHiddenGem: places.isHiddenGem,
      isFamilyFriendly: places.isFamilyFriendly,
      isBudgetFriendly: places.isBudgetFriendly,
      likesCount: places.likesCount,
      bookmarksCount: places.bookmarksCount,
      tags: places.tags,
      createdAt: places.createdAt,
    }).from(savedPlaces).innerJoin(places, eq(savedPlaces.placeId, places.id)).where(eq(savedPlaces.userId, userId));
  }

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

  async seedInitialData(): Promise<void> {
    const existingCategories = await db.select().from(categories);
    if (existingCategories.length > 0) return;

    const categoryData = [
      { name: "All", icon: "grid", gradientStart: "#F5A623", gradientEnd: "#D4890F", sortOrder: 0 },
      { name: "Food", icon: "coffee", gradientStart: "#F5A623", gradientEnd: "#FF6B35", sortOrder: 1 },
      { name: "Culture", icon: "book-open", gradientStart: "#8B5CF6", gradientEnd: "#6366F1", sortOrder: 2 },
      { name: "Nature", icon: "sun", gradientStart: "#22C55E", gradientEnd: "#10B981", sortOrder: 3 },
      { name: "Nightlife", icon: "moon", gradientStart: "#EC4899", gradientEnd: "#F43F5E", sortOrder: 4 },
      { name: "Shopping", icon: "shopping-bag", gradientStart: "#3B82F6", gradientEnd: "#06B6D4", sortOrder: 5 },
      { name: "Experiences", icon: "star", gradientStart: "#F59E0B", gradientEnd: "#EF4444", sortOrder: 6 },
    ];
    
    const insertedCategories = await db.insert(categories).values(categoryData).returning();
    const categoryMap = new Map(insertedCategories.map((c: Category) => [c.name, c.id]));

    const placesData = [
      { title: "Hauz Khas Village", subtitle: "Art & Cafe Hub", description: "A bohemian neighborhood featuring art galleries, boutiques, and rooftop cafes overlooking the historic Hauz Khas lake and ruins.", imageUrl: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800", gradientStart: "#8B5CF6", gradientEnd: "#6366F1", categoryId: categoryMap.get("Culture"), neighborhood: "Hauz Khas", isTrending: true, isHiddenGem: false, rating: 47, localTip: "Visit around sunset for stunning views of the lake from the rooftop cafes.", tags: ["culture", "food", "nightlife"] },
      { title: "Chandni Chowk", subtitle: "Old Delhi Heritage", description: "One of the oldest and busiest markets in Old Delhi, famous for street food, spices, and traditional crafts.", imageUrl: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800", gradientStart: "#F5A623", gradientEnd: "#FF6B35", categoryId: categoryMap.get("Food"), neighborhood: "Old Delhi", isTrending: true, isHiddenGem: false, rating: 48, localTip: "Try the legendary paranthas at Paranthe Wali Gali - arrive before 11 AM to avoid crowds.", tags: ["food", "shopping", "culture"] },
      { title: "Lodhi Gardens", subtitle: "Historic Green Oasis", description: "Beautiful 90-acre park featuring 15th century tombs of Sayyid and Lodi dynasty rulers, perfect for morning walks.", imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800", gradientStart: "#22C55E", gradientEnd: "#10B981", categoryId: categoryMap.get("Nature"), neighborhood: "Lodhi Colony", isTrending: true, isRecommended: true, rating: 49, localTip: "Best visited at sunrise or sunset. The Bada Gumbad area is usually less crowded.", tags: ["nature", "culture", "family"] },
      { title: "Nanha Park", subtitle: "Colonial Hidden Gem", description: "A quiet colonial-era pocket near Lodhi Garden with artisan stalls and vintage charm away from the crowds.", imageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800", gradientStart: "#10B981", gradientEnd: "#22C55E", categoryId: categoryMap.get("Nature"), neighborhood: "Lodhi Colony", isHiddenGem: true, isRecommended: true, isBudgetFriendly: true, rating: 44, localTip: "Look for the handmade pottery stalls near the east entrance.", tags: ["nature", "shopping"] },
      { title: "Hauz Khas Hidden Alley", subtitle: "Secret Rooftop Cafes", description: "Rooftop cafes with spectacular lake views away from the main crowds of Hauz Khas Village.", imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800", gradientStart: "#EC4899", gradientEnd: "#F43F5E", categoryId: categoryMap.get("Nightlife"), neighborhood: "Hauz Khas", isHiddenGem: true, rating: 46, localTip: "Take the narrow lane beside the main entrance for quieter spots with better views.", tags: ["nightlife", "food"] },
      { title: "Stepwells of Mehrauli", subtitle: "Restored Baolis", description: "Small restored baolis (stepwells) off the beaten path, showcasing stunning medieval water architecture.", imageUrl: "https://images.unsplash.com/photo-1590766740615-324b8d5ff6e1?w=800", gradientStart: "#8B5CF6", gradientEnd: "#6366F1", categoryId: categoryMap.get("Culture"), neighborhood: "Mehrauli", isHiddenGem: true, isRecommended: true, isBudgetFriendly: true, rating: 45, localTip: "Rajon ki Baoli is the most photogenic, visit during golden hour.", tags: ["culture", "nature"] },
      { title: "Khan Market", subtitle: "Premium Shopping", description: "Delhi's most upscale market featuring designer boutiques, bookstores, and gourmet restaurants.", imageUrl: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800", gradientStart: "#3B82F6", gradientEnd: "#06B6D4", categoryId: categoryMap.get("Shopping"), neighborhood: "Khan Market", isTrending: true, rating: 46, localTip: "Visit Full Circle Bookstore for rare finds and cozy reading nooks.", tags: ["shopping", "food"] },
      { title: "Paharganj Street Food", subtitle: "Budget Foodie Paradise", description: "Local favourites at pocket-friendly prices in this backpacker's haven with authentic Delhi street food.", imageUrl: "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=800", gradientStart: "#F5A623", gradientEnd: "#D4890F", categoryId: categoryMap.get("Food"), neighborhood: "Paharganj", isHiddenGem: true, isBudgetFriendly: true, rating: 43, localTip: "Try the chole bhature at the small shop near Imperial Cinema entrance.", tags: ["food", "budget"] },
      { title: "Connaught Place", subtitle: "Colonial Architecture", description: "Iconic circular marketplace built in the 1930s, featuring Georgian-style architecture and vibrant nightlife.", imageUrl: "https://images.unsplash.com/photo-1597040663342-45b6af3d91a5?w=800", gradientStart: "#24314A", gradientEnd: "#1E3A5F", categoryId: categoryMap.get("Experiences"), neighborhood: "Connaught Place", isTrending: true, isFamilyFriendly: true, rating: 47, localTip: "Walk through the inner circle at night for beautifully lit colonial architecture.", tags: ["culture", "shopping", "nightlife"] },
      { title: "Dilli Haat", subtitle: "Craft & Food Festival", description: "Open-air bazaar showcasing handicrafts and cuisines from all Indian states in one location.", imageUrl: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800", gradientStart: "#F59E0B", gradientEnd: "#EF4444", categoryId: categoryMap.get("Experiences"), neighborhood: "INA", isRecommended: true, isFamilyFriendly: true, rating: 45, localTip: "Visit during regional cultural festivals for special performances and food stalls.", tags: ["shopping", "food", "culture", "family"] },
      { title: "Cyber Hub Gurgaon", subtitle: "Modern Entertainment", description: "Trendy complex with premium restaurants, bars, and live entertainment in Gurgaon's tech hub.", imageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800", gradientStart: "#EC4899", gradientEnd: "#8B5CF6", categoryId: categoryMap.get("Nightlife"), neighborhood: "Gurugram", isTrending: true, rating: 44, localTip: "Happy hours start at 5 PM at most venues. Book weekend tables in advance.", tags: ["nightlife", "food"] },
      { title: "Qutub Minar Complex", subtitle: "UNESCO Heritage Site", description: "12th century UNESCO World Heritage Site featuring India's tallest minaret and stunning Indo-Islamic architecture.", imageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800", gradientStart: "#D4890F", gradientEnd: "#F5A623", categoryId: categoryMap.get("Culture"), neighborhood: "Mehrauli", isTrending: true, isFamilyFriendly: true, rating: 49, entryFee: "INR 35 (Indians), INR 550 (Foreigners)", hours: "7 AM - 5 PM", bestTimeToVisit: "Early morning or late afternoon", localTip: "The Iron Pillar is rust-free for 1600+ years - a metallurgical marvel!", tags: ["culture", "family"] },
    ];

    await db.insert(places).values(placesData);
  }
}

export const storage = new DatabaseStorage();
