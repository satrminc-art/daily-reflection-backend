export function trackBackendEvent(name: string, properties?: Record<string, unknown>) {
  console.info("[backend-analytics]", name, properties ?? {});
}
