import type { ApiReflectionRecord } from "../../types/api";
import { getReflectionByDate } from "../../reflections/reflectionService";
import {
  getQueryParam,
  isIsoDateKey,
  jsonError,
  jsonOk,
  methodNotAllowed,
  type ApiErrorResponse,
  type ApiResponse,
  type ApiRouteRequest,
  type ApiRouteResponse,
} from "../../lib/http";

export default async function reflectionByDateRoute(
  req: ApiRouteRequest,
  res: ApiRouteResponse<ApiResponse<ApiReflectionRecord> | ApiErrorResponse>,
) {
  if (req.method !== "GET") {
    return methodNotAllowed(res, ["GET"]);
  }

  const dateKey = getQueryParam(req, "date");
  if (!isIsoDateKey(dateKey)) {
    return jsonError(res, 400, "invalid_date", "The reflection date must use YYYY-MM-DD.");
  }

  const language = getQueryParam(req, "language") ?? "en";
  const reflection = getReflectionByDate(dateKey, language);
  if (!reflection) {
    return jsonError(res, 404, "reflection_not_found", "No reflection is available for the requested date.");
  }

  return jsonOk(res, reflection);
}
