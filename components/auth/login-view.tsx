import React from "react";
import { Image } from "expo-image";
import AntDesign from "@expo/vector-icons/AntDesign";
import Fontisto from "@expo/vector-icons/Fontisto";

import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";

export default function LoginView({
  setCurrentView,
  animateToEmailView,
  menuContentAnimatedStyle,
}: {
  setCurrentView: (view: "login" | "email") => void;
  animateToEmailView: (view: "login" | "email") => void;
  menuContentAnimatedStyle: {
    opacity: number;
  };
}) {
  // logo source path
  const logoSource = require("@/assets/images/icon.png");

  return (
    <Animated.View style={[styles.viewContainer, menuContentAnimatedStyle]}>
      <View style={styles.logoSection}>
        <View style={styles.logoContainer}>
          <Image source={logoSource} style={styles.logo} />
          <Text style={styles.appName}>SuperLang</Text>
        </View>
        <View style={styles.statsContainer}>
          <Text style={styles.rating}>Start today</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable style={styles.loginButton} onPress={() => {}}>
          <AntDesign
            size={16}
            color="white"
            name="apple"
            style={styles.appleIcon}
          />
          <Text style={styles.buttonText}>Continue with Apple</Text>
        </Pressable>
        <Pressable style={styles.loginButton} onPress={() => {}}>
          <AntDesign
            size={16}
            color="white"
            name="google"
            style={styles.googleIcon}
          />
          <Text style={styles.buttonText}>Continue with Google</Text>
        </Pressable>
        <Pressable
          style={styles.loginButton}
          onPress={() => animateToEmailView("email")}
        >
          <Fontisto
            size={16}
            color="white"
            name="email"
            style={styles.emailIcon}
          />
          <Text style={styles.buttonText}>Continue with Email</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
  },
  buttonContainer: {
    gap: 16,
  },
  loginButton: {
    backgroundColor: "rgba(60, 60, 67, 0.8)",
    borderColor: "rgba(120, 120, 120, 0.4)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logo: {
    width: 25,
    height: 25,
    marginRight: 5,
    borderRadius: 12,
  },
  appName: {
    fontSize: 10,
    fontWeight: "700",
    color: "white",
  },
  statsContainer: {
    alignItems: "center",
  },
  rating: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  appleIcon: {
    marginRight: 12,
  },
  googleIcon: {
    marginRight: 12,
  },
  emailIcon: {
    marginRight: 12,
  },
  buttonText: {
    fontWeight: "500",
    fontSize: 17,
    color: "white",
    letterSpacing: -0.2,
  },
});
