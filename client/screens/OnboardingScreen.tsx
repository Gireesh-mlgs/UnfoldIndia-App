import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  Pressable,
  Platform,
  Linking,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { GradientButton } from "@/components/GradientButton";
import { Colors, Gradients, Spacing, BorderRadius, Typography } from "@/constants/theme";

const { width, height } = Dimensions.get("window");
const ONBOARDING_KEY = "@unfold_india_onboarding_complete";

interface OnboardingPage {
  id: string;
  type: "welcome" | "features" | "permissions";
}

const pages: OnboardingPage[] = [
  { id: "1", type: "welcome" },
  { id: "2", type: "features" },
  { id: "3", type: "permissions" },
];

const features = [
  { icon: "compass" as const, title: "Explore", description: "Discover hidden gems near you" },
  { icon: "map" as const, title: "Routes", description: "Plan multi-stop adventures" },
  { icon: "message-circle" as const, title: "AI Assistant", description: "Get personalized recommendations" },
  { icon: "heart" as const, title: "For You", description: "Curated picks based on your taste" },
];

const interests = [
  { id: "food", label: "Food & Cafes", icon: "coffee" as const },
  { id: "culture", label: "Culture & History", icon: "book" as const },
  { id: "nature", label: "Outdoors & Nature", icon: "sun" as const },
  { id: "nightlife", label: "Nightlife", icon: "moon" as const },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [canAskAgain, setCanAskAgain] = useState(true);

  const handleGetStarted = () => {
    flatListRef.current?.scrollToIndex({ index: 1, animated: true });
  };

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentPage + 1, animated: true });
    }
  };

  const handleRequestLocation = async () => {
    const { status, canAskAgain: canAsk } = await Location.requestForegroundPermissionsAsync();
    setLocationPermission(status);
    setCanAskAgain(canAsk);
  };

  const handleOpenSettings = async () => {
    if (Platform.OS !== "web") {
      try {
        await Linking.openSettings();
      } catch (error) {
        console.log("Error opening settings:", error);
      }
    }
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
      if (selectedInterests.length > 0) {
        await AsyncStorage.setItem("@unfold_india_interests", JSON.stringify(selectedInterests));
      }
    } catch (error) {
      console.log("Error saving onboarding state:", error);
    }
    navigation.replace("Main");
  };

  const renderPage = ({ item, index }: { item: OnboardingPage; index: number }) => {
    if (item.type === "welcome") {
      return (
        <View style={styles.page}>
          <LinearGradient
            colors={Gradients.heroOverlay}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroContent}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.appIcon}
              resizeMode="contain"
            />
            <ThemedText
              type="h1"
              style={styles.heroTitle}
              lightColor="#FFFFFF"
              darkColor="#FFFFFF"
            >
              Unfold India
            </ThemedText>
            <ThemedText
              type="body"
              style={styles.heroSubtitle}
              lightColor="rgba(255,255,255,0.9)"
              darkColor="rgba(255,255,255,0.9)"
            >
              Discover India's hidden gems
            </ThemedText>
          </View>
          <View style={[styles.bottomSection, { paddingBottom: insets.bottom + Spacing.lg }]}>
            <GradientButton
              title="Get Started"
              onPress={handleGetStarted}
              style={styles.ctaButton}
            />
          </View>
        </View>
      );
    }

    if (item.type === "features") {
      return (
        <View style={[styles.page, styles.featuresPage]}>
          <LinearGradient
            colors={[Colors.light.backgroundRoot, Colors.light.ivory]}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.featuresContent, { paddingTop: insets.top + Spacing.xl }]}>
            <ThemedText type="h2" style={styles.sectionTitle}>
              What you can do
            </ThemedText>
            <View style={styles.featuresList}>
              {features.map((feature, idx) => (
                <View key={feature.title} style={styles.featureItem}>
                  <View style={styles.featureIconContainer}>
                    <LinearGradient
                      colors={Gradients.saffronGold}
                      style={styles.featureIconBg}
                    >
                      <Feather name={feature.icon} size={24} color="#FFFFFF" />
                    </LinearGradient>
                  </View>
                  <View style={styles.featureTextContainer}>
                    <ThemedText type="h4" style={styles.featureTitle}>
                      {feature.title}
                    </ThemedText>
                    <ThemedText type="small" style={styles.featureDescription}>
                      {feature.description}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          </View>
          <View style={[styles.bottomSection, { paddingBottom: insets.bottom + Spacing.lg }]}>
            <GradientButton
              title="Continue"
              onPress={handleNext}
              style={styles.ctaButton}
            />
          </View>
        </View>
      );
    }

    if (item.type === "permissions") {
      return (
        <View style={[styles.page, styles.permissionsPage]}>
          <LinearGradient
            colors={[Colors.light.backgroundRoot, Colors.light.ivory]}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.permissionsContent, { paddingTop: insets.top + Spacing.xl }]}>
            <ThemedText type="h2" style={styles.sectionTitle}>
              Personalize your experience
            </ThemedText>

            <View style={styles.locationSection}>
              <View style={styles.locationHeader}>
                <View style={styles.locationIconContainer}>
                  <Feather name="map-pin" size={24} color={Colors.light.primary} />
                </View>
                <View style={styles.locationTextContainer}>
                  <ThemedText type="h4">Enable Location</ThemedText>
                  <ThemedText type="small" style={styles.locationDescription}>
                    Find hidden gems near you
                  </ThemedText>
                </View>
              </View>
              {locationPermission === "granted" ? (
                <View style={styles.permissionGranted}>
                  <Feather name="check-circle" size={20} color={Colors.light.success} />
                  <ThemedText type="small" style={styles.grantedText}>
                    Location enabled
                  </ThemedText>
                </View>
              ) : locationPermission === "denied" && !canAskAgain && Platform.OS !== "web" ? (
                <Pressable onPress={handleOpenSettings} style={styles.settingsButton}>
                  <ThemedText type="small" style={styles.settingsButtonText}>
                    Open Settings
                  </ThemedText>
                </Pressable>
              ) : (
                <Pressable onPress={handleRequestLocation} style={styles.enableButton}>
                  <ThemedText type="small" style={styles.enableButtonText}>
                    Enable
                  </ThemedText>
                </Pressable>
              )}
            </View>

            <View style={styles.interestsSection}>
              <ThemedText type="h4" style={styles.interestsTitle}>
                What interests you?
              </ThemedText>
              <View style={styles.interestsList}>
                {interests.map((interest) => {
                  const isSelected = selectedInterests.includes(interest.id);
                  return (
                    <Pressable
                      key={interest.id}
                      onPress={() => toggleInterest(interest.id)}
                      style={[
                        styles.interestChip,
                        isSelected && styles.interestChipSelected,
                      ]}
                    >
                      <Feather
                        name={interest.icon}
                        size={18}
                        color={isSelected ? "#FFFFFF" : Colors.light.navy}
                      />
                      <ThemedText
                        type="small"
                        style={[
                          styles.interestLabel,
                          isSelected && styles.interestLabelSelected,
                        ]}
                      >
                        {interest.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
          <View style={[styles.bottomSection, { paddingBottom: insets.bottom + Spacing.lg }]}>
            <GradientButton
              title="Start Exploring"
              onPress={handleComplete}
              style={styles.ctaButton}
            />
            <Pressable onPress={handleComplete} style={styles.skipButton}>
              <ThemedText type="small" style={styles.skipText}>
                Skip for now
              </ThemedText>
            </Pressable>
          </View>
        </View>
      );
    }

    return null;
  };

  const onScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / width);
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={pages}
        renderItem={renderPage}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
      <View style={[styles.pagination, { bottom: insets.bottom + 100 }]}>
        {pages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentPage && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.navy,
  },
  page: {
    width,
    height: "100%",
    justifyContent: "flex-end",
  },
  heroContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  appIcon: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
  },
  heroTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
    letterSpacing: 1,
  },
  heroSubtitle: {
    textAlign: "center",
    opacity: 0.9,
  },
  bottomSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  ctaButton: {
    width: "100%",
  },
  featuresPage: {
    backgroundColor: Colors.light.backgroundRoot,
  },
  featuresContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.xl,
    color: Colors.light.navy,
  },
  featuresList: {
    gap: Spacing.lg,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  featureIconBg: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    color: Colors.light.navy,
    marginBottom: 2,
  },
  featureDescription: {
    color: Colors.light.textSecondary,
  },
  permissionsPage: {
    backgroundColor: Colors.light.backgroundRoot,
  },
  permissionsContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  locationSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.cardBackground,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  locationIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    backgroundColor: "rgba(245, 166, 35, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  locationTextContainer: {
    flex: 1,
  },
  locationDescription: {
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  enableButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  enableButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  settingsButton: {
    backgroundColor: Colors.light.slate,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  settingsButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  permissionGranted: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  grantedText: {
    color: Colors.light.success,
  },
  interestsSection: {
    marginTop: Spacing.md,
  },
  interestsTitle: {
    color: Colors.light.navy,
    marginBottom: Spacing.md,
  },
  interestsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  interestChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(36, 49, 74, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(36, 49, 74, 0.15)",
  },
  interestChipSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  interestLabel: {
    color: Colors.light.navy,
  },
  interestLabelSelected: {
    color: "#FFFFFF",
  },
  skipButton: {
    alignItems: "center",
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  skipText: {
    color: Colors.light.textSecondary,
  },
  pagination: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  paginationDotActive: {
    backgroundColor: Colors.light.primary,
    width: 24,
  },
});
