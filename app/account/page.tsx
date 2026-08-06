import type { Metadata } from "next";
import type { ReactElement } from "react";

export const metadata: Metadata = {
  title: "Account access — Fuck My Cofounder",
  robots: { follow: false, index: false },
};

interface AccountPageProps {
  readonly searchParams: Promise<{
    readonly intent?: string;
    readonly returnPath?: string;
  }>;
}

export default async function AccountPage({
  searchParams,
}: AccountPageProps): Promise<ReactElement> {
  const parameters = await searchParams;
  const intent = safeText(parameters.intent) ?? "protected action";
  const returnPath = safeReturnPath(parameters.returnPath);

  return (
    <main id="main">
      <section className="hero" aria-labelledby="account-title">
        <p className="eyebrow">ACCOUNT ACCESS / PROVIDERS NOT CONFIGURED</p>
        <h1 id="account-title">Continue your filing</h1>
        <div className="hero__lower">
          <p className="hero__lede">
            Sign-in is requested only for <strong>{intent}</strong>. Your saved
            intent returns to <code>{returnPath}</code>; no public Profile or
            byline is created by signing in.
          </p>
        </div>
      </section>
      <section className="mode-picker" aria-labelledby="methods-title">
        <div className="section-heading">
          <p className="eyebrow">PASSWORDLESS METHODS</p>
          <h2 id="methods-title">Choose a sign-in method</h2>
        </div>
        <div className="mode-grid">
          {(["Google", "Apple", "Email link"] as const).map((method) => (
            <button
              className="button button--disabled"
              disabled
              key={method}
              type="button"
            >
              {method} — unavailable
            </button>
          ))}
        </div>
        <p role="status">
          No live authentication provider has been selected. Your protected
          intent is preserved.
        </p>
      </section>
    </main>
  );
}

function safeText(value: string | undefined): string | null {
  if (!value) return null;
  return value.replaceAll(/[\u0000-\u001f<>]/gu, "").slice(0, 80) || null;
}

function safeReturnPath(value: string | undefined): string {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}
