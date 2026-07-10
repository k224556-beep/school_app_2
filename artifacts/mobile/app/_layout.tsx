import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { ErrorBoundary } from "@/components/ErrorBoundary";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const colors = useColors();
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="auth/auth-loader" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="student/[id]"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="teachers"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="admissions"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="reports"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="whatsapp"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="fee-recovery"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="attendance"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="exams"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="parent-comms"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="calendar"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="ai-tools"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="hr-payroll"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="fee-vouchers"
        options={{ headerShown: false, presentation: "card" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
