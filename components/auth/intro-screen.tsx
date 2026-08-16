import React, { useEffect, useState } from "react";

import {
  EBGaramond_500Medium_Italic,
  useFonts,
} from "@expo-google-fonts/eb-garamond";
import { useVideoPlayer, VideoView } from "expo-video";

import {
  Dimensions,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { verticalScale } from "react-native-size-matters";

import { Colors } from "@/constants/theme";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import EmailAuthView from "./email-auth";
import LoginView from "./login-view";

const { width, height } = Dimensions.get("window");

const MENU_HEIGHT = 250;
const PEEK_MENU_HEIGHT = 50;
const CLOSED_POSITION = MENU_HEIGHT - PEEK_MENU_HEIGHT;

export default function IntroScreen() {
  const insets = useSafeAreaInsets();
  const mainTextOpacity = useSharedValue(0);
  const scriptTextOpacity = useSharedValue(0);
  const menuContentOpacity = useSharedValue(1);
  const isMenuOpenShared = useSharedValue(0);
  const menuTranslateY = useSharedValue(CLOSED_POSITION);
  // const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentView, setCurrentView] = useState<"login" | "email">("login");

  const [loadedFonts] = useFonts({
    EBGaramond_500Medium_Italic,
  });

  // Video source path
  const videoSource = require("@/assets/videos/broll.mp4");

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.play();
  });

  const mainTextWords: string[] = ["Learn", "Mandarin", "the", "right", "way"];
  const scriptPhrases: string[] = [
    "Speaking",
    "Listening",
    "Practising",
    "Conversing",
  ];

  // Main Text Animation
  const mainTextAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      mainTextOpacity.value,
      [0, 1],
      [30, 0],
      Extrapolation.CLAMP,
    );

    return {
      opacity: mainTextOpacity.value,
      transform: [{ translateY }],
    };
  });

  // Script Text Animation
  const scriptTextAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scriptTextOpacity.value,
      [0, 1],
      [20, 0],
      Extrapolation.CLAMP,
    );

    return {
      opacity: scriptTextOpacity.value,
      transform: [{ translateY }],
    };
  });

  const menuAnimatedStyle = useAnimatedStyle(() => {
    const currentValue = menuTranslateY.value;
    return {
      transform: [{ translateY: currentValue }],
    };
  });

  const menuContentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: menuContentOpacity.value,
    };
  });

  // Pan Gesture - for swiping
  const panGesture = Gesture.Pan().onEnd((event) => {
    "worklet";
    const swipeThreshold = 50;
    const isUpSwipe = event.translationY < -swipeThreshold;
    const isDownSwipe = event.translationY > swipeThreshold;

    if (isUpSwipe && !isMenuOpenShared.value) {
      menuTranslateY.value = withSpring(0, {
        damping: 30,
        stiffness: 200,
        mass: 1,
      });
      isMenuOpenShared.value = 1;
    } else if (isDownSwipe && isMenuOpenShared.value) {
      menuTranslateY.value = withSpring(CLOSED_POSITION, {
        damping: 30,
        stiffness: 200,
        mass: 1,
      });
      isMenuOpenShared.value = 0;
    }
  });

  const tapGesture = Gesture.Tap().onEnd(() => {
    "worklet";
    if (isMenuOpenShared.value) {
      // Close menu
      menuTranslateY.value = withSpring(CLOSED_POSITION, {
        damping: 30,
        stiffness: 200,
        mass: 1,
      });
      isMenuOpenShared.value = 0;
    } else {
      // Open menu
      menuTranslateY.value = withSpring(0, {
        damping: 30,
        stiffness: 200,
        mass: 1,
      });
      isMenuOpenShared.value = 1;
    }
  });

  const menuGesture = panGesture;

  const animateToEmailView = (to: "login" | "email") => {
    menuContentOpacity.value = withTiming(0, { duration: 200 });

    setTimeout(() => {
      setCurrentView(to);
      menuContentOpacity.value = withTiming(1, { duration: 300 });
    }, 200);
  };

  const animateTextIn = () => {
    mainTextOpacity.value = withTiming(1, { duration: 1200 });
    scriptTextOpacity.value = withDelay(800, withTiming(1, { duration: 800 }));
  };

  const animateScriptOut = () => {
    scriptTextOpacity.value = withTiming(0, { duration: 500 });
  };

  const animateScriptIn = () => {
    scriptTextOpacity.value = withTiming(1, { duration: 600 });
  };

  useEffect(() => {
    player.play();

    const timeout = setTimeout(() => {
      animateTextIn();
    }, 300);

    const cycleInterval = setInterval(() => {
      animateScriptOut();
      setTimeout(() => {
        setCurrentPhraseIndex((prev) => {
          const nextIndex = (prev + 1) % scriptPhrases.length;

          if (nextIndex === 0) {
            setTimeout(() => animateScriptIn(), 150);
          }
          return nextIndex;
        });
      });
    }, 3500);

    return () => {
      clearTimeout(timeout);
      clearInterval(cycleInterval);
    };
  }, []);

  useEffect(() => {
    if (currentPhraseIndex > 0) {
      const timeout = setTimeout(() => animateScriptIn(), 150);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [currentPhraseIndex]);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      },
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      (e) => {
        setKeyboardHeight(0);
      },
    );

    return () => {
      keyboardWillShowListener?.remove();
      keyboardWillHideListener?.remove();
    };
  }, []);

  if (!loadedFonts) return null;

  const dynamicMenuHeight =
    keyboardHeight > 0 ? MENU_HEIGHT + keyboardHeight + 50 : MENU_HEIGHT + 100;

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <VideoView
        style={[
          StyleSheet.absoluteFill,
          {
            width: width,
            height: height,
            pointerEvents: "none",
          },
        ]}
        contentFit="cover"
        nativeControls={false}
        player={player}
      // fullscreenOptions={{ enable: true }}
      // allowsPictureInPicture
      />

      {/* Overlay */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 20,
            pointerEvents: "none",
          },
        ]}
      />

      {/* Hero Section */}
      <View style={styles.heroTextContainer}>
        <Animated.View
          style={[styles.mainTextContainer, mainTextAnimatedStyle]}
        >
          <Text style={styles.heroTextMain}>{mainTextWords.join(" ")}</Text>
        </Animated.View>
        <Animated.View style={scriptTextAnimatedStyle}>
          <Text style={styles.heroTextScript}>
            {scriptPhrases[currentPhraseIndex]}
          </Text>
        </Animated.View>
      </View>

      {/* Sliding menu with dynamic height */}
      <GestureDetector gesture={menuGesture}>
        <Animated.View
          style={[
            styles.menuContainer,
            menuAnimatedStyle,
            {
              height: dynamicMenuHeight,
              paddingBottom: insets.bottom + 30,
            },
          ]}
        >
          <GestureDetector gesture={tapGesture}>
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>
          </GestureDetector>

          <View style={styles.menuContent}>
            {currentView === "login" ? (
              <LoginView
                animateToEmailView={animateToEmailView}
                menuContentAnimatedStyle={menuContentAnimatedStyle}
              />
            ) : (
              <EmailAuthView
                onBack={() => animateToEmailView("login")}
                menuContentAnimatedStyle={menuContentAnimatedStyle}
              />
            )}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: MENU_HEIGHT + 100,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.15)",
    zIndex: 30,
  },
  handleContainer: {
    paddingVertical: 12,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 2,
  },
  menuContent: {
    flex: 1,
    paddingHorizontal: 30,
  },

  heroTextContainer: {
    position: "absolute",
    top: height * 0.13,
    left: 30,
    right: 30,
    zIndex: 25,
  },
  mainTextContainer: {
    marginBottom: 0,
  },
  heroTextMain: {
    fontSize: verticalScale(45),
    fontWeight: "500",
    fontFamily: "System",
    color: "#fff4cc",
    lineHeight: verticalScale(50),
    letterSpacing: 0,
  },
  heroTextScript: {
    fontSize: verticalScale(55),
    fontFamily: "Edwardian Script ITC",
    color: Colors.primaryAccentColor,
    letterSpacing: 0,
  },
});
