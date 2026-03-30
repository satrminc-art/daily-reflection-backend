const DEFAULT_API_BASE_URL = "https://daily-reflection-backend.vercel.app";

function sanitizeUrl(value: string | undefined, fallback: string) {
  return (value?.trim() || fallback).replace(/\/$/, "");
}

export const publicEnv = {
  apiBaseUrl: sanitizeUrl(process.env.EXPO_PUBLIC_API_BASE_URL, DEFAULT_API_BASE_URL),
  revenueCatAppleKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY?.trim() || "test_CWkxcfKUkTNfIIjbugIvxkYrXEY",
  revenueCatAndroidKey: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY?.trim() || "test_CWkxcfKUkTNfIIjbugIvxkYrXEY",
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() || "",
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() || "",
} as const;

export function isSupabaseConfigured() {
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);
}
