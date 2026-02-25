import { ChevronLeft, Share2 } from "lucide-react-native";
import React from "react";
import { Share, Text, TouchableOpacity, View } from "react-native";

interface GroupHeaderProps {
  name: string;
  taskCount: number;
  completedCount: number;
  onBack: () => void;
  inviteCode: string;
}

export function GroupHeader({
  name,
  taskCount,
  completedCount,
  onBack,
  inviteCode,
}: GroupHeaderProps) {
  const progress =
    taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

  const onShare = async () => {
    try {
      await Share.share({
        message: `Join my study group "${name}" on Study Hub! Use code: ${inviteCode}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View className="mt-14 mb-6">
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity
          onPress={onBack}
          className="bg-white dark:bg-slate-900 p-2 rounded-full border border-slate-100 dark:border-slate-800"
        >
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onShare}
          className="bg-white dark:bg-slate-900 p-2 rounded-full border border-slate-100 dark:border-slate-800"
        >
          <Share2 size={20} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between items-end">
        <View className="flex-1 mr-4">
          <Text
            className="text-3xl font-extrabold text-slate-900 dark:text-white"
            numberOfLines={1}
          >
            {name}
          </Text>
          <Text className="text-slate-500 font-medium mt-1">
            {completedCount}/{taskCount} tasks completed
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-indigo-600 font-bold text-lg">{progress}%</Text>
          <View className="w-20 h-2 bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <View
              className="h-full bg-indigo-600 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
