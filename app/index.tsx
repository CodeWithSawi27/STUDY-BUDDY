import { Redirect } from "expo-router";
// For now, we will use a placeholder.
// Later, this should check your Firebase/Supabase session.

export default function Index() {
  const session = null; // Replace with: const { session } = useAuthStore();

  if (!session) {
    // If no user is found, redirect to the login screen
    return <Redirect href="/(auth)/login" />;
  }

  // If user is found, redirect to the main dashboard
  return <Redirect href="/(tabs)" />;
}
