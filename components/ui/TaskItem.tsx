import { CheckCircle2, Circle, Clock } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface TaskItemProps {
  title: string;
  description?: string;
  deadline?: string;
  isCompleted: boolean;
  onToggle: () => void;
}

export function TaskItem({
  title,
  description,
  deadline,
  isCompleted,
  onToggle,
}: TaskItemProps) {
  const dateObj = deadline ? new Date(deadline) : null;
  const isOverdue = dateObj && dateObj < new Date() && !isCompleted;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onToggle}
      className={`bg-white dark:bg-slate-900 p-4 rounded-[24px] mb-3 border ${
        isCompleted
          ? "border-transparent opacity-60"
          : "border-slate-100 dark:border-slate-800"
      } shadow-sm flex-row items-start`}
    >
      <View className="mt-1">
        {isCompleted ? (
          <CheckCircle2 size={24} color="#10B981" />
        ) : (
          <Circle size={24} color={isOverdue ? "#EF4444" : "#cbd5e1"} />
        )}
      </View>

      <View className="flex-1 ml-4">
        <Text
          className={`text-base font-bold ${isCompleted ? "line-through text-slate-400" : "text-slate-900 dark:text-white"}`}
        >
          {title}
        </Text>

        {description && !isCompleted && (
          <Text className="text-slate-500 text-sm mt-1" numberOfLines={2}>
            {description}
          </Text>
        )}

        {dateObj && (
          <View className="flex-row items-center mt-3">
            <View
              className={`flex-row items-center px-2 py-1 rounded-lg ${isOverdue ? "bg-red-50" : "bg-slate-50 dark:bg-slate-800"}`}
            >
              <Clock size={12} color={isOverdue ? "#EF4444" : "#64748B"} />
              <Text
                className={`text-[11px] font-bold ml-1 ${isOverdue ? "text-red-600" : "text-slate-500"}`}
              >
                {dateObj.toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                })}{" "}
                •{" "}
                {dateObj.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
