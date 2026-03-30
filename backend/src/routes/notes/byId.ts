import { updateNote } from "../../db/noteRepository";
import { requireAuth } from "../../middleware/auth";
import {
  getQueryParam,
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

export default async function noteByIdRoute(
  req: ApiRouteRequest,
  res: ApiRouteResponse<ApiResponse<unknown> | ApiErrorResponse>,
) {
  if (req.method !== "PATCH") {
    return methodNotAllowed(res, ["PATCH"]);
  }

  const auth = await requireAuth(req, res);
  if (!auth) {
    return;
  }

  const noteId = getQueryParam(req, "id");
  const parsed = parseJsonBody<Record<string, unknown>>(req.body);
  const content = readTrimmedString(parsed?.content);

  if (!noteId || !content) {
    return jsonError(res, 400, "invalid_request", "A note id and updated content are required.");
  }

  const note = await updateNote({
    userId: auth.userId,
    noteId,
    content,
  });

  if (!note) {
    return jsonError(res, 404, "note_not_found", "The note could not be updated.");
  }

  return jsonOk(res, note);
}
