import {
  Montserrat_400Regular,
  Montserrat_700Bold,
  useFonts,
} from "@expo-google-fonts/montserrat";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { CustomSplash } from "../components/ui/SplashScreen";
import "../global.css";

// Import Auth and Notification Service
import { auth } from "../lib/firebase";
import { notificationService } from "../services/notificationService";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  const [loaded, error] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    async function prepare() {
      if (loaded) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await SplashScreen.hideAsync();
        setIsAnimationComplete(true);
      }
    }
    prepare();
  }, [loaded]);

  if (!loaded || !isAnimationComplete) {
    return <CustomSplash />;
  }

  return <RootLayoutNav colorScheme={colorScheme} />;
}

function RootLayoutNav({
  colorScheme,
}: {
  colorScheme: "light" | "dark" | null | undefined;
}) {
  const isDark = colorScheme === "dark";

  // --- Push Notification Registration Logic ---
  useEffect(() => {
    const setupNotifications = async (userId: string) => {
      try {
        const token =
          await notificationService.registerForPushNotificationsAsync();
        if (token) {
          console.log("Push Token Generated:", token);
          await notificationService.updateUserPushToken(userId, token);
        }
      } catch (err) {
        console.error("Notification setup failed:", err);
      }
    };

    // Listen for auth state changes to trigger registration
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setupNotifications(user.uid);
      }
    });

    return unsubscribe;
  }, []);
  // --------------------------------------------

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: isDark ? "#121212" : "#FFFFFF",
          },
          headerShadowVisible: false,
          headerTintColor: isDark ? "#FFFFFF" : "#000000",
          headerTitleStyle: {
            fontFamily: "Montserrat_700Bold",
          },
          contentStyle: {
            backgroundColor: isDark ? "#121212" : "#FFFFFF",
          },
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="group" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
