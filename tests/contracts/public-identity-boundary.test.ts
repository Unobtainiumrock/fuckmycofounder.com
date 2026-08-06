import { describe, expect, it } from "vitest";

import {
  anonymousAttribution,
  errorAttribution,
  eventAttribution,
  exportAttribution,
  metadataAttribution,
  notificationAttribution,
  ordinaryLogAttribution,
  publicResponseAttribution,
  type AnonymousAttributionProjection,
  type PublicBylineProjection,
  type PublicAttributionProjection,
} from "@/src/modules/identity-safety";

describe("client-safe identity boundary", () => {
  it("lets downstream adapters consume only a pre-derived attribution projection", () => {
    const anonymous: AnonymousAttributionProjection = anonymousAttribution();
    const named: PublicBylineProjection = {
      kind: "named",
      displayName: "Ada Founder",
    };
    const projection: PublicAttributionProjection = anonymous;
    expect({
      response: publicResponseAttribution(projection),
      metadata: metadataAttribution(projection),
      log: ordinaryLogAttribution(projection),
      event: eventAttribution(projection),
      export: exportAttribution(projection),
      error: errorAttribution(projection),
      notification: notificationAttribution(named),
    }).toEqual({
      response: { attribution: anonymous },
      metadata: { author: anonymous },
      log: { outcome: "rendered" },
      event: { actor: anonymous },
      export: { authoredAs: anonymous },
      error: { code: "none" },
      notification: { actor: named },
    });
  });
});
