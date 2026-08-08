import { Session, User } from "@supabase/supabase-js";
import { createContext, useContext } from "react";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: any | null;
  loading: boolean;
  isAdmin: boolean;
  isPremium: boolean;
  premiumExpired: boolean;
  premiumExpiresAt: string | null;
  refreshProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isPremium: false,
  premiumExpired: false,
  premiumExpiresAt: null,
  refreshProfile: async () => {},
} as AuthContextType);

export const useAuth = () => useContext(AuthContext);
