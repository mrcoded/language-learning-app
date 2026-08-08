import React from "react";
import { Colors } from "@/constants/theme";
import { MOTIVATION_OPTIONS } from "@/constants/motivation";
import { ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from "react-native";
import { ThemedText } from "../themed-text";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Motivation({
  motivations,
  setMotivations,
}: {
  motivations: string[];
  setMotivations: (motivations: string[]) => void;
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const toggleMotivation = (id: string) => {
    if (motivations.includes(id)) {
      setMotivations(motivations.filter((motivation) => motivation !== id));
    } else {
      setMotivations([...motivations, id]);
    }
  };

  return (
    <View style={styles.stepContainer}>
      <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
        Why are you learning mandarin?
      </ThemedText>
      <ThemedText style={[styles.subTitle, { color: colors.subduedText }]}>
        Select all that applies. This will help us personalize your learning
        experience.
      </ThemedText>

      <ScrollView
        style={{ marginTop: 20 }}
        contentContainerStyle={{ rowGap: 14 }}
      >
        {MOTIVATION_OPTIONS.map((option) => {
          const isSelected = motivations.includes(option.id);

          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => toggleMotivation(option.id)}
              style={[
                styles.optionCard,
                styles.motivationCard,
                {
                  backgroundColor: isSelected
                    ? (colorScheme === "dark" ? "#3A2412" : "#FFF5F0")
                    : colors.cardBackground,
                  borderColor: isSelected
                    ? Colors.primaryAccentColor
                    : colors.borderColor,
                },
              ]}
            >
              <Ionicons
                name={option.icon as any}
                size={24}
                color={isSelected ? Colors.primaryAccentColor : colors.icon}
              />
              <ThemedText
                style={[
                  styles.optionsTitle,
                  isSelected
                    ? {
                        color: Colors.primaryAccentColor,
                      }
                    : {
                        color: colors.text,
                      },
                ]}
              >
                {option.title}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
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
  subTitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  input: {
    fontSize: 20,
    borderBottomWidth: 2,
    paddingVertical: 12,
    marginTop: 20,
  },
  motivationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
});
