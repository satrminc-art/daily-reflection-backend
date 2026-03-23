import { Platform } from "react-native";
import type {
  ReflectionFollowUpErrorCode,
  ReflectionFollowUpRequest,
  ReflectionFollowUpResponse,
  ReflectionFollowUpSuccessResponse,
} from "@/types/ai";

export class ReflectionFollowUpError extends Error {
  code: ReflectionFollowUpErrorCode;

  constructor(code: ReflectionFollowUpErrorCode, message: string) {
    super(message);
    this.name = "ReflectionFollowUpError";
    this.code = code;
  }
}

function getApiBaseUrl() {
  const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, "");
  }

  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.location.origin;
  }

  throw new ReflectionFollowUpError(
    "internal_error",
    "Missing EXPO_PUBLIC_API_BASE_URL for AI follow-up requests.",
  );
}

export async function fetchReflectionFollowUp(
  payload: ReflectionFollowUpRequest,
): Promise<ReflectionFollowUpSuccessResponse["data"]> {
  const response = await fetch(`${getApiBaseUrl()}/api/reflection/follow-up`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as ReflectionFollowUpResponse;
  if (!response.ok || !body.success) {
    throw new ReflectionFollowUpError(
      body.success ? "internal_error" : body.error.code,
      body.success ? "AI follow-up request failed." : body.error.message,
    );
  }

  return body.data;
}
