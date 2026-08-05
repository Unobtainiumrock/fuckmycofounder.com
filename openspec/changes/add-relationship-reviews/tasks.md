## 1. Walking skeleton

- [ ] 1.1 Add one end-to-end Review slice: public Profile selection, local signed-out draft, protected Account continuation, directional Relationship Claim, Assessment, testimony, attribution choice, moderation approval, and canonical published filed account (test: named and anonymous browser journeys).
- [ ] 1.2 Add public and restricted Review projections so Relationship Claim evidence, Account identity, anonymous linkage, exact dates, organization context, moderator notes, and risk signals never enter public payloads (test: role/field authorization matrix).
- [ ] 1.3 Integrate Review submission, revision, withdrawal, Profile Subject Response, and read eligibility with the foundation policy interface and Profile registry (test: active, blocked, limited, merged, removed, and policy-outage cases).

## 2. Relationship Claims

- [ ] 2.1 Implement the seven canonical directional relationship types, approximate period, duration, first-hand attestation, draft/submitted/accepted/rejected/revoked transitions, and literal invalid/empty states (test: complete type and transition matrix).
- [ ] 2.2 Enforce one active Review per Account, Profile, and continuous/overlapping relationship period, including role-change updates and moderated materially distinct later engagements (test: overlap, relabeling, date manipulation, and work-together-again fixtures).
- [ ] 2.3 Add `Self-attested` and `Relationship verified` evidence states with minimized private intake, redaction, qualified methods, 90-day raw-evidence expiry, and no story-truth implication (test: evidence sufficiency and public leakage matrix).
- [ ] 2.4 Add self-review, duplicate, coercion, retaliation, block, removed-Profile, and unavailable-policy controls without revealing private identity or block direction (test: adversarial Account/Profile combinations).

## 3. Review testimony and attribution

- [ ] 3.1 Implement the three bounded story prompts, required concrete first-hand basis, attestation, and rules for hearsay, diagnoses, confidential material, private data, protected-class commentary, harassment, and unsupported criminal allegations (test: policy fixture corpus).
- [ ] 3.2 Add named Public Byline and isolated `Anonymous reviewer` projections across canonical pages, structured data, events, logs, exports, moderation, and future hook fixtures (test: identifier and timing leakage suite).
- [ ] 3.3 Implement irreversible anonymous publication and one-way named-to-anonymous conversion with explicit screenshot/export/Share Clip warning and append-only attribution history (test: every conversion and Account-recovery case).

## 4. Assessment

- [ ] 4.1 Implement versioned canonical prompts and behavioral anchors for LARP, Domain Expertise, On Time, Taste, GTM, Charisma, and Run it back, including visible LARP direction (test: label, direction, and version snapshots).
- [ ] 4.2 Add relationship/exposure-aware Taste and GTM presentation, `Not enough exposure` for every capability score, required Run it back, and no default or composite score (test: founder, investor, operator, report, manager, peer, and external-collaborator journeys).
- [ ] 4.3 Require a concrete story basis for endpoint answers while allowing confidential support to remain restricted (test: incomplete, unsupported-extreme, and valid bounded-testimony cases).

## 5. Revisions, moderation, and subject rights

- [ ] 5.1 Implement Review visibility states, immutable numbered revisions, edited indicators, pending-material-edit behavior, and independent Moderation Case links (test: full state/revision/dispute transition model).
- [ ] 5.2 Add launch pre-publication Review moderation, changes-required flow, scoped limitation, removal, plain notices, 30-day appeals, report grouping, and integrity holds for suspicious identity or attribution changes (test: outcome and appeal cross-product).
- [ ] 5.3 Notify a verified Profile claimant only after publication and add one separately moderated, versioned Profile Subject Response plus correction/dispute paths without Review edit or author-reveal authority (test: claimed, unclaimed, revoked-claim, anonymous, and subject-pressure cases).
- [ ] 5.4 Add immediate author withdrawal, moderated restoration, Account-deletion treatment (`Former member` or retained anonymous attribution), and profile merge/removal consequences (test: lifecycle cross-product and generic tombstones).

## 6. Exhibits

- [ ] 6.1 Add zero-to-four static image Exhibits with preview, order, captions, provenance/rights attestation, safe decode, metadata stripping, re-encoding, fixed derivatives, and text-only fallback (test: format, corruption, metadata, and limit fixtures).
- [ ] 6.2 Add privacy/OCR preflight, redaction, confidential and non-consensual media rules, reviewer-supplied labeling, separate Exhibit reports, and scoped Exhibit hiding (test: PII, location, credential, financial, health, intimate, copyright, and trade-secret fixtures).
- [ ] 6.3 Enforce public-derivative and restricted-original retention, withdrawal/removal cleanup, case/legal-hold exceptions, and no Relationship Claim verification side effect (test: time-controlled media-retention matrix).

## 7. Abuse, verification, and close-out

- [ ] 7.1 Add anti-brigading and retaliation signals for linked submissions and reports, neutral solicitation hooks, duplicate-safe cases, and controls that do not use negativity or raw report volume as proof (test: coordinated positive/negative and false-report campaigns).
- [ ] 7.2 Run unit, integration, authorization, privacy, accessibility, image-security, structured-data, and browser tests for signed-out, empty, invalid, named, anonymous, blocked, changes-required, disputed, limited, withdrawn, removed, deleted-Account, merged/removed-Profile, and provider-outage states.
- [ ] 7.3 Complete privacy, threat-model, moderator-runbook, evidence-handling, anonymous-speaker-request, urgent-media-removal, and specialist legal review of defamation, privacy, anti-SLAPP, Section 230, employment/trade-secret speech, copyright, notice, retention, insurance, and jurisdiction-specific policy before launch.
