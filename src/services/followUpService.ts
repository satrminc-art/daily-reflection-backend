import { REFLECTION_FOLLOW_UP_ENDPOINT } from "@/config/api";
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

export async function fetchReflectionFollowUp(
  payload: ReflectionFollowUpRequest,
): Promise<ReflectionFollowUpSuccessResponse["data"]> {
  const response = await fetch(REFLECTION_FOLLOW_UP_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let body: ReflectionFollowUpResponse | null = null;
  try {
    body = (await response.json()) as ReflectionFollowUpResponse;
  } catch {
    body = null;
  }

  if (!response.ok || !body || !body.success) {
    throw new ReflectionFollowUpError(
      body && !body.success ? body.error.code : "internal_error",
      body && !body.success ? body.error.message : "AI follow-up request failed.",
    );
  }

  return body.data;
}
