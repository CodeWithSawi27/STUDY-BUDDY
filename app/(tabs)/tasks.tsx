import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { auth } from "../../lib/firebase";
import { taskService } from "../../services/taskService";

export default function TasksScreen() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchGlobalTasks();
  }, []);

  // --- Animation Logic for "Hold to Delete" ---
  const scale = useSharedValue(1);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.96); // Slight shrink to feel "pressed"
  };

  const onPressOut = () => {
    scale.value = withSpring(1); // Pop back
  };

  const fetchGlobalTasks = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const { data, error } = await taskService.getUserTasks(userId);
    if (!error && data) {
      const groups = data.reduce((acc: any, task: any) => {
        const groupName = task.study_groups?.name || "Other";
        if (!acc[groupName]) acc[groupName] = [];
        acc[groupName].push(task);
        return acc;
      }, {});
      const sectionData = Object.keys(groups)
        .map((name) => ({
          title: name,
          data: groups[name],
        }))
        .sort((a, b) => a.title.localeCompare(b.title));
      setSections(sectionData);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const handleDelete = (taskId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert("Delete Task", "Are you sure you want to remove this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const { error } = await taskService.deleteTask(taskId);
          if (!error) fetchGlobalTasks();
        },
      },
    ]);
  };

  // --- Natural Swipe Actions ---
  const renderRightActions = (
    prog: Reanimated.SharedValue<number>,
    drag: Reanimated.SharedValue<number>,
  ) => {
    const animatedIconStyle = useAnimatedStyle(() => {
      const iconScale = interpolate(prog.value, [0, 1], [0.5, 1], "clamp");
      const opacity = interpolate(prog.value, [0, 1], [0, 1], "clamp");

      return {
        transform: [{ scale: iconScale }],
        opacity: opacity,
      };
    });

    return (
      <View style={{ width: 80, marginLeft: 10, marginBottom: 12 }}>
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => handleDelete("")} // Logic moved to renderItem for closure
          className="bg-red-500 flex-1 justify-center items-center rounded-2xl shadow-sm shadow-red-200"
        >
          <Reanimated.View style={animatedIconStyle}>
            <Ionicons name="trash-outline" size={26} color="white" />
          </Reanimated.View>
        </TouchableOpacity>
      </View>
    );
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
          <Text className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 px-1 mt-4 mb-2">
            {title}
          </Text>
        )}
        renderItem={({ item }) => (
          <ReanimatedSwipeable
            friction={2}
            rightThreshold={40}
            renderRightActions={(prog, drag) => (
              <View style={{ width: 80, marginLeft: 10, marginBottom: 12 }}>
                <TouchableOpacity
                  onPress={() => handleDelete(item.id)}
                  className="bg-red-500 flex-1 justify-center items-center rounded-2xl"
                >
                  <Reanimated.View
                    style={useAnimatedStyle(() => ({
                      transform: [
                        { scale: interpolate(prog.value, [0, 1], [0.6, 1]) },
                      ],
                      opacity: prog.value,
                    }))}
                  >
                    <Ionicons name="trash-outline" size={26} color="white" />
                  </Reanimated.View>
                </TouchableOpacity>
              </View>
            )}
          >
            <Reanimated.View style={cardStyle}>
              <TouchableOpacity
                activeOpacity={1} // Using our own scale animation instead
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onLongPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  handleDelete(item.id);
                }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  taskService
                    .toggleTaskStatus(item.id, item.is_completed)
                    .then(() => fetchGlobalTasks());
                }}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl mb-3 border border-slate-100 dark:border-slate-800 flex-row items-center shadow-sm shadow-slate-200"
              >
                <Ionicons
                  name={
                    item.is_completed ? "checkmark-circle" : "ellipse-outline"
                  }
                  size={26}
                  color={item.is_completed ? "#10B981" : "#cbd5e1"}
                />
                <View className="ml-3 flex-1">
                  <Text
                    className={`text-base font-medium ${item.is_completed ? "line-through text-slate-400" : "text-slate-900 dark:text-white"}`}
                  >
                    {item.title}
                  </Text>
                </View>
              </TouchableOpacity>
            </Reanimated.View>
          </ReanimatedSwipeable>
        )}
      />
    </View>
  );
}
