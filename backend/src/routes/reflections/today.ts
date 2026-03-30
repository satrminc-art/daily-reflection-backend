import type { ApiReflectionRecord } from "../../types/api";
import { getTodayReflection } from "../../reflections/reflectionService";
import {
  getQueryParam,
  jsonError,
  jsonOk,
  methodNotAllowed,
  type ApiErrorResponse,
  type ApiResponse,
  type ApiRouteRequest,
  type ApiRouteResponse,
} from "../../lib/http";

export default async function reflectionsTodayRoute(
  req: ApiRouteRequest,
  res: ApiRouteResponse<ApiResponse<ApiReflectionRecord> | ApiErrorResponse>,
) {
  if (req.method !== "GET") {
    return methodNotAllowed(res, ["GET"]);
  }

  const language = getQueryParam(req, "language") ?? "en";
  const reflection = getTodayReflection(language);

  if (!reflection) {
    return jsonError(res, 404, "reflection_not_found", "No reflection is available for today.");
  }

  return jsonOk(res, reflection);
}
