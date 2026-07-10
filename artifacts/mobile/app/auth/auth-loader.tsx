import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import SessionService from "./services/SessionService";

export default function AuthLoader() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const session = await SessionService.getSession();
      if (session) {
        // route based on role
        if (session.role === "Admin") router.replace("/");
        else if (session.role === "Teacher") router.replace("/teacher-dashboard");
        else router.replace("/parent-dashboard");
      } else {
        router.replace("/auth/login");
      }
      setChecking(false);
    })();
  }, []);

  if (!checking) return null;
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
