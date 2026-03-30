import { createHash } from "crypto";

function anonymize(value: string | undefined) {
  if (!value) {
    return "unknown";
  }

  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

export function buildRequestFingerprint(args: {
  ip?: string;
  userAgent?: string;
}) {
  return anonymize([args.ip?.trim(), args.userAgent?.trim()].filter(Boolean).join("|"));
}

export function logApiEvent(event: {
  route: string;
  status: number;
  fingerprint: string;
  userId?: string;
  reason?: string;
}) {
  console.info(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      route: event.route,
      status: event.status,
      fingerprint: event.fingerprint,
      userId: event.userId ?? null,
      reason: event.reason ?? null,
    }),
  );
}
