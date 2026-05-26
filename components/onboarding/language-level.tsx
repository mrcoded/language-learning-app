import React from "react";
import { LEVELS } from "@/constants/levels";
import { Colors } from "@/constants/theme";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../themed-text";

export default function LanguageLevel({
  level,
  setLevel,
}: {
  setLevel: (level: string) => void;
  level: string | null;
}) {
  return (
    <View style={styles.stepContainer}>
      <ThemedText type="title" style={styles.title}>
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
              level === option.id && {
                borderColor: Colors.primaryAccentColor,
                backgroundColor: "#FFF5F0",
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
                  : { color: Colors.subduedTextColor },
              ]}
            >
              {option.title}
            </ThemedText>
            <ThemedText style={styles.optionsDescription}>
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
    color: Colors.light.text,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  optionsDescription: {
    fontSize: 14,
    color: Colors.subduedTextColor,
  },
  optionCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
});
