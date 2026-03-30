import type { MembershipTier } from "@/types/membership";

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
  prompts: string[];
  model: string;
  generatedAt: string;
}

export interface ReflectionFollowUpSuccessResponse {
  success: true;
  data: ReflectionFollowUpData;
}

export type ReflectionFollowUpErrorCode =
  | "method_not_allowed"
  | "invalid_request"
  | "daily_limit_reached"
  | "rate_limited"
  | "missing_api_key"
  | "openai_error"
  | "internal_error";

export interface ReflectionFollowUpErrorResponse {
  success: false;
  error: {
    code: ReflectionFollowUpErrorCode;
    message: string;
    details?: string;
  };
}

export type ReflectionFollowUpResponse =
  | ReflectionFollowUpSuccessResponse
  | ReflectionFollowUpErrorResponse;

export interface StoredReflectionFollowUp extends ReflectionFollowUpData {
  reflectionId: string;
  date: string;
}
