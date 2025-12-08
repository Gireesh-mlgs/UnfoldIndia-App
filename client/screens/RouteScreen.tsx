import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius, Shadows, Gradients } from "@/constants/theme";

export default function RouteScreen() {
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
      <View
        style={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
      >
        <View style={[styles.placeholderCard, Shadows.card]}>
          <LinearGradient
            colors={Gradients.navyIndigo}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconContainer}
          >
            <Feather name="map-pin" size={48} color="#FFFFFF" />
          </LinearGradient>
          <ThemedText type="h2" style={styles.title}>
            Route Planner
          </ThemedText>
          <ThemedText
            type="body"
            style={styles.description}
            lightColor="#6B7280"
            darkColor="#9CA3AF"
          >
            Plan your perfect Delhi adventure with custom routes, transport options, and time estimates.
          </ThemedText>
          <View style={styles.featureList}>
            <FeatureItem icon="map" text="Interactive map with clustered pins" />
            <FeatureItem icon="navigation" text="Multi-stop route planning" />
            <FeatureItem icon="clock" text="Estimated travel times" />
            <FeatureItem icon="bookmark" text="Save your favorite routes" />
          </View>
          <Pressable style={[styles.comingSoonBadge, { backgroundColor: theme.primary + "20" }]}>
            <ThemedText
              type="small"
              style={styles.comingSoonText}
              lightColor={theme.primary}
              darkColor={theme.primary}
            >
              Coming Soon
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function FeatureItem({ icon, text }: { icon: keyof typeof Feather.glyphMap; text: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.featureItem}>
      <Feather name={icon} size={20} color={theme.primary} style={styles.featureIcon} />
      <ThemedText type="small" style={styles.featureText}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  placeholderCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    marginBottom: Spacing.lg,
    lineHeight: 24,
  },
  featureList: {
    width: "100%",
    marginBottom: Spacing.lg,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  featureIcon: {
    marginRight: Spacing.sm,
  },
  featureText: {
    flex: 1,
  },
  comingSoonBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  comingSoonText: {
    fontWeight: "600",
  },
});
