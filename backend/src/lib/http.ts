export interface ApiErrorShape {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiSuccessResponse<TData> {
  ok: true;
  data: TData;
}

export interface ApiErrorResponse {
  ok: false;
  error: ApiErrorShape;
}

export type ApiResponse<TData> = ApiSuccessResponse<TData> | ApiErrorResponse;

export interface ApiRouteRequest<TBody = unknown> {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: TBody;
  query?: Record<string, string | string[] | undefined>;
}

export interface ApiRouteResponse<TResponse = unknown> {
  setHeader?: (name: string, value: string | string[]) => void;
  status: (statusCode: number) => ApiRouteResponse<TResponse>;
  json: (body: TResponse) => void;
}

export function getHeader(req: ApiRouteRequest, name: string) {
  const raw = req.headers[name];
  if (Array.isArray(raw)) {
    return raw[0];
  }
  return raw;
}

export function jsonOk<TData>(res: ApiRouteResponse<ApiResponse<TData>>, data: TData, statusCode = 200) {
  return res.status(statusCode).json({
    ok: true,
    data,
  });
}

export function jsonError(
  res: ApiRouteResponse<ApiErrorResponse>,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown,
) {
  return res.status(statusCode).json({
    ok: false,
    error: {
      code,
      message,
      ...(details === undefined ? undefined : { details }),
    },
  });
}

export function methodNotAllowed(res: ApiRouteResponse<ApiErrorResponse>, allowed: string[]) {
  res.setHeader?.("Allow", allowed);
  return jsonError(res, 405, "method_not_allowed", `Allowed methods: ${allowed.join(", ")}`, {
    allowed,
  });
}

export function isIsoDateKey(value: string | null | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export function getQueryParam(req: ApiRouteRequest, key: string): string | null {
  const value = req.query?.[key];
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return typeof value === "string" ? value : null;
}

export function parseJsonBody<TBody extends Record<string, unknown>>(body: unknown): TBody | null {
  if (!body) {
    return null;
  }

  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body) as unknown;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as TBody) : null;
    } catch {
      return null;
    }
  }

  if (typeof body === "object" && !Array.isArray(body)) {
    return body as TBody;
  }

  return null;
}

export function readTrimmedString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}
