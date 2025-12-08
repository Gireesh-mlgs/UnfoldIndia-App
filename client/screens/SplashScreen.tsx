import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Gradients, Colors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";

const { width } = Dimensions.get("window");
const ONBOARDING_KEY = "@unfold_india_onboarding_complete";

export default function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isReady, setIsReady] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        setHasCompletedOnboarding(value === "true");
      } catch (error) {
        setHasCompletedOnboarding(false);
      }
      setIsReady(true);
    };

    checkOnboarding();
  }, []);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
    logoScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.5)) });
    
    textOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    textTranslateY.value = withDelay(400, withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) }));
  }, []);

  useEffect(() => {
    if (!isReady || hasCompletedOnboarding === null) return;

    const timer = setTimeout(() => {
      if (hasCompletedOnboarding) {
        navigation.replace("Main");
      } else {
        navigation.replace("Onboarding");
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isReady, hasCompletedOnboarding]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <LinearGradient
      colors={Gradients.navyIndigo}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
        <ThemedText
          type="h2"
          style={styles.title}
          lightColor="#FFFFFF"
          darkColor="#FFFFFF"
        >
          Unfold India
        </ThemedText>
        <ThemedText
          type="small"
          style={styles.subtitle}
          lightColor="rgba(255,255,255,0.8)"
          darkColor="rgba(255,255,255,0.8)"
        >
          Discover India's hidden gems
        </ThemedText>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
  },
  textContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  title: {
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  subtitle: {
    marginTop: 8,
  },
});
