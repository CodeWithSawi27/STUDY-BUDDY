import {
  createUserWithEmailAndPassword,
  deleteUser,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { supabase } from "../lib/supabase";

// Define a standard response type for your service
interface AuthResponse {
  user: User | null;
  error: string | null;
}

export const authService = {
  /**
   * Register a new user in Firebase and create a profile in Supabase
   */
  register: async (
    email: string,
    pass: string,
    fullName: string,
  ): Promise<AuthResponse> => {
    let user: User | null = null;
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        pass,
      );
      user = userCredential.user;

      // Update the Firebase profile first
      await updateProfile(user, { displayName: fullName });

      // Sync to Supabase using upsert to prevent primary key conflicts
      const { error: supabaseError } = await supabase.from("users").upsert({
        id: user.uid,
        email: email,
        full_name: fullName,
        created_at: new Date().toISOString(),
      });

      if (supabaseError) {
        // CRITICAL: If DB sync fails, we should ideally remove the Firebase user
        // to keep the systems in sync and allow them to try again.
        await deleteUser(user);
        throw new Error(`Database Sync Error: ${supabaseError.message}`);
      }

      return { user, error: null };
    } catch (error: any) {
      console.error("Registration Error:", error.message);
      return { user: null, error: error.message };
    }
  },

  /**
   * Log in an existing user
   */
  login: async (email: string, pass: string): Promise<AuthResponse> => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        pass,
      );
      return { user: userCredential.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  },

  /**
   * Google Sign In with automatic Supabase Sync
   */
  signInWithGoogle: async (idToken: string): Promise<AuthResponse> => {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      // Sync/Update Supabase record
      const { error: supabaseError } = await supabase.from("users").upsert({
        id: user.uid,
        email: user.email ?? "",
        full_name: user.displayName ?? "User",
        avatar_url: user.photoURL ?? null, // Use null for DB if empty
        updated_at: new Date().toISOString(),
      });

      if (supabaseError) {
        console.error("Supabase Google Sync Error:", supabaseError.message);
        // We don't delete the user here because they might already have data
      }

      return { user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  },

  /**
   * Log out
   */
  logout: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  },
};
