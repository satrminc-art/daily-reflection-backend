import {
  jsonError,
  methodNotAllowed,
  type ApiErrorResponse,
  type ApiRouteRequest,
  type ApiRouteResponse,
} from "../../lib/http";

export default async function aiReflectionFollowUpRoute(
  req: ApiRouteRequest,
  res: ApiRouteResponse<ApiErrorResponse>,
) {
  if (req.method !== "POST") {
    return methodNotAllowed(res, ["POST"]);
  }

  return jsonError(res, 501, "not_implemented", "AI follow-up proxying is scaffolded but not connected yet.");
}
