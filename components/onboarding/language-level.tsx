import React from "react";
import { LEVELS } from "@/constants/levels";
import { Colors } from "@/constants/theme";
import { ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from "react-native";
import { ThemedText } from "../themed-text";

export default function LanguageLevel({
  level,
  setLevel,
}: {
  setLevel: (level: string) => void;
  level: string | null;
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  return (
    <View style={styles.stepContainer}>
      <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
        How much mandarin do you know?
      </ThemedText>

      <ScrollView
        style={{ marginTop: 20 }}
        contentContainerStyle={{ rowGap: 14 }}
      >
        {LEVELS.map((option) => (
          <TouchableOpacity
            key={option.id}
            onPress={() => setLevel(option.id)}
            style={[
              styles.optionCard,
              {
                backgroundColor: level === option.id
                  ? (colorScheme === "dark" ? "#3A2412" : "#FFF5F0")
                  : colors.cardBackground,
                borderColor: level === option.id
                  ? Colors.primaryAccentColor
                  : colors.borderColor,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.optionsTitle,
                level === option.id
                  ? {
                      color: Colors.primaryAccentColor,
                    }
                  : { color: colors.text },
              ]}
            >
              {option.title}
            </ThemedText>
            <ThemedText style={[styles.optionsDescription, { color: colors.subduedText }]}>
              {option.description}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  optionsDescription: {
    fontSize: 14,
  },
  optionCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
  },
});
