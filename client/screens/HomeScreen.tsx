import React, { useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  Dimensions,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useQueryClient } from "@tanstack/react-query";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { GradientButton } from "@/components/GradientButton";
import { Spacing, BorderRadius, Shadows, Gradients } from "@/constants/theme";
import { useTrendingItems, useRecommendedItems, Item } from "@/hooks/useItems";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.7;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function TrendingCard({ item, index }: { item: Item; index: number }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(
      index * 100,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) })
    );
    translateY.value = withDelay(
      index * 100,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const gradientStart = item.gradientStart || "#8B5CF6";
  const gradientEnd = item.gradientEnd || "#EC4899";

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.trendingCard, Shadows.glass, animatedStyle]}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.trendingImage}
        contentFit="cover"
        transition={300}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.trendingOverlay}
      />
      <View style={styles.trendingContent}>
        <View
          style={[
            styles.trendingBadge,
            { backgroundColor: gradientStart + "40" },
          ]}
        >
          <ThemedText
            type="small"
            style={styles.trendingBadgeText}
            lightColor="#FFFFFF"
            darkColor="#FFFFFF"
          >
            {item.subtitle || "Featured"}
          </ThemedText>
        </View>
        <ThemedText
          type="h3"
          style={styles.trendingTitle}
          lightColor="#FFFFFF"
          darkColor="#FFFFFF"
        >
          {item.title}
        </ThemedText>
      </View>
    </AnimatedPressable>
  );
}

function RecommendedCard({
  item,
  index,
}: {
  item: Item;
  index: number;
}) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-30);

  useEffect(() => {
    opacity.value = withDelay(
      index * 150 + 300,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) })
    );
    translateX.value = withDelay(
      index * 150 + 300,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const rating = item.rating ? (item.rating / 10).toFixed(1) : "4.5";

  return (
    <Animated.View style={animatedStyle}>
      <GlassCard onPress={handlePress} style={styles.recommendedCard}>
        <View style={styles.recommendedHeader}>
          <View style={styles.recommendedTitleContainer}>
            <ThemedText type="h4">{item.title}</ThemedText>
            <View style={styles.categoryRow}>
              <View
                style={[
                  styles.categoryDot,
                  { backgroundColor: item.gradientStart || "#8B5CF6" },
                ]}
              />
              <ThemedText
                type="small"
                lightColor="#6B7280"
                darkColor="#9CA3AF"
              >
                {item.subtitle || "Collection"}
              </ThemedText>
            </View>
          </View>
          <View style={styles.ratingContainer}>
            <Feather name="star" size={14} color="#F59E0B" />
            <ThemedText type="small" style={styles.ratingText}>
              {rating}
            </ThemedText>
          </View>
        </View>
        <ThemedText
          type="body"
          style={styles.recommendedDescription}
          lightColor="#6B7280"
          darkColor="#9CA3AF"
          numberOfLines={2}
        >
          {item.description || "Discover this amazing collection."}
        </ThemedText>
        <View style={styles.recommendedActions}>
          <GradientButton
            title="View Details"
            size="small"
            gradient={Gradients.purpleBlue}
          />
        </View>
      </GlassCard>
    </Animated.View>
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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const queryClient = useQueryClient();

  const { data: trendingItems, isLoading: trendingLoading, refetch: refetchTrending } = useTrendingItems();
  const { data: recommendedItems, isLoading: recommendedLoading, refetch: refetchRecommended } = useRecommendedItems();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchTrending(), refetchRecommended()]);
    setRefreshing(false);
  }, [refetchTrending, refetchRecommended]);

  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const isLoading = trendingLoading || recommendedLoading;

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
        <Animated.View style={[styles.headerSection, headerAnimatedStyle]}>
          <ThemedText type="h1" style={styles.heroTitle}>
            Discover
          </ThemedText>
          <ThemedText
            type="body"
            style={styles.heroSubtitle}
            lightColor="#6B7280"
            darkColor="#9CA3AF"
          >
            Explore trending collections and recommendations
          </ThemedText>
        </Animated.View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h3">Trending Now</ThemedText>
            <Pressable
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <ThemedText type="link" lightColor="#8B5CF6" darkColor="#A855F7">
                See All
              </ThemedText>
            </Pressable>
          </View>
          {trendingLoading ? (
            <LoadingPlaceholder />
          ) : (
            <FlatList
              horizontal
              data={trendingItems || []}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <TrendingCard item={item} index={index} />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              snapToInterval={CARD_WIDTH + Spacing.md}
              decelerationRate="fast"
            />
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h3">Recommended</ThemedText>
            <Pressable
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <ThemedText type="link" lightColor="#8B5CF6" darkColor="#A855F7">
                See All
              </ThemedText>
            </Pressable>
          </View>
          {recommendedLoading ? (
            <LoadingPlaceholder />
          ) : (
            <View style={styles.recommendedList}>
              {(recommendedItems || []).map((item, index) => (
                <RecommendedCard key={item.id} item={item} index={index} />
              ))}
            </View>
          )}
        </View>
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
  headerSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  heroTitle: {
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    opacity: 0.8,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  horizontalList: {
    paddingHorizontal: Spacing.lg,
  },
  trendingCard: {
    width: CARD_WIDTH,
    height: 200,
    marginRight: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  trendingImage: {
    width: "100%",
    height: "100%",
  },
  trendingOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  trendingContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
  },
  trendingBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  trendingBadgeText: {
    fontWeight: "600",
  },
  trendingTitle: {
    fontWeight: "700",
  },
  recommendedList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  recommendedCard: {
    marginBottom: 0,
  },
  recommendedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  recommendedTitleContainer: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.xs,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  ratingText: {
    marginLeft: Spacing.xs,
    fontWeight: "600",
  },
  recommendedDescription: {
    marginBottom: Spacing.md,
  },
  recommendedActions: {
    flexDirection: "row",
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
});
