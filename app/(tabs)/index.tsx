import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router"; // Added useRouter
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
  Keyboard,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../lib/firebase";
import { groupService } from "../../services/groupService";

export default function Dashboard() {
  const router = useRouter(); // Initialize router
  const [groups, setGroups] = useState<any[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["60%"], []);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: "", description: "", inviteCode: "" },
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    const filtered = groups.filter((g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredGroups(filtered);
  }, [searchQuery, groups]);

  const fetchGroups = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const { data, error } = await groupService.getUserGroups(userId);
      if (!error && data) {
        setGroups(data.map((item: any) => item.study_groups));
      }
    }
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchGroups();
  };

  const handleOpenModal = (tab: "create" | "join") => {
    setActiveTab(tab);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    bottomSheetRef.current?.expand();
  };

  const onCreateGroup = async (data: any) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const { error } = await groupService.createGroup(
      data.name,
      data.description,
      userId,
    );
    handleResponse(error, "Group Created!");
  };

  const onJoinGroup = async (data: any) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const { error } = await groupService.joinGroupByCode(
      data.inviteCode,
      userId,
    );
    handleResponse(error, "Joined Group!");
  };

  const handleResponse = (error: any, successMsg: string) => {
    if (error) {
      Alert.alert("Error", error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      bottomSheetRef.current?.close();
      Keyboard.dismiss();
      reset();
      fetchGroups();
      Alert.alert("Success", successMsg);
    }
  };

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

  if (loading) return <ActivityIndicator className="flex-1" color="#1A1F95" />;

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950 px-4">
      {/* Header & Search */}
      <View className="mt-14 mb-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Study Hub
          </Text>
          <TouchableOpacity
            onPress={() => handleOpenModal("join")}
            className="bg-indigo-100 dark:bg-indigo-900/40 px-4 py-2 rounded-full"
          >
            <Text className="text-indigo-600 dark:text-indigo-300 font-bold">
              Join Group
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center bg-white dark:bg-slate-900 mt-4 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            placeholder="Search your groups..."
            className="flex-1 ml-2 text-slate-900 dark:text-white h-10"
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredGroups}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="items-center mt-20 opacity-50">
            <Ionicons name="library-outline" size={80} color="#94a3b8" />
            <Text className="text-slate-500 mt-4 text-lg font-medium">
              No groups found
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            className="bg-white dark:bg-slate-900 p-5 rounded-3xl mb-4 border border-slate-100 dark:border-slate-800 shadow-sm flex-row items-center"
            onPress={() => {
              // Navigate to dynamic group route passing ID and Name
              router.push({
                pathname: "/group/[id]",
                params: { id: item.id, name: item.name },
              });
            }}
          >
            <View className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900 items-center justify-center mr-4">
              <Text className="text-indigo-600 dark:text-indigo-300 font-bold text-lg">
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                {item.name}
              </Text>
              <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
                Code: {item.invite_code}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        onPress={() => handleOpenModal("create")}
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
        handleIndicatorStyle={{ backgroundColor: "#cbd5e1", width: 40 }}
        backgroundStyle={{ backgroundColor: "white" }}
      >
        <BottomSheetView className="p-6">
          <Text className="text-2xl font-bold text-slate-900 mb-6 text-center">
            {activeTab === "create" ? "New Study Group" : "Join a Group"}
          </Text>

          <View className="gap-y-4">
            {activeTab === "create" ? (
              <>
                <View>
                  <Text className="text-slate-600 mb-2 font-medium">
                    Group Name
                  </Text>
                  <Controller
                    control={control}
                    name="name"
                    rules={{ required: "Name is required" }}
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        className="bg-slate-50 p-4 rounded-2xl border border-slate-200"
                        placeholder="e.g. Advanced Calculus"
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                </View>
                <View>
                  <Text className="text-slate-600 mb-2 font-medium">
                    Description
                  </Text>
                  <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        className="bg-slate-50 p-4 rounded-2xl border border-slate-200"
                        placeholder="What's this group about?"
                        multiline
                        numberOfLines={3}
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                </View>
                <TouchableOpacity
                  onPress={handleSubmit(onCreateGroup)}
                  className="bg-indigo-600 p-4 rounded-2xl items-center mt-4"
                >
                  <Text className="text-white font-bold text-lg">
                    Create Group
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View>
                  <Text className="text-slate-600 mb-2 font-medium">
                    Invite Code
                  </Text>
                  <Controller
                    control={control}
                    name="inviteCode"
                    rules={{ required: "Code is required" }}
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        className="bg-slate-50 p-4 rounded-2xl border border-slate-200 uppercase"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        autoCapitalize="characters"
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                </View>
                <TouchableOpacity
                  onPress={handleSubmit(onJoinGroup)}
                  className="bg-indigo-600 p-4 rounded-2xl items-center mt-4"
                >
                  <Text className="text-white font-bold text-lg">Join Now</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
