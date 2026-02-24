import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Lock, Mail } from "lucide-react-native";
import React, { useEffect, useState } from "react";
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

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
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
      email: "",
      password: "",
    },
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { idToken } = response.authentication || {};
      if (idToken) {
        onGoogleLogin(idToken);
      } else {
        Alert.alert("Error", "No ID Token received from Google.");
      }
    }
  }, [response]);

  const onGoogleLogin = async (idToken: string) => {
    setLoading(true);
    try {
      const { error } = await authService.signInWithGoogle(idToken);
      if (error) {
        Alert.alert("Google Login Error", error);
      } else {
        router.replace("/(tabs)");
      }
    } catch (err) {
      Alert.alert(
        "Error",
        "An unexpected error occurred during Google sign-in.",
      );
    } finally {
      setLoading(false);
    }
  };

  const onLogin = async (data: any) => {
    setLoading(true);
    const { error } = await authService.login(data.email, data.password);
    setLoading(false);
    if (error) {
      Alert.alert("Login Failed", error);
    } else {
      router.replace("/(tabs)");
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
          <View className="items-center mb-12">
            <Text className="text-4xl font-montserrat-bold text-primary-500 text-center mb-3">
              Welcome Back
            </Text>
            <Text className="font-montserrat text-text-secondaryLight dark:text-text-secondaryDark text-center px-4 leading-5">
              Log in to continue your collaborative study sessions.
            </Text>
          </View>

          {/* Form Section */}
          <View className="w-full max-w-sm self-center gap-y-6">
            {/* Email Input */}
            <View>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
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
                      placeholder="Email"
                      placeholderTextColor="#8C8C8C"
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="none"
                      keyboardType="email-address"
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
                rules={{ required: "Password is required" }}
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

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleSubmit(onLogin)}
              activeOpacity={0.8}
              disabled={loading}
              className={`bg-primary-500 py-4 rounded-2xl items-center ${
                loading ? "opacity-70" : ""
              }`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-montserrat-bold text-lg">
                  Login
                </Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-4">
              <View className="flex-1 h-[1px] bg-border-light dark:bg-border-dark" />
              <Text className="mx-4 text-text-mutedLight dark:text-text-mutedDark font-montserrat-bold text-xs">
                OR
              </Text>
              <View className="flex-1 h-[1px] bg-border-light dark:bg-border-dark" />
            </View>

            {/* Google Button */}
            <TouchableOpacity
              onPress={() => promptAsync()}
              activeOpacity={0.7}
              disabled={!request || loading}
              className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark py-4 rounded-2xl flex-row justify-center items-center"
            >
              <Text className="text-text-primaryLight dark:text-text-primaryDark font-montserrat-bold text-base">
                Sign in with Google
              </Text>
            </TouchableOpacity>

            {/* Register Link */}
            <View className="flex-row justify-center mt-4">
              <Text className="text-text-secondaryLight dark:text-text-secondaryDark font-montserrat">
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text className="text-primary-500 dark:text-primary-500 font-montserrat-bold">
                  Register
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
