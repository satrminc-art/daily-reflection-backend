import { resolveEffectiveEntitlement } from "../../../lib/entitlements";
import { enforceFollowUpLimits } from "../../../lib/limits";
import { logApiEvent, buildRequestFingerprint } from "../../../lib/logging";
import { generateReflectionFollowUps } from "../../../lib/openai";
import type {
  ReflectionFollowUpErrorCode,
  ReflectionFollowUpRequest,
  ReflectionFollowUpResponse,
} from "../../types/ai";
import type { MembershipTier } from "../../types/membership";

const ROUTE_PATH = "/api/reflection/follow-up";
const MAX_BODY_BYTES = 8_192;
const MAX_REFLECTION_ID_LENGTH = 120;
const MAX_REFLECTION_TEXT_LENGTH = 600;
const MAX_USER_NOTE_LENGTH = 1_200;
const MAX_CATEGORY_LENGTH = 80;
const MAX_LANGUAGE_LENGTH = 24;
const MAX_USER_ID_LENGTH = 120;
const ALLOWED_KEYS = [
  "reflectionId",
  "reflectionText",
  "userNote",
  "category",
  "appLanguage",
  "reflectionLanguage",
  "entitlement",
  "userId",
] as const;

type RouteRequest = {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
};

type RouteResponse = {
  setHeader?: (name: string, value: string | string[]) => void;
  status: (statusCode: number) => RouteResponse;
  json: (body: ReflectionFollowUpResponse) => void;
};

type ValidationResult =
  | { ok: true; data: ReflectionFollowUpRequest }
  | { ok: false; code: ReflectionFollowUpErrorCode; message: string };

function getHeader(req: RouteRequest, headerName: string) {
  const raw = req.headers[headerName];
  if (Array.isArray(raw)) {
    return raw[0];
  }
  return raw;
}

function getClientIp(req: RouteRequest) {
  return (
    getHeader(req, "x-forwarded-for")?.split(",")[0]?.trim() ||
    getHeader(req, "x-real-ip")?.trim() ||
    "unknown"
  );
}

function getSafeNotePreview(note: string) {
  return note.replace(/\s+/g, " ").slice(0, 80);
}

function sendJson(
  req: RouteRequest,
  res: RouteResponse,
  args: { status: number; body: ReflectionFollowUpResponse; userId?: string; reason?: string },
) {
  const fingerprint = buildRequestFingerprint({
    ip: getClientIp(req),
    userAgent: getHeader(req, "user-agent"),
  });

  logApiEvent({
    route: ROUTE_PATH,
    status: args.status,
    fingerprint,
    userId: args.userId,
    reason: args.reason,
  });

  return res.status(args.status).json(args.body);
}

function jsonError(
  req: RouteRequest,
  res: RouteResponse,
  status: number,
  code: ReflectionFollowUpErrorCode,
  message: string,
  userId?: string,
  reason?: string,
) {
  return sendJson(req, res, {
    status,
    userId,
    reason,
    body: {
      success: false,
      error: code,
    },
  });
}

function parseBody(body: unknown): Record<string, unknown> | null {
  if (!body) {
    return null;
  }

  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body) as unknown;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  }

  if (typeof body === "object" && !Array.isArray(body)) {
    return body as Record<string, unknown>;
  }

  return null;
}

function getBodySize(body: Record<string, unknown>) {
  return Buffer.byteLength(JSON.stringify(body), "utf8");
}

function trimString(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) {
    return null;
  }

  return trimmed;
}

function validateOptionalString(value: unknown, maxLength: number) {
  if (value === undefined) {
    return { ok: true as const, value: undefined };
  }

  const trimmed = trimString(value, maxLength);
  if (trimmed === null) {
    return { ok: false as const };
  }

  return { ok: true as const, value: trimmed };
}

function isEntitlement(value: unknown): value is MembershipTier {
  return value === "freemium" || value === "premium" || value === "lifelong";
}

