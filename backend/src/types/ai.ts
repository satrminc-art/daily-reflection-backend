import type { MembershipTier } from "./membership";

export interface ReflectionFollowUpRequest {
  reflectionId: string;
  reflectionText: string;
  userNote: string;
  category?: string;
  appLanguage: string;
  reflectionLanguage: string;
  entitlement: MembershipTier;
  userId?: string;
}

export interface ReflectionFollowUpData {
  text: string;
  model: string;
  generatedAt: string;
}

export interface ReflectionFollowUpSuccessResponse {
  success: true;
  text: string;
}

export type ReflectionFollowUpErrorCode =
  | "method_not_allowed"
  | "invalid_request"
  | "note_required"
  | "note_too_long"
  | "daily_limit_reached"
  | "rate_limited"
  | "missing_api_key"
  | "openai_error"
  | "empty_response"
  | "internal_error";

export interface ReflectionFollowUpErrorResponse {
  success: false;
  error: string;
}

export type ReflectionFollowUpResponse = ReflectionFollowUpSuccessResponse | ReflectionFollowUpErrorResponse;
