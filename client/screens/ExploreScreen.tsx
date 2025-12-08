import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { SearchBar } from "@/components/SearchBar";
import { CategoryChip } from "@/components/CategoryChip";
import { Spacing, BorderRadius, Shadows, Gradients } from "@/constants/theme";
import { useCategories, useItems, Item, Category } from "@/hooks/useItems";

const { width } = Dimensions.get("window");
const GRID_GAP = Spacing.md;
const CARD_WIDTH = (width - Spacing.lg * 2 - GRID_GAP) / 2;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ExploreCard({ item, index }: { item: Item; index: number }) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(
      index * 80,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) })
    );
    scale.value = withDelay(
      index * 80,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.2)) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value * pressScale.value }],
  }));

  const handlePressIn = () => {
    pressScale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.exploreCard, Shadows.glass, animatedStyle]}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.exploreImage}
        contentFit="cover"
        transition={300}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)"]}
        style={styles.exploreOverlay}
      />
      <View style={styles.exploreContent}>
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={20}
            tint="dark"
            style={[StyleSheet.absoluteFill, { borderRadius: BorderRadius.md }]}
          />
        ) : null}
        <View style={styles.exploreTextContainer}>
          <ThemedText
            type="small"
            style={styles.exploreCategory}
            lightColor="rgba(255,255,255,0.8)"
            darkColor="rgba(255,255,255,0.8)"
          >
            {item.subtitle || "Collection"}
          </ThemedText>
          <ThemedText
            type="h4"
            style={styles.exploreTitle}
            lightColor="#FFFFFF"
            darkColor="#FFFFFF"
          >
            {item.title}
          </ThemedText>
        </View>
      </View>
    </AnimatedPressable>
  );
}

function LoadingPlaceholder() {
  const { theme } = useTheme();
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.tint} />
    </View>
  );
}

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { data: categories, isLoading: categoriesLoading, refetch: refetchCategories } = useCategories();
  const { data: allItems, isLoading: itemsLoading, refetch: refetchItems } = useItems({ limit: 50 });

  const filteredItems = useMemo(() => {
    if (!allItems) return [];
    
    return allItems.filter((item) => {
      const matchesSearch = searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = !activeCategory || 
        activeCategory === "all" || 
        item.categoryId === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [allItems, searchQuery, activeCategory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchCategories(), refetchItems()]);
    setRefreshing(false);
  }, [refetchCategories, refetchItems]);

  const handleCategoryPress = (id: string) => {
    setActiveCategory(activeCategory === id ? null : id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const isLoading = categoriesLoading || itemsLoading;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <LinearGradient
        colors={isDark ? Gradients.darkOverlay : Gradients.lightOverlay}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.md,
          paddingBottom: tabBarHeight + Spacing.xl,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.tint}
          />
        }
      >
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search collections..."
          />
        </View>

        {categoriesLoading ? null : (
          <View style={styles.categoriesContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            >
              <CategoryChip
                label="All"
                isActive={!activeCategory || activeCategory === "all"}
                gradient={["#8B5CF6", "#3B82F6"]}
                onPress={() => handleCategoryPress("all")}
              />
              {(categories || []).filter(c => c.name !== "All").map((category) => (
                <CategoryChip
                  key={category.id}
                  label={category.name}
                  isActive={activeCategory === category.id}
                  gradient={[category.gradientStart, category.gradientEnd]}
                  onPress={() => handleCategoryPress(category.id)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {itemsLoading ? (
          <LoadingPlaceholder />
        ) : (
          <View style={styles.gridContainer}>
            <View style={styles.grid}>
              {filteredItems.map((item, index) => (
                <ExploreCard key={item.id} item={item} index={index} />
              ))}
            </View>
          </View>
        )}

        {!isLoading && filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText
              type="body"
              lightColor="#6B7280"
              darkColor="#9CA3AF"
            >
              No results found
            </ThemedText>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  categoriesContainer: {
    marginBottom: Spacing.lg,
  },
  categoriesList: {
    paddingHorizontal: Spacing.lg,
  },
  gridContainer: {
    paddingHorizontal: Spacing.lg,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
  },
  exploreCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.2,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  exploreImage: {
    width: "100%",
    height: "100%",
  },
  exploreOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  exploreContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: BorderRadius.md,
    margin: Spacing.sm,
    overflow: "hidden",
  },
  exploreTextContainer: {
    padding: Spacing.sm,
    backgroundColor:
      Platform.OS === "android" ? "rgba(0, 0, 0, 0.5)" : "transparent",
  },
  exploreCategory: {
    fontWeight: "500",
    marginBottom: 2,
  },
  exploreTitle: {
    fontWeight: "600",
  },
  emptyState: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
});
