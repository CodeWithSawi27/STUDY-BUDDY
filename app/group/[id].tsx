import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
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
  FlatList,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme
} from "react-native";

// Custom UI Components
import { GroupHeader } from "../../components/ui/GroupHeader";
import { MemberItem } from "../../components/ui/MemberItem";
import { TaskItem } from "../../components/ui/TaskItem";
import { auth } from "../../lib/firebase";
import { supabase } from "../../lib/supabase";
import { taskService } from "../../services/taskService";

export default function GroupDetails() {
  // 1. Hook initialization
  const params = useLocalSearchParams();
  const id = params?.id as string;
  const name = params?.name as string;
  const router = useRouter();
  const isDark = useColorScheme() === "dark";

  // 2. State
  const [tasks, setTasks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tasks" | "members">("tasks");
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 3. Bottom Sheet Config
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["65%"], []);
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

  const { control, handleSubmit, reset } = useForm({
    defaultValues: { title: "", description: "" },
  });

  // 4. Lifecycle & Notification Setup
  useEffect(() => {
    if (id) {
      loadInitialData();
    }

    // Set notification handler inside useEffect to avoid Navigation Context errors
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    requestPermissions();
  }, [id]);

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted" && Platform.OS !== "web") {
      console.log("Notification permissions not granted");
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchTasks(), fetchGroupDetails(), fetchMembers()]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("group_members")
      .select(
        `
        role,
        users (
          full_name,
          avatar_url
        )
      `,
      )
      .eq("group_id", id);
    if (data) setMembers(data);
  };

  const fetchGroupDetails = async () => {
    const { data } = await supabase
      .from("study_groups")
      .select("invite_code")
      .eq("id", id)
      .single();
    if (data) setInviteCode(data.invite_code);
  };

  const fetchTasks = async () => {
    const { data, error } = await taskService.getGroupTasks(id);
    if (!error) setTasks(data);
  };

  const handleCreateTask = async (data: any) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const { error } = await taskService.createTask(
      data.title,
      data.description,
      deadline ? deadline.toISOString() : null,
      id,
      userId,
    );

    if (!error) {
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

  const completedCount = tasks.filter((t) => t.is_completed).length;

  // 5. Guards
  if (!id) return null;

  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 dark:bg-slate-950">
        <ActivityIndicator color="#4F46E5" size="large" />
      </View>
    );

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950 px-5">
      <GroupHeader
        name={name || "Group"}
        taskCount={tasks.length}
        completedCount={completedCount}
        inviteCode={inviteCode}
        onBack={() => router.back()}
      />

      <View className="flex-row bg-slate-200/50 dark:bg-slate-900 p-1 rounded-2xl mb-6">
        <TouchableOpacity
          onPress={() => setActiveTab("tasks")}
          className={`flex-1 py-3 rounded-xl ${activeTab === "tasks" ? "bg-white dark:bg-slate-800 shadow-sm" : ""}`}
        >
          <Text
            className={`text-center font-bold ${activeTab === "tasks" ? "text-slate-900 dark:text-white" : "text-slate-500"}`}
          >
            Tasks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("members")}
          className={`flex-1 py-3 rounded-xl ${activeTab === "members" ? "bg-white dark:bg-slate-800 shadow-sm" : ""}`}
        >
          <Text
            className={`text-center font-bold ${activeTab === "members" ? "text-slate-900 dark:text-white" : "text-slate-500"}`}
          >
            Members
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "tasks" ? (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={
            <View className="items-center mt-20 opacity-30">
              <Ionicons name="clipboard-outline" size={64} color="#94a3b8" />
              <Text className="text-slate-500 mt-4 font-medium">
                No tasks yet
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TaskItem
              title={item.title}
              description={item.description}
              deadline={item.deadline}
              isCompleted={item.is_completed}
              onToggle={() => toggleTask(item.id, item.is_completed)}
            />
          )}
        />
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => (
            <MemberItem
              fullName={item.users?.full_name || "Member"}
              avatarUrl={item.users?.avatar_url}
              role={item.role}
            />
          )}
        />
      )}

      {activeTab === "tasks" && (
        <TouchableOpacity
          onPress={() => bottomSheetRef.current?.expand()}
          className="absolute bottom-10 right-6 bg-indigo-600 w-16 h-16 rounded-3xl items-center justify-center shadow-xl shadow-indigo-400"
        >
          <Plus size={32} color="white" strokeWidth={3} />
        </TouchableOpacity>
      )}

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: isDark ? "#0f172a" : "white" }}
      >
        <BottomSheetView className="p-6">
          <Text className="text-xl font-extrabold text-slate-900 dark:text-white mb-6">
            Create Group Task
          </Text>
          <View className="gap-y-4">
            <Controller
              control={control}
              name="title"
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl dark:text-white font-medium"
                  placeholder="What needs to be done?"
                  placeholderTextColor="#94a3b8"
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl flex-row justify-between items-center"
            >
              <Text
                className={
                  deadline
                    ? "text-indigo-600 font-bold"
                    : "text-slate-400 font-medium"
                }
              >
                {deadline ? deadline.toLocaleString() : "Set Deadline"}
              </Text>
              <Ionicons
                name="calendar"
                size={20}
                color={deadline ? "#4F46E5" : "#94a3b8"}
              />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={deadline || new Date()}
                mode="datetime"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, date) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (date) setDeadline(date);
                }}
                minimumDate={new Date()}
              />
            )}
            <TouchableOpacity
              onPress={handleSubmit(handleCreateTask)}
              className="bg-indigo-600 p-4 rounded-2xl items-center mt-2"
            >
              <Text className="text-white font-bold text-lg">
                Add to Workspace
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
