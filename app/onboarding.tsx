import { router } from "expo-router";
import React, { useState } from "react";

import Interests from "@/components/onboarding/interests";
import LanguageLevel from "@/components/onboarding/language-level";
import Motivation from "@/components/onboarding/motivation";
import PersonalInfo from "@/components/onboarding/personal-info";
import Paywall from "@/components/subscription/paywall";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

export default function OnboardingScreen() {
  const colors = Colors["light"];

  const { refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [showPaywall, setShowPaywall] = useState(false);
  const [localLanguage, setLocalLanguage] = useState("");
  const [level, setLevel] = useState<string | null>(null);
  const [motivations, setMotivations] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Handle back navigation
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const isNextEnabled = () => {
    if (step === 0) return name.trim() !== "" && localLanguage.trim() !== "";
    if (step === 1) return !!level;
    if (step === 2) return motivations.length > 0;
    if (step === 3) return selectedInterests.length > 0;
    return false;
  };

  const saveProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No user found");

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: name,
        language_choice: localLanguage,
        language_level: level,
        motivations: motivations,
        interests: selectedInterests,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      await refreshProfile();

      setShowPaywall(true);
    } catch (error) {
      console.error("Error saving profile", error);
      toast.error("Failed to save your profile");
    }
  };

  const handleContinue = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      //save profile
      saveProfile();
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          {step > 0 && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          )}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${((step + 1) / 4) * 100}%`,
                  backgroundColor: Colors.primaryAccentColor,
                },
              ]}
            />
          </View>
        </View>
        <View style={styles.mainContent}>
          <Animated.View
            key={step}
            entering={FadeIn.duration(500)}
            exiting={FadeOut.duration(500)}
            style={{ flex: 1 }}
          >
            {step === 0 && (
              <PersonalInfo
                name={name}
                setName={setName}
                localLanguage={localLanguage}
                setLocalLanguage={setLocalLanguage}
              />
            )}

            {step === 1 && (
              <LanguageLevel
                level={level}
                setLevel={setLevel}
                localLanguage={localLanguage}
              />
            )}

            {step === 2 && (
              <Motivation
                motivations={motivations}
                setMotivations={setMotivations}
                localLanguage={localLanguage}
              />
            )}

            {step === 3 && (
              <Interests
                interests={selectedInterests}
                setInterests={setSelectedInterests}
              />
            )}
          </Animated.View>
        </View>

        <View style={[styles.footer, { zIndex: 10 }]}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              {
                backgroundColor: isNextEnabled()
                  ? Colors.primaryAccentColor
                  : "#E5E7EB",
              },
            ]}
            disabled={!isNextEnabled}
            onPress={handleContinue}
          >
            <ThemedText style={styles.continueButtonText}>
              {step === 3 ? "Get Started" : "Continue"}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Paywall visible={showPaywall} onClose={() => setShowPaywall(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 60,
  },
  backButton: {
    marginRight: 16,
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  mainContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  stepContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    color: Colors.light.text,
  },
  subTitle: {
    fontSize: 16,
    color: Colors.subduedTextColor,
    marginBottom: 32,
  },

  footer: {
    fontSize: 24,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 0,
    width: "100%",
    shadowRadius: 5,
    shadowOpacity: 0.2,
  },
  continueButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
