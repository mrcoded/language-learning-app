import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Animated from "react-native-reanimated";

import Entypo from "@expo/vector-icons/Entypo";
import { toast } from "sonner-native";
import { makeRedirectUri } from "expo-auth-session";
import { supabase } from "@/lib/utils/supabase";

const redirectTo = makeRedirectUri({});

export default function EmailAuthView({
  onBack,
  menuContentAnimatedStyle,
}: {
  onBack: () => void;
  menuContentAnimatedStyle: {
    opacity: number;
  };
}) {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const signInWithEmail = async () => {
    if (!email) {
      toast.error("Please enter an email address.");
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        toast.error(error.message);
        throw error;
      } else {
        toast.success("Magic link sent to your email.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View style={[styles.viewContainer, menuContentAnimatedStyle]}>
      <View style={styles.emailHeader}>
        <Pressable onPress={onBack}>
          <Entypo name="chevron-thin-left" size={18} color="white" />
        </Pressable>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.emailMainTitle}>Enter your email address.</Text>
        <Text style={styles.emailSubTitle}>
          We will send you a magic link to sign in.
        </Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.emailTextInput}
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            placeholderTextColor="rgba(255,255,255,0.4)"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <Pressable
          disabled={loading}
          onPress={signInWithEmail}
          style={[styles.verificationButton, loading && styles.buttonDisabled]}
        >
          <Text style={styles.verificationButtonText}>
            {loading ? "Sending..." : "Send magic link"}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
  },
  emailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 20,
  },
  placeholder: {
    width: 40,
  },
  titleContainer: {
    marginBottom: 20,
  },
  emailMainTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 0,
    lineHeight: 34,
  },
  emailSubTitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.7)",
  },
  formContainer: {
    gap: 20,
  },
  inputContainer: {
    gap: 0,
  },
  emailTextInput: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 0,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    color: "white",
    minHeight: 52,
  },
  verificationButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 0,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    marginTop: 10,
  },
  verificationButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: -0.2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
