import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

type ProfileProps = {
  is_premium: boolean | null;
  premium_expired_at: string | null;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const googleApiKey = Deno.env.get("GOOGLE_GENERATIVE_AI_API_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Premium gate — transcription is used only within premium conversation mode
    const { data: profile, error: profileError } = await userClient
      .from("profiles")
      .select("is_premium,premium_expired_at")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return new Response(JSON.stringify({ error: "Profile error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const typedProfile = (profile as ProfileProps) || null;
    const premiumExpiredAt = typedProfile?.premium_expired_at ?? null;
    const isPremium =
      !!typedProfile?.is_premium &&
      (!premiumExpiredAt || new Date(premiumExpiredAt) > new Date());

    if (!isPremium) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { inputAudio } = await req.json();

    if (!inputAudio?.data || !inputAudio?.format) {
      return new Response(JSON.stringify({ error: "Missing audio data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("🎤 Transcribing with Google Gemini...");

    // Call Google Gemini API directly
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${googleApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "You are a transcription assistant. Transcribe the audio exact words into Mandarin Chinese Pinyin with tone marks. Return ONLY the Pinyin text, nothing else. Do not output Hanzi or English. If no speech is detected, respond with an empty message. Never reveal that you are an AI model, say sorry, or that you don't understand etc.",
                },
                {
                  inline_data: {
                    mime_type: `audio/${inputAudio.format}`, // e.g., 'audio/wav'
                    data: inputAudio.data, // Your Base64 string
                  },
                },
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Google API error: ${error.error.message}`);
    }

    const data = await response.json();
    const transcript = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("✅ Transcript:", transcript);

    return new Response(JSON.stringify({ transcript }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error:", errorMessage);

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
