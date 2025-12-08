import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "node:http";
import session from "express-session";
import { storage } from "./storage";
import { insertUserSchema, loginSchema } from "@shared/schema";
import { z } from "zod";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

// Auth middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "glassify-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    })
  );

  // Seed initial data on startup
  await storage.seedInitialData();

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(data.username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }

      const user = await storage.createUser(data);
      req.session.userId = user.id;
      
      const { password, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.verifyPassword(data.email, data.password);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      req.session.userId = user.id;
      const { password, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.json({ user: null });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.json({ user: null });
    }

    const stats = await storage.getUserStats(user.id);
    const { password, ...safeUser } = user;
    res.json({ user: { ...safeUser, stats } });
  });

  app.patch("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(req.session.userId!, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Update failed" });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Items routes
  app.get("/api/items", async (req, res) => {
    try {
      const { limit, offset, categoryId, trending, recommended, search } = req.query;
      
      if (search && typeof search === "string") {
        const items = await storage.searchItems(search);
        return res.json(items);
      }

      const items = await storage.getItems({
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        categoryId: categoryId as string | undefined,
        isTrending: trending === "true" ? true : undefined,
        isRecommended: recommended === "true" ? true : undefined,
      });
      res.json(items);
    } catch (error) {
      console.error("Get items error:", error);
      res.status(500).json({ error: "Failed to fetch items" });
    }
  });

  app.get("/api/items/:id", async (req, res) => {
    try {
      const item = await storage.getItemById(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      
      // Include user interaction status if logged in
      if (req.session.userId) {
        const [isLiked, isBookmarked] = await Promise.all([
          storage.isItemLiked(req.session.userId, item.id),
          storage.isItemBookmarked(req.session.userId, item.id),
        ]);
        return res.json({ ...item, isLiked, isBookmarked });
      }
      
      res.json(item);
    } catch (error) {
      console.error("Get item error:", error);
      res.status(500).json({ error: "Failed to fetch item" });
    }
  });

  // Like routes
  app.post("/api/items/:id/like", requireAuth, async (req, res) => {
    try {
      await storage.likeItem(req.session.userId!, req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Like error:", error);
      res.status(500).json({ error: "Failed to like item" });
    }
  });

  app.delete("/api/items/:id/like", requireAuth, async (req, res) => {
    try {
      await storage.unlikeItem(req.session.userId!, req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Unlike error:", error);
      res.status(500).json({ error: "Failed to unlike item" });
    }
  });

  // Bookmark routes
  app.post("/api/items/:id/bookmark", requireAuth, async (req, res) => {
    try {
      await storage.bookmarkItem(req.session.userId!, req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Bookmark error:", error);
      res.status(500).json({ error: "Failed to bookmark item" });
    }
  });

  app.delete("/api/items/:id/bookmark", requireAuth, async (req, res) => {
    try {
      await storage.unbookmarkItem(req.session.userId!, req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Unbookmark error:", error);
      res.status(500).json({ error: "Failed to unbookmark item" });
    }
  });

  // User collections
  app.get("/api/me/likes", requireAuth, async (req, res) => {
    try {
      const items = await storage.getUserLikedItems(req.session.userId!);
      res.json(items);
    } catch (error) {
      console.error("Get liked items error:", error);
      res.status(500).json({ error: "Failed to fetch liked items" });
    }
  });

  app.get("/api/me/bookmarks", requireAuth, async (req, res) => {
    try {
      const items = await storage.getUserBookmarkedItems(req.session.userId!);
      res.json(items);
    } catch (error) {
      console.error("Get bookmarked items error:", error);
      res.status(500).json({ error: "Failed to fetch bookmarked items" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
