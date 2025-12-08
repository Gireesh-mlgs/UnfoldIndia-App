import React, { useEffect, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  Dimensions,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
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
import { SearchBar } from "@/components/SearchBar";
import { GlassCard } from "@/components/GlassCard";
import { Spacing, BorderRadius, Shadows, Gradients, Colors } from "@/constants/theme";
import { useTrendingItems, useRecommendedItems, useItems, Item } from "@/hooks/useItems";
import type { HomeStackParamList } from "@/navigation/HomeStackNavigator";

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, "Home">;

const { width } = Dimensions.get("window");
const HERO_CARD_WIDTH = width * 0.75;
const PLACE_CARD_WIDTH = width * 0.42;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function HeroCard({ item, index, onPress }: { item: Item; index: number; onPress: () => void }) {
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
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.heroCard, Shadows.card, animatedStyle]}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.heroImage}
        contentFit="cover"
        transition={300}
      />
      <LinearGradient
        colors={Gradients.heroOverlay}
        style={styles.heroOverlay}
      />
      <View style={styles.heroContent}>
        {item.isTrending ? (
          <View style={styles.heroBadge}>
            <Feather name="star" size={12} color="#FFFFFF" />
            <ThemedText
              type="caption"
              style={styles.heroBadgeText}
              lightColor="#FFFFFF"
              darkColor="#FFFFFF"
            >
              Top Pick
            </ThemedText>
          </View>
        ) : null}
        <ThemedText
          type="h3"
          style={styles.heroTitle}
          lightColor="#FFFFFF"
          darkColor="#FFFFFF"
          numberOfLines={2}
        >
          {item.title}
        </ThemedText>
        {item.subtitle ? (
          <View style={styles.heroLocationRow}>
            <Feather name="map-pin" size={12} color="rgba(255,255,255,0.8)" />
            <ThemedText
              type="small"
              style={styles.heroLocation}
              lightColor="rgba(255,255,255,0.8)"
              darkColor="rgba(255,255,255,0.8)"
            >
              {item.subtitle}
            </ThemedText>
          </View>
        ) : null}
      </View>
    </AnimatedPressable>
  );
}

function PlaceCard({ item, index, onPress }: { item: Item; index: number; onPress: () => void }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(
      index * 80,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) })
    );
    translateY.value = withDelay(
      index * 80,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const rating = item.rating ? (item.rating / 10).toFixed(1) : "4.5";

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.placeCard, Shadows.card, animatedStyle]}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.placeImage}
        contentFit="cover"
        transition={300}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)"]}
        style={styles.placeOverlay}
      />
      <View style={styles.placeContent}>
        <ThemedText
          type="h4"
          style={styles.placeTitle}
          lightColor="#FFFFFF"
          darkColor="#FFFFFF"
          numberOfLines={1}
        >
          {item.title}
        </ThemedText>
        <View style={styles.placeMetaRow}>
          <View style={styles.ratingBadge}>
            <Feather name="star" size={10} color="#F59E0B" />
            <ThemedText type="caption" style={styles.ratingText}>
              {rating}
            </ThemedText>
          </View>
        </View>
      </View>
      {item.isRecommended ? (
        <View style={styles.gemBadge}>
          <Feather name="star" size={10} color="#FFFFFF" />
        </View>
      ) : null}
    </AnimatedPressable>
  );
}

function NeighborhoodCard({ name, count, imageUrl, onPress }: { name: string; count: number; imageUrl: string; onPress: () => void }) {
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
      style={[styles.neighborhoodCard, Shadows.card, animatedStyle]}
    >
      <Image
        source={{ uri: imageUrl }}
        style={styles.neighborhoodImage}
        contentFit="cover"
        transition={300}
      />
      <LinearGradient
        colors={["transparent", "rgba(36, 49, 74, 0.85)"]}
        style={styles.neighborhoodOverlay}
      />
      <View style={styles.neighborhoodContent}>
        <ThemedText
          type="h4"
          style={styles.neighborhoodName}
          lightColor="#FFFFFF"
          darkColor="#FFFFFF"
        >
          {name}
        </ThemedText>
        <ThemedText
          type="caption"
          style={styles.neighborhoodCount}
          lightColor="rgba(255,255,255,0.7)"
          darkColor="rgba(255,255,255,0.7)"
        >
          {count} places
        </ThemedText>
      </View>
    </AnimatedPressable>
  );
}

