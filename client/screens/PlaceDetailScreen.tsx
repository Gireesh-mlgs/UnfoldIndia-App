import React, { useEffect, useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  ActivityIndicator,
  Share,
  Platform,
  Linking,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { useItem, useBookmarkItem, useUnbookmarkItem, useItems, Item, useCategories } from "@/hooks/useItems";
import { Spacing, BorderRadius, Shadows, Gradients, Colors, CategoryColors } from "@/constants/theme";
import type { HomeStackParamList } from "@/navigation/HomeStackNavigator";

const CATEGORY_LABELS: Record<string, string> = {
  food: "Food & Dining",
  culture: "Culture & Heritage",
  nature: "Nature & Outdoors",
  nightlife: "Nightlife",
  shopping: "Shopping",
  experiences: "Experiences",
};

const LOCAL_TIPS: Record<string, string> = {
  food: "Local favorites are usually found at smaller establishments. Ask for the day's special!",
  culture: "Visit during early morning hours for the best photo opportunities and to avoid crowds.",
  nature: "Carry water and comfortable shoes. The light is magical during sunrise and sunset!",
  nightlife: "Most venues come alive after 9 PM. Weekends are busiest, so book ahead!",
  shopping: "Bargaining is expected at local markets. Start at 40% of the asking price.",
  experiences: "Book in advance for popular activities, especially during weekends and holidays.",
  default: "Visit during early morning hours for the best experience and to avoid crowds.",
};

const { width, height } = Dimensions.get("window");
const HERO_HEIGHT = height * 0.45;

type Props = NativeStackScreenProps<HomeStackParamList, "PlaceDetail">;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function InfoChip({ icon, label, value }: { icon: string; label: string; value: string }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.infoChip, { backgroundColor: theme.backgroundSecondary }]}>
      <Feather name={icon as any} size={16} color={Colors.light.primary} />
      <View style={styles.infoChipContent}>
        <ThemedText type="caption" style={styles.infoChipLabel}>
          {label}
        </ThemedText>
        <ThemedText type="small" style={styles.infoChipValue}>
          {value}
        </ThemedText>
      </View>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  isActive,
  activeColor,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  isActive?: boolean;
  activeColor?: string;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.actionButton, animatedStyle]}
    >
      <View
        style={[
          styles.actionIconContainer,
          { backgroundColor: isActive ? activeColor || Colors.light.primary : theme.backgroundSecondary },
        ]}
      >
        <Feather
          name={icon as any}
          size={20}
          color={isActive ? "#FFFFFF" : theme.text}
        />
      </View>
      <ThemedText type="caption" style={styles.actionLabel}>
        {label}
      </ThemedText>
    </AnimatedPressable>
  );
}

function LocalTipCard({ tip }: { tip: string }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.localTipCard, { backgroundColor: theme.backgroundSecondary }]}>
      <View style={styles.localTipHeader}>
        <Feather name="star" size={16} color={Colors.light.primary} />
        <ThemedText type="h4" style={styles.localTipTitle}>
          Local Tip
        </ThemedText>
      </View>
      <ThemedText type="body" style={styles.localTipText}>
        {tip}
      </ThemedText>
    </View>
  );
}

function SimilarPlaceCard({ item, onPress }: { item: Item; onPress: () => void }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.similarCard, Shadows.card, animatedStyle]}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.similarImage}
        contentFit="cover"
        transition={300}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)"]}
        style={styles.similarOverlay}
      />
      <View style={styles.similarContent}>
        <ThemedText
          type="small"
          style={styles.similarTitle}
          lightColor="#FFFFFF"
          darkColor="#FFFFFF"
          numberOfLines={1}
        >
          {item.title}
        </ThemedText>
      </View>
    </AnimatedPressable>
  );
}

