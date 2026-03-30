import { ApiSessionPayload, ApiSessionResponse, CurrentUserResponse } from "@/types/api";
import { apiRequest } from "@/services/api/client";

export function createSession(payload: ApiSessionPayload) {
  return apiRequest<ApiSessionResponse>("/api/auth/session", {
    method: "POST",
    body: payload,
  });
}

export function fetchCurrentUser(accessToken: string) {
  return apiRequest<CurrentUserResponse>("/api/me", {
    accessToken,
  });
}
