import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface OverviewCardProps {
  groupCount: number;
  onCreatePress: () => void;
}

export function OverviewCard({ groupCount, onCreatePress }: OverviewCardProps) {
  return (
    <View className="bg-white dark:bg-slate-900 p-6 rounded-[32px] mb-8 shadow-sm border border-slate-100 dark:border-slate-800">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-slate-500 dark:text-slate-400 font-medium text-base">
          Your active groups
        </Text>
      </View>
      <Text className="text-[48px] font-extrabold text-slate-900 dark:text-white mb-6 tracking-tighter">
        {groupCount}
      </Text>
      <TouchableOpacity
        onPress={onCreatePress}
        className="bg-slate-900 dark:bg-white py-4 rounded-full items-center shadow-md shadow-slate-300 dark:shadow-none"
      >
        <Text className="text-white dark:text-slate-900 font-bold text-lg">
          Create new group
        </Text>
      </TouchableOpacity>
    </View>
  );
}
