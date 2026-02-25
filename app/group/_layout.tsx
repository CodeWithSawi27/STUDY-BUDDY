import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { Colors } from "../../constants/Colors";

export default function GroupLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "ios_from_right",
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
