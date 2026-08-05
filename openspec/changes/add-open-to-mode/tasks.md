## 1. Disabled tracer slice

- [ ] 1.1 Add a default-off Open To capability gate and one end-to-end fixture that activates an eligible claimed-Profile Account, decorates an ordinary Profile view for another active participant, and leaves immediately (test: activation-to-withdrawal tracer).
- [ ] 1.2 Return generic unavailable behavior while the feature, policy, claim, age, or Block dependency is unavailable without leaking which prerequisite failed (test: dependency-failure matrix).

## 2. Adult eligibility and activation

- [ ] 2.1 Add the purpose-limited adult-eligibility adapter and restricted `18+` assertion projection without persisting source documents, biometrics, exact age, or birth date (test: provider result and data-contract fixtures).
- [ ] 2.2 Require active Account, verified contact, recent authentication, verified Profile Claim, published Profile, valid 18+ assertion, and policy approval (test: eligibility truth table).
- [ ] 2.3 Add accessible unable-to-establish and challenge paths, provider outage behavior, assertion expiry, and underage escalation (test: indeterminate, false-result, expiry, and outage cases).
- [ ] 2.4 Present intentions, contextual mutual audience, fixed expiry, screenshot limits, conduct rule, and separate introduction consent before explicit activation (test: disclosure and accessibility snapshots).

## 3. Fixed lifecycle

- [ ] 3.1 Enforce `active`, `left`, `expired`, and `ended` transitions with exactly one non-extendable 14-day window (test: transition table and boundary clock).
- [ ] 3.2 Apply intention additions/removals without extending expiry; treat no intentions as Leave; permit immediate Leave while holding reactivation until original expiry (test: edit, leave, cooldown, and concurrency cases).
- [ ] 3.3 End or suppress projection immediately on Account, claim, Profile, age, policy, deletion, or capability-gate ineligibility without stale-cache grace (test: revocation propagation).

## 4. Contextual mutual projection

- [ ] 4.1 Decorate only ordinary Profile search, canonical Profile, and private Follow candidates after both statuses and pair policy pass, without changing candidate generation or ordering (test: contextual-visibility matrix).
- [ ] 4.2 Exclude Open To from dedicated browse/search/filter/rank/recommendation pools and from Feed, content, sharing, metadata, indexing, exports, analytics, and signed-out projections (test: surface non-leakage suite).
- [ ] 4.3 Preserve anonymous-author isolation and comparable outcomes across inactive, left, expired, blocked, removed, and nonexistent targets (test: cross-object and timing probes).

## 5. Introduction consent and messaging

- [ ] 5.1 Add the default-off **Let people in Open To send me an introduction** control and remove its entry immediately when disabled or status eligibility ends (test: consent transitions).
- [ ] 5.2 Submit **Open To** requests through the existing Message Request lifecycle using the sender's verified claimed Profile Message Identity and every existing quota/content/safety rule (test: request-policy integration).
- [ ] 5.3 Close pending Open To requests generically on Leave, expiry, disabled consent, Block, or ineligibility while preserving accepted DM permission until an existing DM rule closes it (test: request/DM cross-state table).

## 6. Safety, reporting, and isolation

- [ ] 6.1 Add confidential reports for underage use, coercion, sexual harassment, stalking, threats, doxxing, outing, intimate-image abuse, trafficking, off-platform harm, and retaliation, including a route after ordinary access ends (test: report-reason and lost-access matrix).
- [ ] 6.2 Apply Block before status projection, request entry, pending request, DM, notification, and analytics without revealing direction or resurrecting prior state after unblock (test: Block propagation).
- [ ] 6.3 Prohibit sexual media, location, target preferences, and Open To-derived Relationship Claims, Reviews, Feed/aggregate/ranking signals, or peer notifications (test: capability-boundary contract).

## 7. Retention and launch acceptance

- [ ] 7.1 Delete or irreversibly minimize ordinary closed status intentions/settings within 30 days while retaining only proportionate reported evidence under foundation holds (test: retention clock and hold fixtures).
- [ ] 7.2 Give only the owner an in-product activation/expiry receipt; keep status and intentions out of email, push, lock-screen copy, adapter payloads, logs, and analytics (test: recipient/payload audit).
- [ ] 7.3 Complete jurisdiction/counsel review, impact assessments, provider diligence, moderation runbooks, closed-cohort abuse tests, deletion proof, and deployed non-leakage acceptance before changing the default-off gate (evidence: signed launch checklist; no repository test may waive it).
