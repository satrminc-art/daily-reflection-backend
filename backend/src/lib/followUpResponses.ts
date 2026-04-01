import type {
  ReflectionFollowUpErrorCode,
  ReflectionFollowUpResponse,
} from "../types/ai";

export function followUpSuccess(text: string): ReflectionFollowUpResponse {
  return {
    success: true,
    text,
  };
}

export function followUpError(code: ReflectionFollowUpErrorCode): ReflectionFollowUpResponse {
  return {
    success: false,
    error: code,
  };
}
