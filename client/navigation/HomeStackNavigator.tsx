import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "@/screens/HomeScreen";
import PlaceDetailScreen from "@/screens/PlaceDetailScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { Feather } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export type HomeStackParamList = {
  Home: undefined;
  PlaceDetail: { placeId: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  const screenOptions = useScreenOptions();
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Unfold India" />,
          headerRight: () => (
            <Pressable onPress={toggleTheme} hitSlop={10}>
              <Feather
                name={isDark ? "sun" : "moon"}
                size={22}
                color={theme.text}
              />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="PlaceDetail"
        component={PlaceDetailScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
