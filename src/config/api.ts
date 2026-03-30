import { publicRuntimeConfig } from "@/config/publicRuntime";

export const API_BASE_URL = publicRuntimeConfig.apiBaseUrl;
export const REFLECTION_FOLLOW_UP_ENDPOINT = `${API_BASE_URL}/api/reflection/follow-up`;