export default function PlaceDetailScreen({ route, navigation }: Props) {
  const { placeId } = route.params;
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const { data: place, isLoading, error } = useItem(placeId);
  const { data: categories } = useCategories();
  const bookmarkMutation = useBookmarkItem();
  const unbookmarkMutation = useUnbookmarkItem();

  const { data: similarItemsData } = useItems({ 
    categoryId: place?.categoryId || undefined, 
    limit: 10 
  });

  const similarPlaces = useMemo(() => {
    if (!similarItemsData || !place) return [];
    return similarItemsData.filter(item => item.id !== placeId).slice(0, 5);
  }, [similarItemsData, placeId, place]);

  const categoryName = useMemo(() => {
    if (place?.categoryId) {
      return CATEGORY_LABELS[place.categoryId] || "Culture & Heritage";
    }
    return "Culture & Heritage";
  }, [place?.categoryId]);

  const localTip = useMemo(() => {
    if (place?.categoryId && LOCAL_TIPS[place.categoryId]) {
      return LOCAL_TIPS[place.categoryId];
    }
    return LOCAL_TIPS.default;
  }, [place?.categoryId]);

  const handleSimilarPlacePress = useCallback((itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.push("PlaceDetail", { placeId: itemId });
  }, [navigation]);

  const scrollY = useSharedValue(0);
  const headerOpacity = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 400 });
  }, []);

  const heroAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [-100, 0, HERO_HEIGHT],
      [-50, 0, HERO_HEIGHT * 0.5],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      scrollY.value,
      [-100, 0],
      [1.2, 1],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ translateY }, { scale }],
    };
  });

  const backButtonStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (place?.isBookmarked) {
      unbookmarkMutation.mutate(placeId);
    } else {
      bookmarkMutation.mutate(placeId);
    }
  };

  const handleRoute = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "Route Planning",
      "Route planning feature coming soon! We're working on integrating maps and directions.",
      [{ text: "OK" }]
    );
  };

  const handleCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "Contact Information",
      "Contact details will be available soon. Check back for updates!",
      [{ text: "OK" }]
    );
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (place) {
      try {
        await Share.share({
          message: `Check out ${place.title} on Unfold India!`,
          title: place.title,
        });
      } catch (error) {
      }
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  if (error || !place) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.backgroundRoot }]}>
        <Feather name="alert-circle" size={48} color={theme.textSecondary} />
        <ThemedText type="h3" style={styles.errorText}>
          Place not found
        </ThemedText>
        <Pressable onPress={handleBack} style={styles.errorButton}>
          <ThemedText type="link" lightColor={Colors.light.primary}>
            Go Back
          </ThemedText>
        </Pressable>
      </View>
    );
  }

  const rating = place.rating ? (place.rating / 10).toFixed(1) : "4.5";
  const categoryColor = place.categoryId ? CategoryColors[place.categoryId] : CategoryColors.culture;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <Animated.View style={[styles.heroContainer, heroAnimatedStyle]}>
        <Image
          source={{ uri: place.imageUrl }}
          style={styles.heroImage}
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          colors={Gradients.heroOverlay}
          style={styles.heroOverlay}
        />
      </Animated.View>

      <Animated.View style={[styles.backButton, { top: insets.top + Spacing.sm }, backButtonStyle]}>
        <Pressable onPress={handleBack} style={styles.backButtonInner}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </Pressable>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingTop: HERO_HEIGHT - 40, paddingBottom: insets.bottom + Spacing.xl }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <View style={[styles.contentCard, { backgroundColor: theme.backgroundRoot }]}>
          {place.isRecommended ? (
            <View style={styles.hiddenGemBadge}>
              <Feather name="star" size={14} color="#FFFFFF" />
              <ThemedText type="small" style={styles.hiddenGemText} lightColor="#FFFFFF" darkColor="#FFFFFF">
                Hidden Gem
              </ThemedText>
            </View>
          ) : null}

          <ThemedText type="h1" style={styles.placeTitle}>
            {place.title}
          </ThemedText>

          {place.subtitle ? (
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={16} color={theme.textSecondary} />
              <ThemedText type="body" style={styles.locationText} lightColor={theme.textSecondary} darkColor={theme.textSecondary}>
                {place.subtitle}
              </ThemedText>
            </View>
          ) : null}

          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Feather name="star" size={14} color="#F59E0B" />
              <ThemedText type="small" style={styles.ratingText}>
                {rating}
              </ThemedText>
            </View>
            <ThemedText type="caption" lightColor={theme.textSecondary} darkColor={theme.textSecondary}>
              Based on local reviews
            </ThemedText>
          </View>

          <View style={styles.infoChipsRow}>
            <InfoChip icon="tag" label="Category" value={categoryName} />
            <InfoChip icon="clock" label="Best Time" value={place.categoryId === "nightlife" ? "Evening" : "Morning"} />
            <InfoChip icon="dollar-sign" label="Entry" value={place.categoryId === "nature" ? "Free" : "Varies"} />
          </View>

          <View style={styles.actionsRow}>
            <ActionButton
              icon={place.isBookmarked ? "heart" : "heart"}
              label="Save"
              onPress={handleSave}
              isActive={place.isBookmarked ?? false}
              activeColor={Colors.light.error}
            />
            <ActionButton icon="navigation" label="Route" onPress={handleRoute} />
            <ActionButton icon="phone" label="Call" onPress={handleCall} />
            <ActionButton icon="share-2" label="Share" onPress={handleShare} />
          </View>

          <View style={styles.divider} />

          {place.description ? (
            <View style={styles.descriptionSection}>
              <ThemedText type="h3" style={styles.sectionTitle}>
                About this place
              </ThemedText>
              <ThemedText type="body" style={styles.descriptionText}>
                {place.description}
              </ThemedText>
            </View>
          ) : null}

          <LocalTipCard tip={localTip} />

          {place.isRecommended ? (
            <View style={styles.whyGemSection}>
              <ThemedText type="h3" style={styles.sectionTitle}>
                Why it's a hidden gem
              </ThemedText>
              <ThemedText type="body" style={styles.whyGemText}>
                This spot remains largely undiscovered by tourists, offering an authentic local experience. The atmosphere and unique character make it a perfect retreat from the bustling city.
              </ThemedText>
            </View>
          ) : null}

          <View style={styles.divider} />

          {similarPlaces.length > 0 ? (
            <View style={styles.similarSection}>
              <ThemedText type="h3" style={styles.sectionTitle}>
                Similar places nearby
              </ThemedText>
              <Animated.ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.similarList}
              >
                {similarPlaces.map((item) => (
                  <SimilarPlaceCard
                    key={item.id}
                    item={item}
                    onPress={() => handleSimilarPlacePress(item.id)}
                  />
                ))}
              </Animated.ScrollView>
            </View>
          ) : null}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  errorText: {
    marginTop: Spacing.md,
  },
  errorButton: {
    marginTop: Spacing.md,
    padding: Spacing.md,
  },
  heroContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: "absolute",
    left: Spacing.md,
    zIndex: 100,
  },
  backButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  contentCard: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    minHeight: height - HERO_HEIGHT + 100,
  },
  hiddenGemBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  hiddenGemText: {
    fontWeight: "600",
  },
  placeTitle: {
    marginBottom: Spacing.sm,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  locationText: {
    flex: 1,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  ratingText: {
    color: "#F59E0B",
    fontWeight: "600",
  },
  infoChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  infoChipContent: {
    gap: 2,
  },
  infoChipLabel: {
    opacity: 0.7,
  },
  infoChipValue: {
    fontWeight: "500",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: Spacing.lg,
  },
  actionButton: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  actionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  actionLabel: {
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    marginVertical: Spacing.lg,
  },
  descriptionSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  descriptionText: {
    lineHeight: 24,
    opacity: 0.85,
  },
  localTipCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  localTipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  localTipTitle: {
    fontWeight: "600",
  },
  localTipText: {
    lineHeight: 22,
    opacity: 0.85,
  },
  whyGemSection: {
    marginBottom: Spacing.lg,
  },
  whyGemText: {
    lineHeight: 24,
    opacity: 0.85,
  },
  similarSection: {
    marginBottom: Spacing.lg,
  },
  similarList: {
    paddingRight: Spacing.lg,
    gap: Spacing.md,
  },
  similarCard: {
    width: 140,
    height: 100,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  similarImage: {
    width: "100%",
    height: "100%",
  },
  similarOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  similarContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.sm,
  },
  similarTitle: {
    fontWeight: "600",
  },
});
