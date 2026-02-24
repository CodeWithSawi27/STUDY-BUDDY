import { supabase } from "../lib/supabase";

export const groupService = {
  /**
   * Create a new group and automatically add the creator as an 'admin' member
   */
  createGroup: async (name: string, description: string, userId: string) => {
    try {
      // 1. Insert the group
      const { data: group, error: groupError } = await supabase
        .from("study_groups")
        .insert([{ name, description, created_by: userId }])
        .select()
        .single();

      if (groupError) throw groupError;

      // 2. Add creator to group_members table as 'admin'
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
   * Fetch all groups that the current user is a member of
   */
  getUserGroups: async (userId: string) => {
    const { data, error } = await supabase
      .from("group_members")
      .select(
        `
        group_id,
        study_groups (
          id,
          name,
          description,
          created_at
        )
      `,
      )
      .eq("user_id", userId);

    return { data, error };
  },
};
