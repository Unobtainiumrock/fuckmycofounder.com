type SecurityRouteClass = "operational-json" | "public-document";

const publicDocumentPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "connect-src 'self'",
  "font-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "img-src 'self' data:",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "upgrade-insecure-requests",
].join("; ");

const operationalJsonPolicy = [
  "default-src 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
].join("; ");

export function composeContentSecurityPolicy(
  routeClass: SecurityRouteClass,
): string {
  return routeClass === "public-document"
    ? publicDocumentPolicy
    : operationalJsonPolicy;
}

export function securityHeadersFor(
  routeClass: SecurityRouteClass,
): readonly { readonly key: string; readonly value: string }[] {
  return [
    {
      key: "Content-Security-Policy",
      value: composeContentSecurityPolicy(routeClass),
    },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=()",
    },
    { key: "Referrer-Policy", value: "no-referrer" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
  ];
}
