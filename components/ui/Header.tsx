import { Bell } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  userName?: string | null;
  loading?: boolean;
}

export function Header({ userName, loading }: HeaderProps) {
  // Fallback greeting if name isn't set yet
  const displayName = loading ? "..." : userName || "Student";

  return (
    <View className="flex-row justify-between items-center mt-14 mb-6">
      <View>
        <Text className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Good morning, {displayName}
        </Text>
        <Text className="text-slate-500 dark:text-slate-400 font-medium mt-1">
          Welcome to Study Hub
        </Text>
      </View>
      <TouchableOpacity className="bg-white dark:bg-slate-800 p-3 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm">
        <Bell size={20} color="#0f172a" />
      </TouchableOpacity>
    </View>
  );
}
