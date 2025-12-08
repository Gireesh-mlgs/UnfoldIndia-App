import React, { useEffect } from "react";
import { View, StyleSheet, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Gradients } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";

const { width } = Dimensions.get("window");

export default function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
    logoScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.5)) });
    
    textOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    textTranslateY.value = withDelay(400, withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) }));

    const timer = setTimeout(() => {
      navigation.replace("Main");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

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
      colors={Gradients.purpleBlue}
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
          Glassify
        </ThemedText>
        <ThemedText
          type="small"
          style={styles.subtitle}
          lightColor="rgba(255,255,255,0.8)"
          darkColor="rgba(255,255,255,0.8)"
        >
          Premium Experience
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
    backgroundColor: "rgba(255, 255, 255, 0.2)",
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
