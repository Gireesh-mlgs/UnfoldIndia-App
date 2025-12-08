import React from "react";
import { StyleSheet, View, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";

interface StatsCardProps {
  value: string;
  label: string;
  gradient?: readonly [string, string, ...string[]];
}

export function StatsCard({
  value,
  label,
  gradient = ["#8B5CF6", "#3B82F6"],
}: StatsCardProps) {
  const { isDark } = useTheme();

  return (
    <View style={[styles.container, Shadows.glass]}>
      {Platform.OS === "ios" ? (
        <BlurView
          intensity={30}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(255, 255, 255, 0.9)",
            },
          ]}
        />
      )}
      <View style={styles.content}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.valueContainer}
        >
          <ThemedText
            type="h3"
            style={styles.value}
            lightColor="#FFFFFF"
            darkColor="#FFFFFF"
          >
            {value}
          </ThemedText>
        </LinearGradient>
        <ThemedText type="small" style={styles.label}>
          {label}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    minWidth: 100,
  },
  content: {
    padding: Spacing.md,
    alignItems: "center",
  },
  valueContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  value: {
    fontWeight: "700",
  },
  label: {
    textAlign: "center",
    opacity: 0.7,
  },
});
