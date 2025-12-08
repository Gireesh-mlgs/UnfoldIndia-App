import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/query-client";

export interface Item {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string;
  categoryId: string | null;
  gradientStart: string | null;
  gradientEnd: string | null;
  rating: number | null;
  isTrending: boolean | null;
  isRecommended: boolean | null;
  likesCount: number | null;
  bookmarksCount: number | null;
  createdAt: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface Category {
  id: string;
  name: string;
  gradientStart: string;
  gradientEnd: string;
  sortOrder: number | null;
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
}

export function useItems(options?: {
  limit?: number;
  offset?: number;
  categoryId?: string;
  trending?: boolean;
  recommended?: boolean;
  search?: string;
}) {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", options.limit.toString());
  if (options?.offset) params.set("offset", options.offset.toString());
  if (options?.categoryId && options.categoryId !== "all") params.set("categoryId", options.categoryId);
  if (options?.trending) params.set("trending", "true");
  if (options?.recommended) params.set("recommended", "true");
  if (options?.search) params.set("search", options.search);

  const queryString = params.toString();
  const queryKey = queryString ? `/api/items?${queryString}` : "/api/items";

  return useQuery<Item[]>({
    queryKey: [queryKey],
  });
}

export function useTrendingItems() {
  return useItems({ trending: true, limit: 10 });
}

export function useRecommendedItems() {
  return useItems({ recommended: true, limit: 10 });
}

export function useItem(id: string) {
  return useQuery<Item>({
    queryKey: ["/api/items", id],
    enabled: !!id,
  });
}

export function useLikeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      await apiRequest(`/api/items/${itemId}/like`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/me/likes"] });
    },
  });
}

export function useUnlikeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      await apiRequest(`/api/items/${itemId}/like`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/me/likes"] });
    },
  });
}

export function useBookmarkItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      await apiRequest(`/api/items/${itemId}/bookmark`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/me/bookmarks"] });
    },
  });
}

export function useUnbookmarkItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      await apiRequest(`/api/items/${itemId}/bookmark`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/me/bookmarks"] });
    },
  });
}

export function useUserLikedItems() {
  return useQuery<Item[]>({
    queryKey: ["/api/me/likes"],
  });
}

export function useUserBookmarkedItems() {
  return useQuery<Item[]>({
    queryKey: ["/api/me/bookmarks"],
  });
}
