export interface TrendingItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  gradient: readonly [string, string];
}

export interface RecommendedItem {
  id: string;
  title: string;
  description: string;
  category: string;
  rating: number;
}

export interface ExploreItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
}

export interface Category {
  id: string;
  name: string;
  gradient: readonly [string, string];
}

export const trendingItems: TrendingItem[] = [
  {
    id: "1",
    title: "Neon Nights",
    subtitle: "Premium Collection",
    imageUrl: "https://picsum.photos/seed/neon/400/300",
    gradient: ["#8B5CF6", "#EC4899"],
  },
  {
    id: "2",
    title: "Ocean Breeze",
    subtitle: "Nature Series",
    imageUrl: "https://picsum.photos/seed/ocean/400/300",
    gradient: ["#3B82F6", "#06B6D4"],
  },
  {
    id: "3",
    title: "Golden Hour",
    subtitle: "Exclusive Drop",
    imageUrl: "https://picsum.photos/seed/golden/400/300",
    gradient: ["#F59E0B", "#EF4444"],
  },
  {
    id: "4",
    title: "Mystic Forest",
    subtitle: "Limited Edition",
    imageUrl: "https://picsum.photos/seed/forest/400/300",
    gradient: ["#10B981", "#3B82F6"],
  },
];

export const recommendedItems: RecommendedItem[] = [
  {
    id: "1",
    title: "Abstract Dreams",
    description: "A curated collection of abstract art pieces that inspire creativity and wonder.",
    category: "Art",
    rating: 4.9,
  },
  {
    id: "2",
    title: "Digital Harmony",
    description: "Explore the intersection of technology and design in this unique experience.",
    category: "Technology",
    rating: 4.7,
  },
  {
    id: "3",
    title: "Zen Garden",
    description: "Find your inner peace with this calming meditation journey.",
    category: "Wellness",
    rating: 4.8,
  },
  {
    id: "4",
    title: "Urban Explorer",
    description: "Discover hidden gems in cities around the world with local guides.",
    category: "Travel",
    rating: 4.6,
  },
];

export const categories: Category[] = [
  { id: "1", name: "All", gradient: ["#8B5CF6", "#3B82F6"] },
  { id: "2", name: "Art", gradient: ["#EC4899", "#8B5CF6"] },
  { id: "3", name: "Music", gradient: ["#3B82F6", "#06B6D4"] },
  { id: "4", name: "Design", gradient: ["#F59E0B", "#EF4444"] },
  { id: "5", name: "Tech", gradient: ["#10B981", "#3B82F6"] },
  { id: "6", name: "Nature", gradient: ["#06B6D4", "#10B981"] },
];

export const exploreItems: ExploreItem[] = [
  { id: "1", title: "Cosmic Voyage", category: "Art", imageUrl: "https://picsum.photos/seed/cosmic/400/400" },
  { id: "2", title: "Electric Dreams", category: "Music", imageUrl: "https://picsum.photos/seed/electric/400/400" },
  { id: "3", title: "Future Vision", category: "Design", imageUrl: "https://picsum.photos/seed/future/400/400" },
  { id: "4", title: "Neural Network", category: "Tech", imageUrl: "https://picsum.photos/seed/neural/400/400" },
  { id: "5", title: "Aurora Lights", category: "Nature", imageUrl: "https://picsum.photos/seed/aurora/400/400" },
  { id: "6", title: "Crystal Cave", category: "Art", imageUrl: "https://picsum.photos/seed/crystal/400/400" },
  { id: "7", title: "Synth Wave", category: "Music", imageUrl: "https://picsum.photos/seed/synth/400/400" },
  { id: "8", title: "Minimal Space", category: "Design", imageUrl: "https://picsum.photos/seed/minimal/400/400" },
];

export const userStats = {
  collections: "24",
  favorites: "156",
  following: "89",
};
