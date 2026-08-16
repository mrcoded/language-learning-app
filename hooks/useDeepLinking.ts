import { useEffect } from "react";
import { supabase } from "@/lib/utils/supabase";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import { useLinkingURL } from "expo-linking";
import { toast } from "sonner-native";

const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) {
    console.error("Deep linking error", errorCode);
    throw new Error(errorCode);
  }

  const { access_token, refresh_token, token_hash, type } = params as Record<
    string,
    string
  >;

  // ✅ Handle Magic Link
  if (token_hash && type === "magiclink") {
    console.log("🔗 Magic link detected:", token_hash);
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: "magiclink",
    });

    if (error) {
      console.error("Magic link verification error", error);
      throw error;
    }

    return data.session;
  }

  // ✅ Handle OAuth flow
  if (!access_token || !refresh_token) {
    return;
  }

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (error) {
    console.error("Session error", error);
    throw error;
  }

  return data.session;
};

export const useDeepLinking = () => {
  const url = useLinkingURL();

  useEffect(() => {
    if (url) {
      createSessionFromUrl(url)
        .then((session) => {
          if (session) {
            console.log("✅ Session established:", session.user?.email);
          }
        })
        .catch((error) => {
          console.error("❌ Error creating session", error);
          toast.error("Failed to sign in. Please try again.");
        });
    }
  }, [url]);
};
