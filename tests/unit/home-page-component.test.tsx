import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import HomePage from "@/app/page";

describe("home page component", () => {
  it("renders its accessible document landmarks without a browser", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain('href="#main"');
    expect(html).toContain('aria-labelledby="hero-title"');
    expect(html).toContain('aria-labelledby="dialog-title"');
    expect(html).toContain('aria-label="Close report"');
    expect(html).toContain('aria-labelledby="board-entry-title"');
    expect(html).toContain('href="/board"');
    expect(html).toContain('data-avatar-input="true"');
    expect(html).toContain('aria-label="Live case file preview"');
  });
});
