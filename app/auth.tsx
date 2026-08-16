import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function AuthScreen() {
  const { session, loading, profile } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (session) {
        if (profile?.onboarding_completed) {
          router.replace("/(tabs)/lessons");
        } else {
          router.replace("/onboarding");
        }
      } else {
        router.replace("/");
      }
    }
  }, [session, loading, profile]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
