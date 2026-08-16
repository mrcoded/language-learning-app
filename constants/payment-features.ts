import Ionicons from "@expo/vector-icons/Ionicons";

interface Feature {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  billingCycle: string;
  features: string[];
  recommended?: boolean;
  savings?: string;
}

export const FEATURES: Feature[] = [
  {
    icon: "book-outline",
    title: "Advanced Curriculum",
    description: "Access the world's most advanced speaking curriculum",
  },
  {
    icon: "trending-up-outline",
    title: "Target Your Mistakes",
    description: "Lessons personalized to fix your frequent mistakes",
  },
  {
    icon: "bulb-outline",
    title: "Custom Vocabulary",
    description: "Learn vocabulary tailored to your interests",
  },
  {
    icon: "people-outline",
    title: "Situational Roleplays",
    description: "Practice real-world conversations",
  },
  {
    icon: "mic-outline",
    title: "Pronunciation Coach",
    description: "Get instant feedback on your pronunciation",
  },
  {
    icon: "analytics-outline",
    title: "Progress Reports",
    description: "Track your learning journey with detailed analytics",
  },
];

export const PLANS: { annual: Plan; monthly: Plan } = {
  annual: {
    id: "premium_annual",
    name: "Premium",
    price: "799.00",
    period: "year",
    billingCycle: "Billed yearly",
    features: ["7-day free trial", "Cancel anytime"],
    recommended: true,
    savings: "Save 40%",
  },
  monthly: {
    id: "premium_monthly",
    name: "Premium",
    price: "199.00",
    period: "month",
    billingCycle: "Billed monthly",
    features: ["7-day free trial", "Cancel anytime"],
  },
};
