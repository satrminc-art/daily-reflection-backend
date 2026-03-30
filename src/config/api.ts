const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

export const API_BASE_URL = (configuredBaseUrl || "https://daily-reflection-backend.vercel.app").replace(/\/$/, "");
export const REFLECTION_FOLLOW_UP_ENDPOINT = `${API_BASE_URL}/api/reflection/follow-up`;
