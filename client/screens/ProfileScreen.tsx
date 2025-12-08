import React, { useEffect } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
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
import { useAuth } from "@/contexts/AuthContext";
import { ThemedText } from "@/components/ThemedText";
import { StatsCard } from "@/components/StatsCard";
import { SettingsItem } from "@/components/SettingsItem";
import { GradientButton } from "@/components/GradientButton";
import { Spacing, BorderRadius, Shadows, Gradients } from "@/constants/theme";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout, refreshUser } = useAuth();

  const [refreshing, setRefreshing] = React.useState(false);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  };

  const handleNotificationsToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await logout();
  };

  const displayName = user?.displayName || user?.username || "Guest User";
  const username = user?.username || "guest";
  const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "GU";

  const stats = user?.stats || { collections: 0, favorites: 0, following: 0 };

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
                    {initials}
                  </ThemedText>
                </LinearGradient>
              </View>
            </LinearGradient>
          </View>
          <ThemedText type="h2" style={styles.userName}>
            {displayName}
          </ThemedText>
          <ThemedText
            type="body"
            style={styles.userHandle}
            lightColor="#6B7280"
            darkColor="#9CA3AF"
          >
            @{username}
          </ThemedText>
        </Animated.View>

        <Animated.View style={[styles.statsSection, contentAnimatedStyle]}>
          <View style={styles.statsRow}>
            <StatsCard
              value={stats.collections.toString()}
              label="Collections"
              gradient={Gradients.purpleBlue}
            />
            <View style={{ width: Spacing.md }} />
            <StatsCard
              value={stats.favorites.toString()}
              label="Favorites"
              gradient={Gradients.purplePink}
            />
            <View style={{ width: Spacing.md }} />
            <StatsCard
              value={stats.following.toString()}
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
              onPress={handleSettingsPress}
            />
            <SettingsItem
              icon="help-circle"
              label="Help & Support"
              onPress={handleSettingsPress}
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
              onPress={handleSettingsPress}
              isFirst
            />
            <SettingsItem
              icon="credit-card"
              label="Subscription"
              value="Premium"
              onPress={handleSettingsPress}
            />
            <SettingsItem
              icon="info"
              label="About"
              value="v1.0.0"
              onPress={handleSettingsPress}
              isLast
            />
          </View>
        </Animated.View>

        {isAuthenticated ? (
          <Animated.View style={[styles.logoutSection, contentAnimatedStyle]}>
            <GradientButton
              title="Sign Out"
              onPress={handleLogout}
              gradient={["#EF4444", "#DC2626"]}
              style={styles.logoutButton}
            />
          </Animated.View>
        ) : null}
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
  logoutSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  logoutButton: {
    width: "100%",
  },
});
