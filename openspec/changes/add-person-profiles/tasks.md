## 1. Walking skeleton

- [ ] 1.1 Add one end-to-end Profile registry slice: public name search, authenticated proposal with name/photo/evidence, moderation approval, canonical public dossier, and one append-only audit trail (test: signed-out search through published Profile).
- [ ] 1.2 Add public and restricted Profile projections so public payloads contain only authored identity and derived public state (test: field-authorization matrix).
- [ ] 1.3 Integrate Profile proposal, correction, and read actions with the foundation policy interface and safe unavailable outcomes (test: active, limited, suspended, blocked, and policy-outage cases).

## 2. Eligibility and photo intake

- [ ] 2.1 Enforce the living-adult and substantive-startup-participation boundary with private eligibility category, evidence, and proposer attestation (test: complete eligible/ineligible fixture matrix).
- [ ] 2.2 Implement subject/permission/license photo provenance, safe decoding, metadata stripping, fixed derivatives, no hotlinking, and neutral fallback behavior (test: malformed, oversized, metadata-bearing, unsupported-provenance, and removal cases).
- [ ] 2.3 Add pre-publication Profile moderation with `pending`, `published`, `limited`, and `removed` transitions, notices, and appeals (test: state/outcome matrix).

## 3. Search-before-create and duplicate prevention

- [ ] 3.1 Build public name search with normalization, typo tolerance, deterministic ordering, public-only fields, canonical IDs, empty results, and pagination (test: exact, diacritic, punctuation, typo, same-name, and no-match queries).
- [ ] 3.2 Require a completed current search before **Add this person**, show likely matches first, and fail closed when search or policy checks are unavailable (test: direct, stale, concurrent, and outage submissions).
- [ ] 3.3 Add duplicate candidates using normalized names, exact/near-duplicate asset hashes, provenance references, and reviewer decisions without facial recognition or biometric templates (test: duplicate, same-name-different-person, and adversarial-image cases).
- [ ] 3.4 Add signed-in block filtering, anti-enumeration rate limits, query-log minimization, and safe throttled errors without weakening logged-out public access (test: block-direction non-disclosure and scrape fixtures).

## 4. Claims, corrections, and disputes

- [ ] 4.1 Project the foundation's verified Profile Claim into claimed state and owner controls without copying private claim evidence or creating a Public Byline (test: pending, verified, revoked, and unavailable-claim cases).
- [ ] 4.2 Add Account-backed name/photo correction proposals, verified-claimant preference, ordinary review, urgent photo hiding, decision notices, and appeal hooks (test: claimed, unclaimed, wrong-person, rights, privacy, and safety cases).
- [ ] 4.3 Add report reasons for ineligible person, incorrect identity, impersonation, duplicate, photo rights/privacy, and other policy issues using foundation Moderation Cases (test: duplicate-safe report and confidential-evidence behavior).

## 5. Canonical URLs and reversible merges

- [ ] 5.1 Add opaque Profile IDs, canonical `/profiles/<id>/<slug>` links, stale-slug redirects, canonical metadata, and index controls (test: rename, malformed ID, stale slug, and removed states).
- [ ] 5.2 Implement deterministic duplicate-survivor selection, verified-claim conflict holds, atomic association rebinding, source redirects, and append-only merge lineage (test: every claim/merge cross-product).
- [ ] 5.3 Implement moderator merge reversal that restores source identities and associations from lineage without changing associated object authorship or timestamps (test: merge/reverse round trip and partial-failure recovery).

## 6. Removal, retention, and close-out

- [ ] 6.1 Add removal decisions, generic public unavailable responses, deindexing signals, public identity erasure/minimization, and expiring restricted tombstones (test: removal reason non-disclosure and timed retention matrix).
- [ ] 6.2 Verify that Account deletion and Profile Claim revocation never implicitly remove, transfer, or publish a Profile (test: independent lifecycle matrix).
- [ ] 6.3 Run unit, integration, authorization, image-security, accessibility, search-quality, canonicalization, and browser tests for signed-out, empty, pending, blocked, limited, merged, removed, provider-outage, and abuse states.
- [ ] 6.4 Complete privacy, threat-model, moderator-runbook, search-engine-removal, and specialist legal review of eligible-person, third-party notice, image-rights, correction, deindexing, and retention copy before launch.
