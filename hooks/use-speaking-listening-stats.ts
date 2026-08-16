import { getWeeklyStats } from "@/lib/speaking-listening-stats";
import { useEffect, useState } from "react";

interface weeklyStats {
  minutesSpoken: number;
  minutesListened: number;
  weeklyChange: {
    spoken: number;
    listened: number;
  };
}

export const useSpeakingListeningStats = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<weeklyStats | null>(null);

  const refreshStats = async () => {
    try {
      const newStats = await getWeeklyStats();
      setStats(newStats);
    } catch (error) {
      console.error("Error refreshing speaking/listening stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStats();
  }, []);

  return { stats, loading, refreshStats };
};
