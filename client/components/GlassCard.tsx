import React from "react";
import { StyleSheet, ViewStyle, Pressable, Platform } from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  blurIntensity?: number;
  borderRadius?: number;
  padding?: number;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GlassCard({
  children,
  style,
  onPress,
  blurIntensity = 30,
  borderRadius = BorderRadius.xl,
  padding = Spacing.md,
}: GlassCardProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, springConfig);
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, springConfig);
    }
  };

  const containerStyle = [
    styles.container,
    {
      borderRadius,
      borderColor: theme.glassBorder,
      backgroundColor: Platform.OS === "android" ? theme.glassBackground : "transparent",
    },
    Shadows.glass,
    style,
  ];

  const content = (
    <>
      {Platform.OS === "ios" && (
        <BlurView
          intensity={blurIntensity}
          tint={isDark ? "dark" : "light"}
          style={[StyleSheet.absoluteFill, { borderRadius }]}
        />
      )}
      <Animated.View style={[styles.content, { padding }]}>
        {children}
      </Animated.View>
    </>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[containerStyle, animatedStyle]}
      >
        {content}
      </AnimatedPressable>
    );
  }

  return (
    <Animated.View style={[containerStyle, animatedStyle]}>
      {content}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderWidth: 1,
  },
  content: {
    zIndex: 1,
  },
});
