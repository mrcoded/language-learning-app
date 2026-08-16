import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export default function AudioWavForm({ isPlaying }: { isPlaying: boolean }) {
  const waveAnimations = useRef(
    Array.from({ length: 20 }, () => new Animated.Value(0.3)),
  ).current;

  useEffect(() => {
    if (isPlaying) {
      const animations = waveAnimations.map((animation) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(animation, {
              toValue: Math.random() * 0.5 + 0.5,
              duration: 150 + Math.random() * 200,
              useNativeDriver: true,
            }),
            Animated.timing(animation, {
              toValue: 0.3,
              duration: 150 + Math.random() * 200,
              useNativeDriver: true,
            }),
          ]),
        );
      });
      Animated.parallel(animations).start();
    } else {
      waveAnimations.map((animation) => {
        animation.stopAnimation();
        Animated.timing(animation, {
          toValue: 0.3,
          duration: 150 + Math.random() * 200,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [isPlaying]);

  return (
    <View style={styles.waveformContainer}>
      <View style={styles.audioWaveContainer}>
        {waveAnimations.map((waveAnimation, index) => {
          return (
            <Animated.View
              key={index}
              style={[
                styles.waveBar,
                {
                  transform: [{ scaleY: waveAnimation }],
                  height: 16 + (index % 4) * 6,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  waveformContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    minHeight: 50,
  },
  audioWaveContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: 20,
  },
  waveBar: {
    width: 3,
    backgroundColor: "#ff6640",
    borderRadius: 1.5,
    opacity: 0.8,
    minHeight: 8,
  },
});
