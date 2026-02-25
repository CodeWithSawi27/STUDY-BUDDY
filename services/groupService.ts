import { supabase } from "../lib/supabase";

export const groupService = {
  /**
   * Fetch a user's profile details (Name, Avatar, etc.)
   */
  getUserProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("full_name, avatar_url, email")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  /**
   * Create a new group and automatically add the creator as an 'admin' member
   */
  createGroup: async (name: string, description: string, userId: string) => {
    try {
      const { data: group, error: groupError } = await supabase
        .from("study_groups")
        .insert([{ name, description, created_by: userId }])
        .select()
        .single();

      if (groupError) throw groupError;

      const { error: memberError } = await supabase
        .from("group_members")
        .insert([{ group_id: group.id, user_id: userId, role: "admin" }]);

      if (memberError) throw memberError;

      return { group, error: null };
    } catch (error: any) {
      return { group: null, error: error.message };
    }
  },

  /**
   * Join a group using a 6-character invite code
   */
  joinGroupByCode: async (inviteCode: string, userId: string) => {
    try {
      // 1. Find the group
      const { data: group, error: fetchError } = await supabase
        .from("study_groups")
        .select("id")
        .eq("invite_code", inviteCode.toUpperCase())
        .single();

      if (fetchError || !group) throw new Error("Group code not found.");

      // 2. Add member
      const { error: joinError } = await supabase
        .from("group_members")
        .insert([{ group_id: group.id, user_id: userId, role: "member" }]);

      if (joinError) {
        if (joinError.code === "23505")
          throw new Error("You are already in this group.");
        throw joinError;
      }

      return { group, error: null };
    } catch (error: any) {
      return { group: null, error: error.message };
    }
  },

  /**
   * Fetch groups for a user with the nested study_group data
   */
  getUserGroups: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("group_members")
        .select(
          `
          group_id,
          study_groups (
            id,
            name,
            description,
            invite_code,
            created_at
          )
        `,
        )
        .eq("user_id", userId)
        .order("created_at", {
          foreignTable: "study_groups",
          ascending: false,
        });

      return { data, error };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  /**
   * Optional: Fetch recent activity for the dashboard overview
   * This would pull things like recent messages or tasks across all user groups
   */
  getRecentActivity: async (userId: string) => {
    // This is a placeholder for your future activity feed logic
    // Likely joining tasks and messages across all group_ids the user belongs to
    return { data: [], error: null };
  },
};
