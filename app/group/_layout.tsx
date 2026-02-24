import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { Colors } from "../../constants/Colors";

export default function GroupLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <Stack
      screenOptions={{
        headerShown: false, // This covers all screens in this stack
        animation: "slide_from_right",
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      {/* Remove the .tsx extension here */}
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
