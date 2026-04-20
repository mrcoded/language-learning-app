import { AuthContext } from "@/context/AuthContext";
import { supabase } from "@/lib/utils/supabase";
import { Session } from "@supabase/supabase-js";
import React, { PropsWithChildren, useEffect, useState } from "react";

export default function AuthProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<any | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const premiumExpireAt: string | null = profile?.premium_expired_at;
  const isPremium =
    !!profile?.is_premium &&
    (!premiumExpireAt || new Date(premiumExpireAt) > new Date());

  const getProfile = async (session: Session | null) => {
    if (!session) {
      setProfile(null);
      return;
    }

    const { error, data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();

    setProfile(error ? null : data);
  };

  const refreshProfile = () => getProfile(session);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      // console.log(data);
      const initialSession = data.session ?? null;
      setSession(initialSession);
      await getProfile(initialSession);
      setLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setLoading(true);
      setSession(newSession);
      getProfile(newSession).finally(() => setLoading(false));
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        isAdmin: false,
        isPremium,
        language_choice: profile?.language_choice ?? null,
        premiumExpiresAt: premiumExpireAt,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