function LocationChip() {
  const { theme } = useTheme();
  return (
    <View style={[styles.locationChip, { backgroundColor: theme.backgroundSecondary }]}>
      <Feather name="map-pin" size={14} color={Colors.light.primary} />
      <ThemedText type="small" style={styles.locationText}>
        Delhi NCR
      </ThemedText>
      <Feather name="chevron-down" size={14} color={theme.textSecondary} />
    </View>
  );
}

function FloatingNearbyButton({ onPress }: { onPress: () => void }) {
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
      style={[styles.floatingButton, Shadows.fab, animatedStyle]}
    >
      <LinearGradient
        colors={Gradients.saffronGold}
        style={styles.floatingButtonGradient}
      >
        <Feather name="navigation" size={20} color="#FFFFFF" />
        <ThemedText type="small" style={styles.floatingButtonText} lightColor="#FFFFFF" darkColor="#FFFFFF">
          Nearby
        </ThemedText>
      </LinearGradient>
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

const neighborhoods = [
  { name: "Hauz Khas", count: 24, imageUrl: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400" },
  { name: "Connaught Place", count: 32, imageUrl: "https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=400" },
  { name: "Chandni Chowk", count: 28, imageUrl: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400" },
  { name: "Mehrauli", count: 18, imageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?w=400" },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [refreshing, setRefreshing] = React.useState(false);

  const handlePlacePress = useCallback((placeId: string) => {
    navigation.navigate("PlaceDetail", { placeId });
  }, [navigation]);

  const { data: trendingItems, isLoading: trendingLoading, refetch: refetchTrending } = useTrendingItems();
  const { data: recommendedItems, isLoading: recommendedLoading, refetch: refetchRecommended } = useRecommendedItems();
  const { data: allItems, isLoading: allLoading, refetch: refetchAll } = useItems({ limit: 20 });

  const hiddenGems = useMemo(() => {
    return (allItems || []).filter(item => item.isRecommended).slice(0, 6);
  }, [allItems]);

  const weekendEscapes = useMemo(() => {
    return (allItems || []).slice(0, 4);
  }, [allItems]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchTrending(), refetchRecommended(), refetchAll()]);
    setRefreshing(false);
  }, [refetchTrending, refetchRecommended, refetchAll]);

  const handleNearbyPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Nearby Places",
      "Map view with nearby places is coming soon! We're adding location-based discovery.",
      [{ text: "OK" }]
    );
  };

  const handleNeighborhoodPress = (name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      name,
      `Exploring ${name} is coming soon! You'll be able to discover all the hidden gems in this area.`,
      [{ text: "OK" }]
    );
  };

  const handleSeeAllPress = (section: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      section,
      `Full ${section} list is coming soon! You'll be able to browse and filter all places.`,
      [{ text: "OK" }]
    );
  };

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

  const greeting = getGreeting();

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
          paddingBottom: tabBarHeight + Spacing.xl + 60,
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
          <View style={styles.greetingRow}>
            <View>
              <ThemedText type="h1" style={styles.greetingText}>
                {greeting}
              </ThemedText>
              <ThemedText
                type="body"
                style={styles.greetingSubtext}
                lightColor={Colors.light.textSecondary}
                darkColor={Colors.dark.textSecondary}
              >
                What would you like to explore today?
              </ThemedText>
            </View>
            <LocationChip />
          </View>
        </Animated.View>

        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search Delhi, monuments, cafes, trails..."
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h3" style={styles.sectionTitle}>Top Picks Today</ThemedText>
            <Pressable onPress={() => handleSeeAllPress("Top Picks")}>
              <ThemedText type="link" lightColor={Colors.light.primary} darkColor={Colors.dark.primary}>
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
                <HeroCard item={item} index={index} onPress={() => handlePlacePress(item.id)} />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              snapToInterval={HERO_CARD_WIDTH + Spacing.md}
              decelerationRate="fast"
            />
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h3" style={styles.sectionTitle}>Hidden Gems Near You</ThemedText>
            <Pressable onPress={() => handleSeeAllPress("Hidden Gems")}>
              <ThemedText type="link" lightColor={Colors.light.primary} darkColor={Colors.dark.primary}>
                See All
              </ThemedText>
            </Pressable>
          </View>
          {recommendedLoading ? (
            <LoadingPlaceholder />
          ) : (
            <FlatList
              horizontal
              data={hiddenGems}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <PlaceCard item={item} index={index} onPress={() => handlePlacePress(item.id)} />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              snapToInterval={PLACE_CARD_WIDTH + Spacing.md}
              decelerationRate="fast"
            />
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h3" style={styles.sectionTitle}>Local Picks by Neighborhood</ThemedText>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {neighborhoods.map((neighborhood) => (
              <NeighborhoodCard
                key={neighborhood.name}
                name={neighborhood.name}
                count={neighborhood.count}
                imageUrl={neighborhood.imageUrl}
                onPress={() => handleNeighborhoodPress(neighborhood.name)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h3" style={styles.sectionTitle}>Weekend Escapes</ThemedText>
            <Pressable onPress={() => handleSeeAllPress("Weekend Escapes")}>
              <ThemedText type="link" lightColor={Colors.light.primary} darkColor={Colors.dark.primary}>
                See All
              </ThemedText>
            </Pressable>
          </View>
          {allLoading ? (
            <LoadingPlaceholder />
          ) : (
            <FlatList
              horizontal
              data={weekendEscapes}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <PlaceCard item={item} index={index} onPress={() => handlePlacePress(item.id)} />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              snapToInterval={PLACE_CARD_WIDTH + Spacing.md}
              decelerationRate="fast"
            />
          )}
        </View>
      </ScrollView>

      <FloatingNearbyButton onPress={handleNearbyPress} />
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
    marginBottom: Spacing.md,
  },
  greetingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greetingText: {
    marginBottom: Spacing.xs,
  },
  greetingSubtext: {
    opacity: 0.8,
  },
  locationChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  locationText: {
    fontWeight: "500",
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
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
  sectionTitle: {
    color: Colors.light.navy,
  },
  horizontalList: {
    paddingHorizontal: Spacing.lg,
  },
  heroCard: {
    width: HERO_CARD_WIDTH,
    height: 200,
    marginRight: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  heroBadgeText: {
    fontWeight: "600",
  },
  heroTitle: {
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  heroLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  heroLocation: {
    fontWeight: "500",
  },
  placeCard: {
    width: PLACE_CARD_WIDTH,
    height: PLACE_CARD_WIDTH * 1.25,
    marginRight: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  placeImage: {
    width: "100%",
    height: "100%",
  },
  placeOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  placeContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.sm,
  },
  placeTitle: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  placeMetaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    gap: 2,
  },
  ratingText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  gemBadge: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  neighborhoodCard: {
    width: 140,
    height: 100,
    marginRight: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  neighborhoodImage: {
    width: "100%",
    height: "100%",
  },
  neighborhoodOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  neighborhoodContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.sm,
  },
  neighborhoodName: {
    fontWeight: "600",
    fontSize: 14,
  },
  neighborhoodCount: {
    fontSize: 11,
  },
  floatingButton: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  floatingButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  floatingButtonText: {
    fontWeight: "600",
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
});
