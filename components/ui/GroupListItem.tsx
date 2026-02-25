import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface GroupListItemProps {
  name: string;
  inviteCode: string;
  onPress: () => void;
}

export function GroupListItem({
  name,
  inviteCode,
  onPress,
}: GroupListItemProps) {
  // Get the first letter for the avatar
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="bg-white dark:bg-slate-900 p-4 rounded-[24px] mb-3 border border-slate-100 dark:border-slate-800 shadow-sm flex-row items-center"
    >
      <View className="w-12 h-12 rounded-[16px] bg-[#eaffd9] items-center justify-center mr-4">
        {/* Using the vibrant green from the inspiration image */}
        <Text className="text-[#3a7315] font-extrabold text-lg">{initial}</Text>
      </View>

      <View className="flex-1">
        <Text className="text-base font-bold text-slate-900 dark:text-white mb-0.5">
          {name}
        </Text>
        <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium">
          Code: {inviteCode}
        </Text>
      </View>

      <View className="items-end justify-center">
        <View className="bg-[#eaffd9] px-2 py-1 rounded-md mb-1">
          <Text className="text-[#3a7315] text-[10px] font-bold uppercase tracking-wider">
            Active
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
