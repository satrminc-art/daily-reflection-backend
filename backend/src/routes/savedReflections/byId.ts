import { deleteSavedReflection } from "../../db/savedReflectionRepository";
import { requireAuth } from "../../middleware/auth";
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

export default async function savedReflectionByIdRoute(
  req: ApiRouteRequest,
  res: ApiRouteResponse<ApiResponse<{ deleted: true; id: string }> | ApiErrorResponse>,
) {
  if (req.method !== "DELETE") {
    return methodNotAllowed(res, ["DELETE"]);
  }

  const auth = await requireAuth(req, res);
  if (!auth) {
    return;
  }

  const id = getQueryParam(req, "id");
  if (!id) {
    return jsonError(res, 400, "invalid_request", "A saved reflection id is required.");
  }

  const deleted = await deleteSavedReflection(auth.userId, id);
  if (!deleted) {
    return jsonError(res, 404, "saved_reflection_not_found", "The saved reflection could not be found.");
  }

  return jsonOk(res, { deleted: true, id });
}
