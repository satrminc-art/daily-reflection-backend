export function captureAppError(error: unknown, context?: Record<string, unknown>) {
  console.warn("[monitoring]", error, context ?? {});
}

export function addMonitoringBreadcrumb(message: string, context?: Record<string, unknown>) {
  if (__DEV__) {
    console.info("[breadcrumb]", message, context ?? {});
  }
}
