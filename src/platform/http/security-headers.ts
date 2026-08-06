type SecurityRouteClass =
  | "network-document"
  | "operational-json"
  | "public-document";

interface NetworkSecurityOrigins {
  readonly firstPartyOrigin: string;
  readonly authenticationOrigins: readonly string[];
}

const publicDocumentPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "connect-src 'self'",
  "font-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "img-src 'self' data: blob:",
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

export function composeNetworkContentSecurityPolicy(
  origins: NetworkSecurityOrigins,
): string {
  const allowed = [origins.firstPartyOrigin, ...origins.authenticationOrigins];
  if (allowed.some((origin) => !isExactHttpsOrigin(origin))) {
    throw new Error("Network CSP origins must be exact HTTPS origins");
  }
  return publicDocumentPolicy.replace(
    "connect-src 'self'",
    `connect-src 'self' ${allowed.join(" ")}`,
  );
}

function isExactHttpsOrigin(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.origin === value &&
      url.username === "" &&
      url.password === "" &&
      !value.includes("*")
    );
  } catch {
    return false;
  }
}

export function composeContentSecurityPolicy(
  routeClass: SecurityRouteClass,
): string {
  if (routeClass === "public-document") return publicDocumentPolicy;
  if (routeClass === "operational-json") return operationalJsonPolicy;
  throw new Error("Network documents require explicit origins");
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

export function networkSecurityHeadersFor(
  origins: NetworkSecurityOrigins,
): readonly { readonly key: string; readonly value: string }[] {
  return [
    {
      key: "Content-Security-Policy",
      value: composeNetworkContentSecurityPolicy(origins),
    },
    ...securityHeadersFor("public-document").slice(1),
  ];
}
