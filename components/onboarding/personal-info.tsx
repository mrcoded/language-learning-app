import React from "react";
import { StyleSheet, TextInput, useColorScheme, View } from "react-native";
import { ThemedText } from "../themed-text";
import { Colors } from "@/constants/theme";

export default function PersonalInfo({
  name,
  setName,
}: {
  name: string;
  setName: (name: string) => void;
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  return (
    <View style={styles.stepContainer}>
      <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
        What should we call you?
      </ThemedText>
      <ThemedText style={[styles.subTitle, { color: colors.subduedText }]}>
        Your name will be used to personalize your lessons
      </ThemedText>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.borderColor }]}
        placeholder="Enter your name"
        placeholderTextColor={colors.subduedText}
        value={name}
        onChangeText={setName}
        autoFocus
      />
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
});
