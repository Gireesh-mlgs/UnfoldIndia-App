import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
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

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius, Shadows, Gradients, CategoryColors } from "@/constants/theme";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - Spacing.lg * 2;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface RecommendationItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  category: string;
  reason: string;
  isHiddenGem: boolean;
}

const SAMPLE_RECOMMENDATIONS: RecommendationItem[] = [
  {
    id: "1",
    title: "Hauz Khas Village",
    subtitle: "Art galleries, cafes & medieval ruins",
    imageUrl: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800",
    category: "culture",
    reason: "Popular with creatives",
    isHiddenGem: false,
  },
  {
    id: "2",
    title: "Stepwells of Mehrauli",
    subtitle: "Ancient baolis off the beaten path",
    imageUrl: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800",
    category: "culture",
    reason: "Hidden gem discovery",
    isHiddenGem: true,
  },
  {
    id: "3",
    title: "Paranthe Wali Gali",
    subtitle: "Legendary stuffed parathas since 1875",
    imageUrl: "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=800",
    category: "food",
    reason: "Local favorite",
    isHiddenGem: false,
  },
  {
    id: "4",
    title: "Lodhi Art District",
    subtitle: "Open-air street art gallery",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    category: "experiences",
    reason: "Because you liked culture",
    isHiddenGem: true,
  },
];

function RecommendationCard({
  item,
  index,
}: {
  item: RecommendationItem;
  index: number;
}) {
  const { theme } = useTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const pressScale = useSharedValue(1);

  const categoryColor = CategoryColors[item.category] || { start: "#F5A623", end: "#D4890F" };

  useEffect(() => {
    opacity.value = withDelay(
      index * 100,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) })
    );
    translateY.value = withDelay(
      index * 100,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: pressScale.value }],
  }));

  const handlePressIn = () => {
    pressScale.value = withSpring(0.98);
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
      style={[styles.card, Shadows.card, animatedStyle]}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.cardImage}
        contentFit="cover"
        transition={300}
      />
      <LinearGradient
        colors={Gradients.heroOverlay}
        style={styles.cardOverlay}
      />
      
      {item.isHiddenGem ? (
        <View style={styles.gemBadge}>
          <LinearGradient
            colors={Gradients.saffronGold}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gemBadgeGradient}
          >
            <Feather name="star" size={12} color="#FFFFFF" />
            <ThemedText
              type="caption"
              style={styles.gemBadgeText}
              lightColor="#FFFFFF"
              darkColor="#FFFFFF"
            >
              Hidden Gem
            </ThemedText>
          </LinearGradient>
        </View>
      ) : null}

      <View style={styles.cardContent}>
        <View style={styles.categoryChip}>
          <LinearGradient
            colors={[categoryColor.start, categoryColor.end]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.categoryChipGradient}
          >
            <ThemedText
              type="caption"
              style={styles.categoryText}
              lightColor="#FFFFFF"
              darkColor="#FFFFFF"
            >
              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            </ThemedText>
          </LinearGradient>
        </View>
        
        <ThemedText
          type="h3"
          style={styles.cardTitle}
          lightColor="#FFFFFF"
          darkColor="#FFFFFF"
        >
          {item.title}
        </ThemedText>
        <ThemedText
          type="small"
          style={styles.cardSubtitle}
          lightColor="rgba(255,255,255,0.8)"
          darkColor="rgba(255,255,255,0.8)"
        >
          {item.subtitle}
        </ThemedText>
        
        <View style={styles.reasonContainer}>
          <Feather name="zap" size={14} color={theme.primary} />
          <ThemedText
            type="caption"
            style={styles.reasonText}
            lightColor={theme.primary}
            darkColor={theme.primary}
          >
            {item.reason}
          </ThemedText>
        </View>
      </View>

      <Pressable style={styles.saveButton}>
        <Feather name="heart" size={20} color="#FFFFFF" />
      </Pressable>
    </AnimatedPressable>
  );
}

export default function RecommendationsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();

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
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="h2" style={styles.headerTitle}>
            For You
          </ThemedText>
          <ThemedText
            type="body"
            style={styles.headerSubtitle}
            lightColor="#6B7280"
            darkColor="#9CA3AF"
          >
            Personalized picks based on your interests
          </ThemedText>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersList}
        >
          <FilterChip label="All" isActive />
          <FilterChip label="Hidden Gems" />
          <FilterChip label="Food" />
          <FilterChip label="Culture" />
          <FilterChip label="Nature" />
        </ScrollView>

        <View style={styles.cardsContainer}>
          {SAMPLE_RECOMMENDATIONS.map((item, index) => (
            <RecommendationCard key={item.id} item={item} index={index} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function FilterChip({ label, isActive = false }: { label: string; isActive?: boolean }) {
  const { theme } = useTheme();
  
  return (
    <Pressable
      style={[
        styles.filterChip,
        {
          backgroundColor: isActive ? theme.primary : theme.cardBackground,
        },
      ]}
    >
      <ThemedText
        type="small"
        style={styles.filterChipText}
        lightColor={isActive ? "#FFFFFF" : theme.text}
        darkColor={isActive ? "#FFFFFF" : theme.text}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    lineHeight: 22,
  },
  filtersContainer: {
    marginBottom: Spacing.lg,
    marginHorizontal: -Spacing.lg,
  },
  filtersList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  filterChipText: {
    fontWeight: "500",
  },
  cardsContainer: {
    gap: Spacing.lg,
  },
  card: {
    width: CARD_WIDTH,
    height: 220,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gemBadge: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
  },
  gemBadgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  gemBadgeText: {
    fontWeight: "600",
  },
  cardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
  },
  categoryChip: {
    alignSelf: "flex-start",
    marginBottom: Spacing.sm,
  },
  categoryChipGradient: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    fontWeight: "600",
  },
  cardTitle: {
    marginBottom: 2,
  },
  cardSubtitle: {
    marginBottom: Spacing.sm,
  },
  reasonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  reasonText: {
    fontWeight: "500",
  },
  saveButton: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
});
