import { REFLECTION_FOLLOW_UP_ENDPOINT } from "@/config/api";
import type {
  ReflectionFollowUpData,
  ReflectionFollowUpErrorCode,
  ReflectionFollowUpRequest,
  ReflectionFollowUpResponse,
} from "@/types/ai";

const FOLLOW_UP_REQUEST_TIMEOUT_MS = 20_000;
const FOLLOW_UP_ERROR_CODES: ReflectionFollowUpErrorCode[] = [
  "method_not_allowed",
  "invalid_request",
  "note_required",
  "note_too_long",
  "daily_limit_reached",
  "rate_limited",
  "missing_api_key",
  "openai_error",
  "empty_response",
  "internal_error",
];

function isFollowUpErrorCode(value: string): value is ReflectionFollowUpErrorCode {
  return FOLLOW_UP_ERROR_CODES.includes(value as ReflectionFollowUpErrorCode);
}

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
): Promise<ReflectionFollowUpData> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FOLLOW_UP_REQUEST_TIMEOUT_MS);

  if (__DEV__) {
    console.info("[followUp] request:start", {
      endpoint: REFLECTION_FOLLOW_UP_ENDPOINT,
      payload,
      reflectionId: payload.reflectionId,
      noteLength: payload.userNote.trim().length,
      appLanguage: payload.appLanguage,
      reflectionLanguage: payload.reflectionLanguage,
    });
  }

  let response: Response;
  try {
    response = await fetch(REFLECTION_FOLLOW_UP_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeoutId);

    if (__DEV__) {
      console.warn("[followUp] request:error", error);
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new ReflectionFollowUpError("internal_error", "AI follow-up request timed out.");
    }

    throw new ReflectionFollowUpError("internal_error", "AI follow-up request failed.");
  }

  clearTimeout(timeoutId);

  let body: ReflectionFollowUpResponse | null = null;
  try {
    body = (await response.json()) as ReflectionFollowUpResponse;
  } catch {
    body = null;
  }

  if (__DEV__) {
    console.info("[followUp] request:response", {
      status: response.status,
      ok: response.ok,
      body,
    });
  }

  if (!response.ok || !body || !body.success) {
    const errorCode = body && !body.success && isFollowUpErrorCode(body.error) ? body.error : "internal_error";

    throw new ReflectionFollowUpError(
      errorCode,
      body && !body.success ? body.error : "AI follow-up request failed.",
    );
  }

  if (!body.text?.trim()) {
    throw new ReflectionFollowUpError("empty_response", "AI follow-up returned no text.");
  }

  if (__DEV__) {
    console.info("[followUp] request:success", {
      textLength: body.text.length,
    });
  }

  return {
    text: body.text.trim(),
    model: "server",
    generatedAt: new Date().toISOString(),
  };
}
