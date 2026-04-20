import React from "react";
import { Colors } from "@/constants/theme";
import { INTEREST_OPTIONS } from "@/constants/interests";
import { ThemedText } from "../themed-text";
import { View, StyleSheet, TouchableOpacity } from "react-native";

export default function Interests({
  interests,
  setInterests,
}: {
  interests: string[];
  setInterests: (interests: string[]) => void;
}) {
  const toggleInterest = (id: string) => {
    if (interests.includes(id)) {
      setInterests(interests.filter((interest) => interest !== id));
    } else {
      setInterests([...interests, id]);
    }
  };

  return (
    <View style={styles.stepContainer}>
      <ThemedText type="title" style={styles.title}>
        What are your interests?{"\n"}
      </ThemedText>
      <ThemedText type="title" style={styles.subTitle}>
        Select all that applies. This will help us personalize your learning
        experience.
      </ThemedText>

      <View style={styles.tagContainer}>
        {INTEREST_OPTIONS.map((interest) => {
          const isSelected = interests.includes(interest);

          return (
            <TouchableOpacity
              key={interest}
              onPress={() => toggleInterest(interest)}
              style={[
                styles.tag,
                isSelected && {
                  borderColor: Colors.primaryAccentColor,
                  backgroundColor: Colors.primaryAccentColor,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.tagText,
                  isSelected && {
                    color: "#FFF",
                  },
                ]}
              >
                {interest}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
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
  subTitle: {
    fontSize: 16,
    color: Colors.subduedTextColor,
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
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 20,
  },
  tag: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tagText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
