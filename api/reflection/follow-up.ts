import { consumeFollowUpQuota } from "../../lib/limits";
import { generateReflectionFollowUps } from "../../lib/openai";
import type {
  ReflectionFollowUpErrorCode,
  ReflectionFollowUpRequest,
  ReflectionFollowUpResponse,
} from "../../src/types/ai";
import type { MembershipTier } from "../../src/types/membership";

type RouteRequest = {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
};

type RouteResponse = {
  setHeader: (name: string, value: string) => void;
  status: (statusCode: number) => RouteResponse;
  json: (body: ReflectionFollowUpResponse) => void;
};

function jsonError(
  res: RouteResponse,
  status: number,
  code: ReflectionFollowUpErrorCode,
  message: string,
  details?: string,
) {
  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
}

function parseBody(body: unknown): Partial<ReflectionFollowUpRequest> | null {
  if (!body) {
    return null;
  }

  if (typeof body === "string") {
    try {
      return JSON.parse(body) as Partial<ReflectionFollowUpRequest>;
    } catch {
      return null;
    }
  }

  if (typeof body === "object") {
    return body as Partial<ReflectionFollowUpRequest>;
  }

  return null;
}

function isEntitlement(value: unknown): value is MembershipTier {
  return value === "freemium" || value === "premium" || value === "lifelong";
}

function getHeader(req: RouteRequest, headerName: string) {
  const raw = req.headers[headerName];
  if (Array.isArray(raw)) {
    return raw[0];
  }
  return raw;
}

function buildUsageIdentifier(req: RouteRequest, body: ReflectionFollowUpRequest) {
  const forwardedFor = getHeader(req, "x-forwarded-for")?.split(",")[0]?.trim();
  const userAgent = getHeader(req, "user-agent")?.trim();
  return body.userId?.trim() || [forwardedFor, userAgent].filter(Boolean).join("|") || body.reflectionId;
}

function validateRequest(body: Partial<ReflectionFollowUpRequest> | null): ReflectionFollowUpRequest | null {
  if (!body) {
    return null;
  }

  if (
    typeof body.reflectionId !== "string" ||
    typeof body.reflectionText !== "string" ||
    typeof body.userNote !== "string" ||
    typeof body.appLanguage !== "string" ||
    typeof body.reflectionLanguage !== "string" ||
    !isEntitlement(body.entitlement)
  ) {
    return null;
  }

  const reflectionId = body.reflectionId.trim();
  const reflectionText = body.reflectionText.trim();
  const userNote = body.userNote.trim();
  const appLanguage = body.appLanguage.trim();
  const reflectionLanguage = body.reflectionLanguage.trim();

  if (!reflectionId || !reflectionText || !userNote || !appLanguage || !reflectionLanguage) {
    return null;
  }

  return {
    reflectionId,
    reflectionText: reflectionText.slice(0, 1500),
    userNote: userNote.slice(0, 4000),
    category: typeof body.category === "string" ? body.category.trim() || undefined : undefined,
    appLanguage,
    reflectionLanguage,
    entitlement: body.entitlement,
    userId: typeof body.userId === "string" ? body.userId.trim() || undefined : undefined,
  };
}

export default async function handler(req: RouteRequest, res: RouteResponse) {
  res.setHeader("Allow", "POST");

  if (req.method !== "POST") {
    return jsonError(res, 405, "method_not_allowed", "Only POST is supported.");
  }

  const validatedBody = validateRequest(parseBody(req.body));
  if (!validatedBody) {
    return jsonError(
      res,
      400,
      "invalid_request",
      "The follow-up request body is incomplete or invalid.",
    );
  }

  const identifier = buildUsageIdentifier(req, validatedBody);
  const quota = await consumeFollowUpQuota({
    identifier,
    entitlement: validatedBody.entitlement,
  });

  if (!quota.allowed) {
    return jsonError(
      res,
      429,
      "daily_limit_reached",
      "The daily AI follow-up limit has been reached for this account.",
      `Resets at ${quota.resetAt}.`,
    );
  }

  try {
    const result = await generateReflectionFollowUps(validatedBody);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    if (message.includes("OPENAI_API_KEY")) {
      return jsonError(res, 500, "missing_api_key", "The backend is missing its OpenAI API key.");
    }

    if (message.toLowerCase().includes("openai")) {
      return jsonError(res, 502, "openai_error", "The AI follow-up could not be generated right now.", message);
    }

    return jsonError(res, 500, "internal_error", "The AI follow-up could not be generated right now.", message);
  }
}
