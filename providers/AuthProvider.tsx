import { AuthContext } from "@/context/AuthContext";
import { supabase } from "@/lib/utils/supabase";
import { Session } from "@supabase/supabase-js";
import React, { PropsWithChildren, useEffect, useState } from "react";

export default function AuthProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<any | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const premiumExpireAt: string | null = profile?.premium_expired_at ?? null;
  const hasExpiry = !!premiumExpireAt;
  const isExpired = hasExpiry && new Date(premiumExpireAt!) <= new Date();

  // True only when DB says premium AND expiry hasn't passed
  const isPremium = !!profile?.is_premium && !isExpired;

  // True when they were premium but the trial/subscription has lapsed
  const premiumExpired = !!profile?.is_premium && isExpired;

  const revokeExpiredPremium = async (userId: string) => {
    await supabase
      .from("profiles")
      .update({ is_premium: false })
      .eq("id", userId);
  };

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

    const loadedProfile = error ? null : data;
    setProfile(loadedProfile);

    // Auto-revoke in DB if premium is set but has expired
    if (
      loadedProfile?.is_premium &&
      loadedProfile?.premium_expired_at &&
      new Date(loadedProfile.premium_expired_at) <= new Date()
    ) {
      await revokeExpiredPremium(session.user.id);
      // Update local state immediately so UI reacts without another fetch
      setProfile((prev: any) => prev ? { ...prev, is_premium: false } : prev);
    }
  };

  const refreshProfile = () => getProfile(session);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
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
        premiumExpired,
        premiumExpiresAt: premiumExpireAt,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
