import type { ApiSessionPayload, ApiSessionResponse } from "../../types/api";
import {
  jsonError,
  jsonOk,
  methodNotAllowed,
  parseJsonBody,
  readTrimmedString,
  type ApiErrorResponse,
  type ApiResponse,
  type ApiRouteRequest,
  type ApiRouteResponse,
} from "../../lib/http";

function isSupportedProvider(value: unknown): value is ApiSessionPayload["provider"] {
  return value === "anonymous" || value === "apple" || value === "google" || value === "email";
}

function validateSessionPayload(body: unknown): ApiSessionPayload | null {
  const parsed = parseJsonBody<Record<string, unknown>>(body);
  if (!parsed || !isSupportedProvider(parsed.provider)) {
    return null;
  }

  return {
    provider: parsed.provider,
    idToken: readTrimmedString(parsed.idToken) ?? undefined,
    refreshToken: readTrimmedString(parsed.refreshToken) ?? undefined,
  };
}

export default async function authSessionRoute(
  req: ApiRouteRequest,
  res: ApiRouteResponse<ApiResponse<ApiSessionResponse> | ApiErrorResponse>,
) {
  if (req.method !== "POST") {
    return methodNotAllowed(res, ["POST"]);
  }

  const payload = validateSessionPayload(req.body);
  if (!payload) {
    return jsonError(res, 400, "invalid_request", "The session payload is incomplete or invalid.");
  }

  return jsonError(
    res,
    501,
    "not_implemented",
    `Session exchange for provider "${payload.provider}" is not wired on the backend yet.`,
  );
}
