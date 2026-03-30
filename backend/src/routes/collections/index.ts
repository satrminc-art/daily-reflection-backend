import { createCollection, listCollectionsByUser } from "../../db/collectionRepository";
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

export default async function collectionsRoute(
  req: ApiRouteRequest,
  res: ApiRouteResponse<ApiResponse<unknown> | ApiErrorResponse>,
) {
  const auth = await requireAuth(req, res);
  if (!auth) {
    return;
  }

  if (req.method === "GET") {
    const collections = await listCollectionsByUser(auth.userId);
    return jsonOk(res, collections);
  }

  if (req.method === "POST") {
    const parsed = parseJsonBody<Record<string, unknown>>(req.body);
    const name = readTrimmedString(parsed?.name);
    if (!name) {
      return jsonError(res, 400, "invalid_request", "A collection name is required.");
    }

    const collection = await createCollection({
      userId: auth.userId,
      name,
    });

    if (!collection) {
      return jsonError(res, 500, "collection_create_failed", "The collection could not be created.");
    }

    return jsonOk(res, collection, 201);
  }

  return methodNotAllowed(res, ["GET", "POST"]);
}
