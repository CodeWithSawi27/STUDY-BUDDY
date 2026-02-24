import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { auth } from "../../lib/firebase";
import { taskService } from "../../services/taskService";

export default function TasksScreen() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchGlobalTasks();
  }, []);

  const fetchGlobalTasks = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const { data, error } = await taskService.getUserTasks(userId);

    if (!error && data) {
      // Transforming flat data into sections grouped by study_groups.name
      const groups = data.reduce((acc: any, task: any) => {
        const groupName = task.study_groups?.name || "Other";
        if (!acc[groupName]) {
          acc[groupName] = [];
        }
        acc[groupName].push(task);
        return acc;
      }, {});

      const sectionData = Object.keys(groups).map((name) => ({
        title: name,
        data: groups[name],
      }));

      setSections(sectionData);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const handleToggle = async (taskId: string, currentStatus: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { error } = await taskService.toggleTaskStatus(taskId, currentStatus);
    if (!error) fetchGlobalTasks();
  };

  if (loading) return <ActivityIndicator className="flex-1" color="#4F46E5" />;

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950 px-4">
      <View className="mt-14 mb-6">
        <Text className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Agenda
        </Text>
        <Text className="text-slate-500 dark:text-slate-400">
          All your tasks in one place
        </Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchGlobalTasks}
          />
        }
        renderSectionHeader={({ section: { title } }) => (
          <View className="mt-4 mb-2">
            <Text className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 px-1">
              {title}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View className="bg-white dark:bg-slate-900 p-4 rounded-2xl mb-3 border border-slate-100 dark:border-slate-800 flex-row items-center">
            <TouchableOpacity
              onPress={() => handleToggle(item.id, item.is_completed)}
            >
              <Ionicons
                name={
                  item.is_completed ? "checkmark-circle" : "ellipse-outline"
                }
                size={26}
                color={item.is_completed ? "#10B981" : "#cbd5e1"}
              />
            </TouchableOpacity>
            <View className="ml-3 flex-1">
              <Text
                className={`text-base font-medium ${
                  item.is_completed
                    ? "line-through text-slate-400"
                    : "text-slate-900 dark:text-white"
                }`}
              >
                {item.title}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center mt-20 opacity-40">
            <Ionicons name="calendar-clear-outline" size={64} color="#94a3b8" />
            <Text className="text-slate-500 mt-4 font-medium text-center">
              Clear schedule!{"\n"}No pending tasks found.
            </Text>
          </View>
        }
      />
    </View>
  );
}
