import { supabase } from "../lib/supabase";

export const taskService = {
  /**
   * Fetch tasks for a specific group
   */
  getGroupTasks: async (groupId: string) => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("group_id", groupId)
      .order("deadline", { ascending: true });

    return { data, error };
  },

  /**
   * Fetch all tasks for all groups the user belongs to.
   * Joins with study_groups to get the group name for SectionList headers.
   */
  getUserTasks: async (userId: string) => {
    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        study_groups:group_id (
          name
        )
      `,
      )
      .order("created_at", { ascending: false });

    return { data, error };
  },

  /**
   * Toggle task completion status
   */
  toggleTaskStatus: async (taskId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("tasks")
      .update({ is_completed: !currentStatus })
      .eq("id", taskId);

    return { error };
  },

  deleteTask: async (taskId: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    return { error };
  },

  /**
   * Create a new task within a specific group
   */
  createTask: async (
    title: string,
    description: string,
    deadline: string | null,
    groupId: string,
    userId: string,
  ) => {
    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          title,
          description,
          deadline,
          group_id: groupId,
          created_by: userId,
        },
      ])
      .select()
      .single();

    return { data, error };
  },
};
