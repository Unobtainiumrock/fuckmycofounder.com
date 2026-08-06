import type { NextConfig } from "next";

import {
  networkSecurityHeadersFor,
  securityHeadersFor,
} from "./src/platform/http/security-headers";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/account/:path*",
        headers: [
          ...networkSecurityHeadersFor({
            firstPartyOrigin: "https://fuckmycofounder.com",
            authenticationOrigins: [],
          }),
        ],
      },
      {
        source: "/:path((?!api(?:/|$)|account(?:/|$)).*)",
        headers: [...securityHeadersFor("public-document")],
      },
      {
        source: "/api/:path*",
        headers: [...securityHeadersFor("operational-json")],
      },
    ];
  },
};

export default nextConfig;
