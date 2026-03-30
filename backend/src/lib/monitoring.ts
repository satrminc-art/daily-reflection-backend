export function captureBackendError(error: unknown, context?: Record<string, unknown>) {
  console.warn("[backend-monitoring]", error, context ?? {});
}
