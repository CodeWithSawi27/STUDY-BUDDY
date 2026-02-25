import React from "react";
import { Image, Text, View } from "react-native";

interface MemberItemProps {
  fullName: string;
  role: "admin" | "member";
  avatarUrl?: string;
}

export function MemberItem({ fullName, role, avatarUrl }: MemberItemProps) {
  return (
    <View className="bg-white dark:bg-slate-900 p-4 rounded-[24px] mb-3 border border-slate-100 dark:border-slate-800 flex-row items-center">
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          className="w-12 h-12 rounded-full bg-slate-200"
        />
      ) : (
        <View className="w-12 h-12 rounded-full bg-indigo-100 items-center justify-center">
          <Text className="text-indigo-600 font-bold text-lg">
            {fullName.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      <View className="ml-4 flex-1">
        <Text className="text-base font-bold text-slate-900 dark:text-white">
          {fullName}
        </Text>
        <Text className="text-slate-500 text-xs capitalize font-medium">
          {role}
        </Text>
      </View>

      {role === "admin" && (
        <View className="bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
          <Text className="text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
            Owner
          </Text>
        </View>
      )}
    </View>
  );
}
