import { useRouter } from "expo-router";
import { Lock, Mail, User } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from "react-native";
import { authService } from "../../services/authService";

// REMOVED 'async' from the function definition
export default function Register() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const onRegister = async (data: any) => {
    setLoading(true);
    try {
      const { error } = await authService.register(
        data.email,
        data.password,
        data.fullName,
      );

      if (error) {
        Alert.alert("Registration Error", error);
      } else {
        // The Supabase logic typically lives inside authService.ts
        // But if you are debugging it here, it MUST be inside this async handler.
        Alert.alert("Success", "Account created successfully!", [
          { text: "OK", onPress: () => router.replace("/(tabs)") },
        ]);
      }
    } catch (err) {
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const iconColor = "#8C8C8C";
  const iconColorFocused = isDark ? "#5E63C7" : "#1A1F95";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background-light dark:bg-background-dark"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
          className="p-8"
        >
          {/* Header Section */}
          <View className="items-center mb-10">
            <Text className="text-4xl font-montserrat-bold text-primary-500 text-center mb-3">
              Create Account
            </Text>
            <Text className="font-montserrat text-text-secondaryLight dark:text-text-secondaryDark text-center px-4 leading-5">
              Join StudyBuddy and start collaborating with your peers.
            </Text>
          </View>

          {/* Form Section */}
          <View className="w-full max-w-sm self-center gap-y-5">
            {/* Full Name Input */}
            <View>
              <Controller
                control={control}
                name="fullName"
                rules={{ required: "Full name is required" }}
                render={({ field: { onChange, value } }) => (
                  <View
                    className={`flex-row items-center bg-surface-light dark:bg-surface-dark px-4 py-4 rounded-2xl border-2 ${
                      focusedInput === "fullName"
                        ? "border-primary-500"
                        : "border-transparent"
                    }`}
                  >
                    <User
                      size={20}
                      color={
                        focusedInput === "fullName"
                          ? iconColorFocused
                          : iconColor
                      }
                      strokeWidth={2}
                    />
                    <TextInput
                      className="flex-1 ml-3 text-text-primaryLight dark:text-text-primaryDark font-montserrat text-base"
                      placeholder="Full Name"
                      placeholderTextColor="#8C8C8C"
                      onChangeText={onChange}
                      value={value}
                      onFocus={() => setFocusedInput("fullName")}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>
                )}
              />
              {errors.fullName && (
                <Text className="text-error-DEFAULT text-xs mt-2 ml-2 font-montserrat">
                  {errors.fullName.message?.toString()}
                </Text>
              )}
            </View>

            {/* Email Input */}
            <View>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <View
                    className={`flex-row items-center bg-surface-light dark:bg-surface-dark px-4 py-4 rounded-2xl border-2 ${
                      focusedInput === "email"
                        ? "border-primary-500"
                        : "border-transparent"
                    }`}
                  >
                    <Mail
                      size={20}
                      color={
                        focusedInput === "email" ? iconColorFocused : iconColor
                      }
                      strokeWidth={2}
                    />
                    <TextInput
                      className="flex-1 ml-3 text-text-primaryLight dark:text-text-primaryDark font-montserrat text-base"
                      placeholder="Email Address"
                      placeholderTextColor="#8C8C8C"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onChangeText={onChange}
                      value={value}
                      onFocus={() => setFocusedInput("email")}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>
                )}
              />
              {errors.email && (
                <Text className="text-error-DEFAULT text-xs mt-2 ml-2 font-montserrat">
                  {errors.email.message?.toString()}
                </Text>
              )}
            </View>

            {/* Password Input */}
            <View>
              <Controller
                control={control}
                name="password"
                rules={{
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <View
                    className={`flex-row items-center bg-surface-light dark:bg-surface-dark px-4 py-4 rounded-2xl border-2 ${
                      focusedInput === "password"
                        ? "border-primary-500"
                        : "border-transparent"
                    }`}
                  >
                    <Lock
                      size={20}
                      color={
                        focusedInput === "password"
                          ? iconColorFocused
                          : iconColor
                      }
                      strokeWidth={2}
                    />
                    <TextInput
                      className="flex-1 ml-3 text-text-primaryLight dark:text-text-primaryDark font-montserrat text-base"
                      placeholder="Password"
                      placeholderTextColor="#8C8C8C"
                      secureTextEntry
                      onChangeText={onChange}
                      value={value}
                      onFocus={() => setFocusedInput("password")}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>
                )}
              />
              {errors.password && (
                <Text className="text-error-DEFAULT text-xs mt-2 ml-2 font-montserrat">
                  {errors.password.message?.toString()}
                </Text>
              )}
            </View>

            {/* Register Button */}
            <TouchableOpacity
              onPress={handleSubmit(onRegister)}
              activeOpacity={0.8}
              disabled={loading}
              className={`bg-primary-500 py-4 rounded-2xl items-center shadow-lg shadow-primary-500/30 mt-2 ${
                loading ? "opacity-70" : ""
              }`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-montserrat-bold text-lg">
                  Sign Up
                </Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View className="flex-row justify-center mt-4">
              <Text className="text-text-secondaryLight dark:text-text-secondaryDark font-montserrat">
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                <Text className="text-primary-500 font-montserrat-bold">
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
