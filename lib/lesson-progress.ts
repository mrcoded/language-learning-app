import AsyncStorage from "@react-native-async-storage/async-storage";

const STATS_KEY = "lesson_progress";

export type LessonProgressProps = {
  [lessonId: string]: number;
};

const readProgress = async (): Promise<LessonProgressProps> => {
  try {
    const raw = await AsyncStorage.getItem(STATS_KEY);
    if (!raw) {
      return {};
    }

    return JSON.parse(raw) as LessonProgressProps;
  } catch (error) {
    console.error("Error fetching speaking/listening stats:", error);
    return {};
  }
};

const writeProgress = async (data: LessonProgressProps) => {
  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(data));
};

export const incrementLessonCompleted = async (lessonId: string) => {
  const progress = await readProgress();
  progress[lessonId] = (progress[lessonId] || 0) + 1;

  await writeProgress(progress);
};

export const getAllProgress = async (): Promise<LessonProgressProps> => {
  return await readProgress();
};
