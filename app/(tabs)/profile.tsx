import { useRouter } from "expo-router";
import { LogOut } from "lucide-react-native";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { auth } from "../../lib/firebase"; // Adjust path if needed

export default function ProfileScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await auth.signOut();
            // Router will automatically redirect to (auth) if your
            // root layout handles auth protected routes
            router.replace("/(auth)/login");
          } catch (error) {
            Alert.alert("Error", "Failed to sign out");
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950 px-6 justify-center items-center">
      <View className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full items-center justify-center mb-4">
        <Text className="text-indigo-600 dark:text-indigo-400 text-2xl font-bold">
          {user?.email?.charAt(0).toUpperCase()}
        </Text>
      </View>

      <Text className="text-xl font-bold text-slate-900 dark:text-white mb-1">
        Account Profile
      </Text>
      <Text className="text-slate-500 mb-8">{user?.email}</Text>

      <TouchableOpacity
        onPress={handleLogout}
        className="flex-row items-center bg-red-50 dark:bg-red-900/10 px-6 py-4 rounded-2xl border border-red-100 dark:border-red-900/30 w-full justify-center"
      >
        <LogOut size={20} color="#ef4444" strokeWidth={2.5} />
        <Text className="text-red-500 font-bold ml-2 text-lg">Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}
