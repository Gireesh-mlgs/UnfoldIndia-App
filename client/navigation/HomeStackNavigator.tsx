import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "@/screens/HomeScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { Feather } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export type HomeStackParamList = {
  Home: undefined;
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
          headerTitle: () => <HeaderTitle title="Glassify" />,
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
    </Stack.Navigator>
  );
}
