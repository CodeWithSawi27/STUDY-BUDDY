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
   * Create a task (Option B: used within a group view)
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

  /**
   * Toggle completion
   */
  toggleTaskStatus: async (taskId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("tasks")
      .update({ is_completed: !currentStatus })
      .eq("id", taskId);

    return { error };
  },
};
