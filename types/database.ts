// types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string; // Linked to Firebase UID [cite: 43]
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      study_groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          name: string;
          description?: string | null;
          created_by: string;
        };
      };
      group_members: {
        Row: {
          group_id: string;
          user_id: string;
          role: "admin" | "member"; // Supporting future permissions [cite: 73]
          joined_at: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          group_id: string;
          title: string;
          description: string | null;
          deadline: string | null; // For notification scheduling [cite: 66, 67]
          is_completed: boolean;
          created_by: string;
          created_at: string;
        };
        Insert: {
          group_id: string;
          title: string;
          description?: string | null;
          deadline?: string | null;
          is_completed?: boolean;
          created_by: string;
        };
      };
    };
  };
}
