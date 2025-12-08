import React from "react";
import { StyleSheet, View, Switch, Pressable, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface SettingsItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  onPress?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SettingsItem({
  icon,
  label,
  value,
  isSwitch = false,
  switchValue = false,
  onSwitchChange,
  onPress,
  isFirst = false,
  isLast = false,
}: SettingsItemProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98);
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1);
    }
  };

  const borderRadiusStyle = {
    borderTopLeftRadius: isFirst ? BorderRadius.xl : 0,
    borderTopRightRadius: isFirst ? BorderRadius.xl : 0,
    borderBottomLeftRadius: isLast ? BorderRadius.xl : 0,
    borderBottomRightRadius: isLast ? BorderRadius.xl : 0,
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isSwitch}
      style={[
        styles.container,
        {
          backgroundColor:
            Platform.OS === "android"
              ? isDark
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(255, 255, 255, 0.9)"
              : "transparent",
          borderBottomColor: isDark
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.05)",
          borderBottomWidth: isLast ? 0 : 1,
        },
        borderRadiusStyle,
        animatedStyle,
      ]}
    >
      {Platform.OS === "ios" && (
        <BlurView
          intensity={30}
          tint={isDark ? "dark" : "light"}
          style={[StyleSheet.absoluteFill, borderRadiusStyle]}
        />
      )}
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: isDark
                  ? "rgba(139, 92, 246, 0.2)"
                  : "rgba(139, 92, 246, 0.1)",
              },
            ]}
          >
            <Feather name={icon} size={18} color="#8B5CF6" />
          </View>
          <ThemedText type="body">{label}</ThemedText>
        </View>
        <View style={styles.rightSection}>
          {isSwitch ? (
            <Switch
              value={switchValue}
              onValueChange={onSwitchChange}
              trackColor={{ false: "#767577", true: "#8B5CF6" }}
              thumbColor="#FFFFFF"
            />
          ) : (
            <>
              {value ? (
                <ThemedText
                  type="small"
                  style={styles.value}
                  lightColor="#6B7280"
                  darkColor="#9CA3AF"
                >
                  {value}
                </ThemedText>
              ) : null}
              <Feather
                name="chevron-right"
                size={20}
                color={theme.textSecondary}
              />
            </>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  value: {
    marginRight: Spacing.sm,
  },
});
