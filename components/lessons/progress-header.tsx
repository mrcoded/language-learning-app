import { Colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, useColorScheme, View } from "react-native";
import { ThemedText } from "../themed-text";

export default function ProgressHeader({
  progress,
  currentCount,
  totalCount,
  onClose,
}: {
  progress: number;
  currentCount: number;
  totalCount: number;
  onClose: () => void;
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.borderColor,
        },
      ]}
    >
      <Pressable hitSlop={20} style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={20} color={colors.text} />
      </Pressable>
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            { backgroundColor: colors.borderColor },
          ]}
        >
          <View style={[styles.progressFill, { width: `${progress}%` }]}></View>
        </View>
        <ThemedText
          style={[styles.progressText, { color: colors.subduedText }]}
        >
          {currentCount}/{totalCount}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    marginRight: 16,
    padding: 4,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: Colors.primaryAccentColor,
  },
  progressText: {
    fontSize: 15,
    fontWeight: "600",
    minWidth: 45,
  },
});
