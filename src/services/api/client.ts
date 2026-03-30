import { API_BASE_URL } from "@/config/api";
import { ApiEnvelope } from "@/types/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  accessToken?: string | null;
  signal?: AbortSignal;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload?: unknown,
  ) {
    super(message);
  }
}

export async function apiRequest<TResponse>(path: string, options: RequestOptions = {}): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : undefined),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<TResponse> | TResponse | null;
  if (!response.ok) {
    throw new ApiError("API request failed", response.status, payload);
  }

  if (payload && typeof payload === "object" && "ok" in payload) {
    if (payload.ok) {
      return payload.data as TResponse;
    }

    throw new ApiError(payload.error.message, response.status, payload.error);
  }

  return payload as TResponse;
}
