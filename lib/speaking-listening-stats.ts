import AsyncStorage from "@react-native-async-storage/async-storage";

const STATS_KEY = "speaking_listening_stats";

const MINUTES_PER_QUESTION = 0.5;
const MINUTES_PER_CONVERSATION_TURN = 1;

export type SpeakingListeningStats = {
  minutesSpoken: number;
  minutesListened: number;
  lastUpdated: string;
  questionsAnswered: number;
  questionsListened: number;
  conversationTurns: number;
};

const newStats = async (): Promise<SpeakingListeningStats> => {
  try {
    const raw = await AsyncStorage.getItem(STATS_KEY);
    if (!raw) {
      return getDefaultStats();
    }

    return JSON.parse(raw) as SpeakingListeningStats;
  } catch (error) {
    console.error("Error fetching speaking/listening stats:", error);
    return getDefaultStats();
  }
};

const writeStats = async (stats: SpeakingListeningStats) => {
  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
};

const getDefaultStats = async (): Promise<SpeakingListeningStats> => {
  return {
    minutesSpoken: 0,
    minutesListened: 0,
    lastUpdated: new Date().toISOString(),
    questionsAnswered: 0,
    questionsListened: 0,
    conversationTurns: 0,
  };
};

export const recordQuestionAnswered = async () => {
  const stats = await newStats();
  stats.questionsAnswered += 1;
  stats.minutesSpoken = stats.questionsAnswered * MINUTES_PER_QUESTION;
  stats.lastUpdated = new Date().toISOString();
  await writeStats(stats);
};

export const recordQuestionListened = async () => {
  const stats = await newStats();
  stats.questionsListened += 1;
  stats.minutesListened = stats.questionsListened * MINUTES_PER_QUESTION;
  stats.lastUpdated = new Date().toISOString();
  await writeStats(stats);
};

export const recordConversationTime = async () => {
  const stats = await newStats();
  stats.conversationTurns += 1;

  stats.minutesSpoken += MINUTES_PER_CONVERSATION_TURN;
  stats.minutesListened += MINUTES_PER_CONVERSATION_TURN;
  stats.lastUpdated = new Date().toISOString();
  await writeStats(stats);
};

export const getWeeklyStats = async () => {
  const stats = await newStats();

  return {
    minutesSpoken: Math.round(stats.minutesSpoken * 10) / 10,
    minutesListened: Math.round(stats.minutesListened * 10) / 10,
    weeklyChange: {
      spoken: 0,
      listened: 0,
    },
  };
};
