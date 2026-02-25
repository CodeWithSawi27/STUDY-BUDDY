import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Search } from "lucide-react-native";
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

// Custom UI Components
import { GroupListItem } from "../../components/ui/GroupListItem";
import { Header } from "../../components/ui/Header";
import { OverviewCard } from "../../components/ui/OverviewCard";

// Services & Firebase
import { auth } from "../../lib/firebase";
import { groupService } from "../../services/groupService";

export default function Dashboard() {
  const router = useRouter();

  // State Management
  const [groups, setGroups] = useState<any[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<any[]>([]);
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");

  // Bottom Sheet Configuration
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

  // Fetch Data on Mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Filter groups when search query changes
  useEffect(() => {
    const filtered = groups.filter((g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredGroups(filtered);
  }, [searchQuery, groups]);

  const loadDashboardData = async () => {
    setLoading(true);
    await Promise.all([fetchProfile(), fetchGroups()]);
    setLoading(false);
  };

  const fetchProfile = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      try {
        // Calling your getUserProfile from groupService (ensure this method exists)
        const { data, error } = await groupService.getUserProfile(userId);
        if (data) setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setProfileLoading(false);
      }
    }
  };

  const fetchGroups = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const { data, error } = await groupService.getUserGroups(userId);
      if (!error && data) {
        setGroups(data.map((item: any) => item.study_groups));
      }
    }
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
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

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-[#f8fafc] dark:bg-slate-950">
        <ActivityIndicator size="large" color="#0f172a" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f8fafc] dark:bg-slate-950 px-5">
      {/* 1. Header Component with DB Name */}
      <Header userName={profile?.full_name} loading={profileLoading} />

      {/* 2. Overview Card */}
      <OverviewCard
        groupCount={groups.length}
        onCreatePress={() => handleOpenModal("create")}
      />

      {/* 3. List Header & Search Bar */}
      <View className="flex-row justify-between items-end mb-4">
        <Text className="text-xl font-extrabold text-slate-900 dark:text-white">
          Your groups
        </Text>
        <TouchableOpacity onPress={() => handleOpenModal("join")}>
          <Text className="text-slate-900 dark:text-white font-bold text-sm">
            + Join group
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center bg-white dark:bg-slate-900 mb-6 px-4 py-3 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
        <Search size={18} color="#94a3b8" />
        <TextInput
          placeholder="Search groups..."
          className="flex-1 ml-3 text-slate-900 dark:text-white font-medium"
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* 4. The Group List (Vertical Transaction Style) */}
      <FlatList
        data={filteredGroups}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="items-center mt-10 opacity-50">
            <Text className="text-slate-500 mt-4 text-base font-medium">
              No groups found.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <GroupListItem
            name={item.name}
            inviteCode={item.invite_code}
            onPress={() => {
              router.push({
                pathname: "/group/[id]",
                params: { id: item.id, name: item.name },
              });
            }}
          />
        )}
      />

      {/* 5. Create/Join Bottom Sheet */}
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
          <Text className="text-2xl font-extrabold text-slate-900 mb-6 text-center">
            {activeTab === "create" ? "New Study Group" : "Join a Group"}
          </Text>

          <View className="gap-y-4">
            {activeTab === "create" ? (
              <>
                <View>
                  <Text className="text-slate-600 mb-2 font-bold text-sm">
                    Group Name
                  </Text>
                  <Controller
                    control={control}
                    name="name"
                    rules={{ required: "Name is required" }}
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        className="bg-slate-50 p-4 rounded-2xl border border-slate-200 font-medium"
                        placeholder="e.g. Advanced Calculus"
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                </View>
                <View>
                  <Text className="text-slate-600 mb-2 font-bold text-sm">
                    Description
                  </Text>
                  <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        className="bg-slate-50 p-4 rounded-2xl border border-slate-200 font-medium"
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
                  className="bg-slate-900 p-4 rounded-full items-center mt-4"
                >
                  <Text className="text-white font-bold text-lg">
                    Create Group
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View>
                  <Text className="text-slate-600 mb-2 font-bold text-sm">
                    Invite Code
                  </Text>
                  <Controller
                    control={control}
                    name="inviteCode"
                    rules={{ required: "Code is required" }}
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        className="bg-slate-50 p-4 rounded-2xl border border-slate-200 uppercase font-medium text-center text-lg tracking-[0.2em]"
                        placeholder="6-DIGIT CODE"
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
                  className="bg-slate-900 p-4 rounded-full items-center mt-4"
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
