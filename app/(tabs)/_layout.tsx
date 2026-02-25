import { Tabs } from "expo-router";
import { CheckSquare, UserCircle, Users } from "lucide-react-native";
import { Platform, useColorScheme } from "react-native";
import { Colors } from "../../constants/Colors";

export default function TabsLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        // Active state color
        tabBarActiveTintColor: theme.primary[500],
        tabBarInactiveTintColor: theme.text.muted,
        headerShown: false,

        // Fix: 'tabBarHideOnKeyboard' prevents the tab bar from being
        // pushed up or becoming unresponsive when the keyboard is open.
        tabBarHideOnKeyboard: true,

        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          // Fixed Height: 100 was likely too tall and intercepting
          // screen touches or pushing the hit-box off-screen.
          height: Platform.OS === "ios" ? 88 : 64,
          paddingBottom: Platform.OS === "ios" ? 30 : 12,
          paddingTop: 10,
          elevation: 0, // Removes shadow on Android for a cleaner look
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          fontFamily: "Montserrat_400Regular", // Using your loaded font
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Groups",
          tabBarIcon: ({ color, size }) => (
            <Users size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color, size }) => (
            <CheckSquare size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <UserCircle size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
