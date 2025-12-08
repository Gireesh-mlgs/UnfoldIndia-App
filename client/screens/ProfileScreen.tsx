import React, { useEffect } from "react";
import { View, StyleSheet, ScrollView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
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
import { StatsCard } from "@/components/StatsCard";
import { SettingsItem } from "@/components/SettingsItem";
import { Spacing, BorderRadius, Shadows, Gradients } from "@/constants/theme";
import { userStats } from "@/data/mockData";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark, toggleTheme } = useTheme();

  const avatarScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);

  useEffect(() => {
    avatarScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    contentOpacity.value = withDelay(
      200,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) })
    );
    contentTranslateY.value = withDelay(
      200,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) })
    );
  }, []);

  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const handleNotificationsToggle = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSettingsPress = (setting: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

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
      >
        <Animated.View style={[styles.avatarSection, avatarAnimatedStyle]}>
          <View style={[styles.avatarContainer, Shadows.glass]}>
            <LinearGradient
              colors={Gradients.purplePink}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarBorder}
            >
              <View
                style={[
                  styles.avatarInner,
                  { backgroundColor: theme.backgroundRoot },
                ]}
              >
                <LinearGradient
                  colors={Gradients.purpleBlue}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatar}
                >
                  <ThemedText
                    type="h1"
                    style={styles.avatarText}
                    lightColor="#FFFFFF"
                    darkColor="#FFFFFF"
                  >
                    JD
                  </ThemedText>
                </LinearGradient>
              </View>
            </LinearGradient>
          </View>
          <ThemedText type="h2" style={styles.userName}>
            John Doe
          </ThemedText>
          <ThemedText
            type="body"
            style={styles.userHandle}
            lightColor="#6B7280"
            darkColor="#9CA3AF"
          >
            @johndoe
          </ThemedText>
        </Animated.View>

        <Animated.View style={[styles.statsSection, contentAnimatedStyle]}>
          <View style={styles.statsRow}>
            <StatsCard
              value={userStats.collections}
              label="Collections"
              gradient={Gradients.purpleBlue}
            />
            <View style={{ width: Spacing.md }} />
            <StatsCard
              value={userStats.favorites}
              label="Favorites"
              gradient={Gradients.purplePink}
            />
            <View style={{ width: Spacing.md }} />
            <StatsCard
              value={userStats.following}
              label="Following"
              gradient={Gradients.blueCyan}
            />
          </View>
        </Animated.View>

        <Animated.View style={[styles.settingsSection, contentAnimatedStyle]}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Settings
          </ThemedText>
          <View style={[styles.settingsGroup, Shadows.glass]}>
            <SettingsItem
              icon="moon"
              label="Dark Mode"
              isSwitch
              switchValue={isDark}
              onSwitchChange={toggleTheme}
              isFirst
            />
            <SettingsItem
              icon="bell"
              label="Notifications"
              isSwitch
              switchValue={false}
              onSwitchChange={handleNotificationsToggle}
            />
            <SettingsItem
              icon="shield"
              label="Privacy"
              onPress={() => handleSettingsPress("privacy")}
            />
            <SettingsItem
              icon="help-circle"
              label="Help & Support"
              onPress={() => handleSettingsPress("help")}
              isLast
            />
          </View>
        </Animated.View>

        <Animated.View style={[styles.settingsSection, contentAnimatedStyle]}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Account
          </ThemedText>
          <View style={[styles.settingsGroup, Shadows.glass]}>
            <SettingsItem
              icon="user"
              label="Edit Profile"
              onPress={() => handleSettingsPress("profile")}
              isFirst
            />
            <SettingsItem
              icon="credit-card"
              label="Subscription"
              value="Premium"
              onPress={() => handleSettingsPress("subscription")}
            />
            <SettingsItem
              icon="info"
              label="About"
              value="v1.0.0"
              onPress={() => handleSettingsPress("about")}
              isLast
            />
          </View>
        </Animated.View>
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
  avatarSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    marginBottom: Spacing.md,
  },
  avatarBorder: {
    width: 130,
    height: 130,
    borderRadius: 65,
    padding: 4,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 63,
    padding: 4,
  },
  avatar: {
    flex: 1,
    borderRadius: 59,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontWeight: "700",
    letterSpacing: 2,
  },
  userName: {
    marginBottom: Spacing.xs,
  },
  userHandle: {
    opacity: 0.7,
  },
  statsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: "row",
  },
  settingsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  settingsGroup: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
});
