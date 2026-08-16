import LessonContent from "@/components/lessons/lesson-content";
import VocabularyIntroScreen from "@/components/lessons/vocabulary-intro-screen";
import { Colors } from "@/constants/theme";
import { COURSE_DATA } from "@/types/course-data";
import { Redirect, useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PracticeScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const [isStudyingVocabulary, setIsStudyingVocabulary] = React.useState(true);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const allLessons = COURSE_DATA.chapters.flatMap((chapter) =>
    chapter.review ? [chapter.review, ...chapter.lessons] : chapter.lessons,
  );

  const currentLesson = allLessons.find((l) => l.id === lessonId);

  const questions = currentLesson ? currentLesson.questions : [];

  if (questions.length === 0) {
    return <Redirect href="/(tabs)/lessons" />;
  }

  if (isStudyingVocabulary) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <VocabularyIntroScreen
          key={lessonId}
          questions={questions}
          onStartLesson={() => setIsStudyingVocabulary(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LessonContent lessonId={lessonId} questions={questions} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
