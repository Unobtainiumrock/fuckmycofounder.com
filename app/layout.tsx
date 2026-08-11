import type { Metadata, Viewport } from "next";
import type { ReactElement, ReactNode } from "react";

import "@/assets/css/reset.css";
import "@/assets/css/tokens.css";
import "@/assets/css/base.css";
import "@/assets/css/components.css";
import "@/assets/css/home.css";

const canonicalUrl = "https://fuckmycofounder.com/";

export const metadata: Metadata = {
  metadataBase: new URL(canonicalUrl),
  title: "Fuck My Cofounder — File an Incident Report",
  description:
    "Turn cofounder chaos into a redacted, shareable incident report. No accounts. Optional mugshot. No names.",
  alternates: { canonical: canonicalUrl },
  openGraph: {
    type: "website",
    title: "Fuck My Cofounder — File an Incident Report",
    description: "Some startups need a pivot. Some need an incident report.",
    url: canonicalUrl,
    images: [{ url: "/assets/images/share-card.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fuck My Cofounder",
    description: "File a completely unofficial cofounder incident report.",
    images: ["/assets/images/share-card.png"],
  },
  icons: { icon: "/assets/icons/favicon.svg" },
  robots: { follow: true, index: true },
};

export const viewport: Viewport = {
  themeColor: "#f4eddf",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>): ReactElement {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
