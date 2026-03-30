import { listSavedReflectionsByUser, upsertSavedReflection } from "../../db/savedReflectionRepository";
import { requireAuth } from "../../middleware/auth";
import {
  isIsoDateKey,
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

function validateSavedReflectionBody(body: unknown) {
  const parsed = parseJsonBody<Record<string, unknown>>(body);
  if (!parsed) {
    return null;
  }

  const reflectionId = readTrimmedString(parsed.reflectionId);
  const dateKey = readTrimmedString(parsed.dateKey);
  const reflectionText = readTrimmedString(parsed.reflectionText);
  const theme = readTrimmedString(parsed.theme);
  const tags = Array.isArray(parsed.tags) ? parsed.tags.filter((value): value is string => typeof value === "string") : null;

  if (!reflectionId || !isIsoDateKey(dateKey) || !reflectionText || !theme || !tags) {
    return null;
  }

  return {
    reflectionId,
    dateKey,
    reflectionText,
    theme,
    tags,
  };
}

export default async function savedReflectionsRoute(
  req: ApiRouteRequest,
  res: ApiRouteResponse<ApiResponse<unknown> | ApiErrorResponse>,
) {
  const auth = await requireAuth(req, res);
  if (!auth) {
    return;
  }

  if (req.method === "GET") {
    const records = await listSavedReflectionsByUser(auth.userId);
    return jsonOk(res, records);
  }

  if (req.method === "POST") {
    const input = validateSavedReflectionBody(req.body);
    if (!input) {
      return jsonError(res, 400, "invalid_request", "The saved reflection payload is incomplete or invalid.");
    }

    const record = await upsertSavedReflection({
      userId: auth.userId,
      ...input,
    });

    if (!record) {
      return jsonError(res, 500, "save_failed", "The reflection could not be saved.");
    }

    return jsonOk(res, record, 201);
  }

  return methodNotAllowed(res, ["GET", "POST"]);
}
