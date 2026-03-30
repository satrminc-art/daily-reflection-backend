import { createNote } from "../../db/noteRepository";
import { requireAuth } from "../../middleware/auth";
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

export default async function notesRoute(
  req: ApiRouteRequest,
  res: ApiRouteResponse<ApiResponse<unknown> | ApiErrorResponse>,
) {
  if (req.method !== "POST") {
    return methodNotAllowed(res, ["POST"]);
  }

  const auth = await requireAuth(req, res);
  if (!auth) {
    return;
  }

  const parsed = parseJsonBody<Record<string, unknown>>(req.body);
  const reflectionId = readTrimmedString(parsed?.reflectionId);
  const content = readTrimmedString(parsed?.content);

  if (!reflectionId || !content) {
    return jsonError(res, 400, "invalid_request", "A reflection id and note content are required.");
  }

  const note = await createNote({
    userId: auth.userId,
    reflectionId,
    content,
  });

  if (!note) {
    return jsonError(res, 500, "note_create_failed", "The note could not be created.");
  }

  return jsonOk(res, note, 201);
}