function validateRequest(body: Record<string, unknown> | null): ValidationResult {
  if (!body) {
    return {
      ok: false,
      code: "invalid_request",
      message: "The follow-up request body is missing or invalid.",
    };
  }

  if (getBodySize(body) > MAX_BODY_BYTES) {
    return {
      ok: false,
      code: "invalid_request",
      message: "The follow-up request body is too large.",
    };
  }

  const bodyKeys = Object.keys(body);
  if (bodyKeys.some((key) => !ALLOWED_KEYS.includes(key as (typeof ALLOWED_KEYS)[number]))) {
    return {
      ok: false,
      code: "invalid_request",
      message: "The follow-up request body contains unsupported fields.",
    };
  }

  const reflectionId = trimString(body.reflectionId, MAX_REFLECTION_ID_LENGTH);
  const reflectionText = trimString(body.reflectionText, MAX_REFLECTION_TEXT_LENGTH);
  const userNote = trimString(body.userNote, MAX_USER_NOTE_LENGTH);
  const appLanguage = trimString(body.appLanguage, MAX_LANGUAGE_LENGTH);
  const reflectionLanguage = trimString(body.reflectionLanguage, MAX_LANGUAGE_LENGTH);
  const categoryResult = validateOptionalString(body.category, MAX_CATEGORY_LENGTH);
  const userIdResult = validateOptionalString(body.userId, MAX_USER_ID_LENGTH);

  if (
    !reflectionId ||
    !reflectionText ||
    !userNote ||
    !appLanguage ||
    !reflectionLanguage ||
    !categoryResult.ok ||
    !userIdResult.ok ||
    !isEntitlement(body.entitlement)
  ) {
    return {
      ok: false,
      code: "invalid_request",
      message: "The follow-up request body is incomplete or invalid.",
    };
  }

  return {
    ok: true,
    data: {
      reflectionId,
      reflectionText,
      userNote,
      category: categoryResult.value,
      appLanguage,
      reflectionLanguage,
      entitlement: body.entitlement,
      userId: userIdResult.value,
    },
  };
}

export async function reflectionFollowUpRoute(req: RouteRequest, res: RouteResponse) {
  res.setHeader?.("Allow", "POST");

  if (req.method !== "POST") {
    return jsonError(req, res, 405, "method_not_allowed", "Only POST is supported.", undefined, "method");
  }

  const validation = validateRequest(parseBody(req.body));
  if (!validation.ok) {
    return jsonError(req, res, 400, validation.code, validation.message, undefined, "validation");
  }

  const clientIp = getClientIp(req);
  const userId = validation.data.userId;

  console.info(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      route: ROUTE_PATH,
      event: "follow_up_request_received",
      apiKeyConfigured: Boolean(process.env.OPENAI_API_KEY?.trim()),
      reflectionId: validation.data.reflectionId,
      noteLength: validation.data.userNote.length,
      notePreview: getSafeNotePreview(validation.data.userNote),
      appLanguage: validation.data.appLanguage,
      reflectionLanguage: validation.data.reflectionLanguage,
      fingerprint: buildRequestFingerprint({
        ip: clientIp,
        userAgent: getHeader(req, "user-agent"),
      }),
      userId: userId ?? null,
    }),
  );

  try {
    const entitlementResolution = await resolveEffectiveEntitlement({
      clientEntitlement: validation.data.entitlement,
      userId,
    });

    const limitResult = await enforceFollowUpLimits({
      ipIdentifier: clientIp,
      userIdentifier: userId,
      entitlement: entitlementResolution.effectiveEntitlement,
    });

    if (!limitResult.allowed) {
      return jsonError(
        req,
        res,
        429,
        limitResult.code,
        limitResult.code === "daily_limit_reached"
          ? "The daily AI follow-up limit has been reached."
          : "Please wait a moment before requesting another AI follow-up.",
        userId,
        limitResult.code,
      );
    }

    const result = await generateReflectionFollowUps({
      ...validation.data,
      entitlement: entitlementResolution.effectiveEntitlement,
    });

    console.info(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        route: ROUTE_PATH,
        event: "follow_up_response_ready",
        textLength: result.text.length,
        model: result.model,
        userId: userId ?? null,
      }),
    );

    return sendJson(req, res, {
      status: 200,
      userId,
      reason: entitlementResolution.source,
      body: {
        success: true,
        text: result.text,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown follow-up error.";
    const safeReason =
      message.includes("OPENAI_API_KEY")
        ? "missing_api_key"
        : message.toLowerCase().includes("openai")
          ? "openai_error"
          : "internal_error";

    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        route: ROUTE_PATH,
        reason: safeReason,
        message,
        fingerprint: buildRequestFingerprint({
          ip: clientIp,
          userAgent: getHeader(req, "user-agent"),
        }),
        userId: userId ?? null,
      }),
    );

    if (safeReason === "missing_api_key") {
      return jsonError(req, res, 500, "missing_api_key", "The AI service is not configured right now.", userId, safeReason);
    }

    if (safeReason === "openai_error") {
      return jsonError(req, res, 502, "openai_error", "The AI follow-up could not be generated right now.", userId, safeReason);
    }

    return jsonError(req, res, 500, "internal_error", "The AI follow-up could not be generated right now.", userId, safeReason);
  }
}

export default reflectionFollowUpRoute;
