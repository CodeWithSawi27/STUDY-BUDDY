import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { auth } from "../../lib/firebase";
import { taskService } from "../../services/taskService";

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function GroupDetails() {
  const { id, name } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;

  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Deadline States
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Bottom Sheet Logic
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["65%"], []); // Increased to fit date picker button
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    [],
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { title: "", description: "" },
  });

  useEffect(() => {
    fetchTasks();
    requestPermissions();
  }, [id]);

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please enable notifications to receive task reminders.",
      );
    }
  };

  const fetchTasks = async () => {
    const { data, error } = await taskService.getGroupTasks(id as string);
    if (!error) setTasks(data);
    setLoading(false);
  };

  const scheduleNotification = async (taskTitle: string, taskDate: Date) => {
    // Schedule for 15 minutes before the deadline
    const trigger = new Date(taskDate.getTime() - 15 * 60000);

    if (trigger > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Upcoming Deadline! ✍️",
          body: `"${taskTitle}" for ${name} is due in 15 minutes.`,
          data: { groupId: id },
        },
        trigger,
      });
    }
  };

  const handleCreateTask = async (data: any) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const { data: newTask, error } = await taskService.createTask(
      data.title,
      data.description,
      deadline ? deadline.toISOString() : null,
      id as string,
      userId,
    );

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      if (deadline) {
        await scheduleNotification(data.title, deadline);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      bottomSheetRef.current?.close();
      reset();
      setDeadline(null);
      fetchTasks();
    }
  };

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { error } = await taskService.toggleTaskStatus(taskId, currentStatus);
    if (!error) {
      setTasks(
        tasks.map((t) =>
          t.id === taskId ? { ...t, is_completed: !currentStatus } : t,
        ),
      );
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDeadline(selectedDate);
    }
  };

  if (loading) return <ActivityIndicator className="flex-1" color="#1A1F95" />;

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950 px-4">
      {/* Header */}
      <View className="mt-14 mb-6 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="chevron-back" size={28} color="#4F46E5" />
        </TouchableOpacity>
        <View className="ml-2">
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">
            {name}
          </Text>
          <Text className="text-slate-500 text-sm">Group Workspace</Text>
        </View>
      </View>

      {/* Task List */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center mt-20 opacity-40">
            <Ionicons name="clipboard-outline" size={64} color="#94a3b8" />
            <Text className="text-slate-500 mt-4 font-medium">
              No tasks for this group yet
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-white dark:bg-slate-900 p-4 rounded-3xl mb-3 border border-slate-100 dark:border-slate-800 flex-row items-center">
            <TouchableOpacity
              onPress={() => toggleTask(item.id, item.is_completed)}
            >
              <Ionicons
                name={
                  item.is_completed ? "checkmark-circle" : "ellipse-outline"
                }
                size={30}
                color={item.is_completed ? "#10B981" : "#cbd5e1"}
              />
            </TouchableOpacity>
            <View className="ml-3 flex-1">
              <Text
                className={`text-base font-semibold ${item.is_completed ? "line-through text-slate-400" : "text-slate-900 dark:text-white"}`}
              >
                {item.title}
              </Text>
              <View className="flex-row items-center mt-1">
                {item.deadline && (
                  <>
                    <Ionicons
                      name="calendar-outline"
                      size={12}
                      color="#f59e0b"
                    />
                    <Text className="text-amber-600 text-xs font-medium ml-1 mr-3">
                      {new Date(item.deadline).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </>
                )}
                {item.description && (
                  <Text
                    className="text-slate-500 text-xs flex-1"
                    numberOfLines={1}
                  >
                    {item.description}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        onPress={() => bottomSheetRef.current?.expand()}
        className="absolute bottom-10 right-6 bg-indigo-600 w-16 h-16 rounded-full items-center justify-center shadow-xl shadow-indigo-400"
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{
          backgroundColor: isDark ? "#525252" : "#cbd5e1",
        }}
        backgroundStyle={{
          backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
        }}
      >
        <BottomSheetView className="p-6">
          <Text className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Add Group Task
          </Text>
          <View className="gap-y-4">
            <Controller
              control={control}
              name="title"
              rules={{ required: "Task title is required" }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl text-slate-900 dark:text-white"
                  placeholder="Task Title (e.g. Finish Chapter 1)"
                  placeholderTextColor={isDark ? "#9CA3AF" : "#64748B"}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />

            {/* Deadline Picker Toggle */}
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl flex-row items-center justify-between"
            >
              <Text
                className={
                  deadline
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-500"
                }
              >
                {deadline ? deadline.toLocaleString() : "Set a Deadline"}
              </Text>
              <Ionicons
                name="time"
                size={20}
                color={deadline ? "#4F46E5" : "#64748B"}
              />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={deadline || new Date()}
                mode="datetime"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl text-slate-900 dark:text-white"
                  placeholder="Optional Description"
                  placeholderTextColor={isDark ? "#9CA3AF" : "#64748B"}
                  multiline
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            <TouchableOpacity
              onPress={handleSubmit(handleCreateTask)}
              className="bg-indigo-600 p-4 rounded-2xl items-center mt-2"
            >
              <Text className="text-white font-bold text-lg">Add to Group</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
