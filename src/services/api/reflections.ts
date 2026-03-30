import { ApiReflectionRecord } from "@/types/api";
import { apiRequest } from "@/services/api/client";

export function fetchTodayReflection(accessToken?: string | null) {
  return apiRequest<ApiReflectionRecord>("/reflections/today", {
    accessToken,
  });
}

export function fetchReflectionByDate(dateKey: string, accessToken?: string | null) {
  return apiRequest<ApiReflectionRecord>(`/reflections/${dateKey}`, {
    accessToken,
  });
}
