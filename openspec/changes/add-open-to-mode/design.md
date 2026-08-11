## Scope and launch posture

Open To is a later, default-disabled capability, not part of the reputation product's first-release gate. A controlled cohort may enable it only after the launch gates below pass. The domain's profanity does not make availability public or turn an availability signal into consent.

The exact launch intentions are **Hook up**, **Date**, and **Relationship**. **DTF**, **Down to fuck**, and **Looking for sex** are rejected as status labels: they collapse intention into sexual consent and are more dangerous when screenshotted. **Date** remains distinct from **Relationship** because openness to meeting and seeking commitment are different signals.

## Account-owned status and adult eligibility

An Open To Status belongs to an Account. Its only person-facing projection uses that Account's current verified Profile Claim and the claimed Profile's current name and photo. It is not a mutable field of the public Profile and requires no separate Public Byline.

Activation requires an active Account, verified contact, recent authentication, one current verified Profile Claim to a published adult Profile, current policy eligibility, and a nonpublic adult-eligibility assertion appropriate to the launch jurisdiction. Profile eligibility and claim verification are not substitutes for checking the Account holder's age.

The age-assurance seam returns only `18+`, `under-18`, or `unable-to-establish`, plus restricted provider, method/version, checked-at, and expiry audit facts. Callers never receive exact age, birth date, document, biometric source, address, or confidence score. Source material cannot be repurposed for identity, Profiles, ads, ranking, location, analytics, or risk enrichment. Wrong results have an accessible alternative and review path. `under-18`, indeterminate, expired, or unavailable results fail closed.

## Fixed window with immediate withdrawal

Activation creates a fixed window from `activated-at` through `activated-at + 14 days`. The participant sees the expiry before final confirmation. Status lifecycle is `active`, `left`, `expired`, or `ended`; policy or dependency outages temporarily suppress projection without extending the window.

- A participant may remove or add intentions and separately disable introductions without changing expiry.
- Removing the last intention is Leave Open To.
- Leave makes the status invisible immediately and closes pending Open To requests.
- Leave does not permit another activation until the original expiry. This preserves the anti-flip intent of a two-week window without withholding withdrawal.
- Expiry is automatic. Reactivation after expiry requires a fresh age/policy check, intention selection, disclosure, and explicit confirmation.

The probe exercised mutual visibility, missing context, Block, immediate leave, expiry, intention changes, and independent request consent. It confirmed that status lifecycle, per-pair visibility, and request permission must be separate states.

## Contextual mutual visibility, not dating discovery

There is no active-participant directory. Open To decorates only an ordinary Profile candidate already returned through signed-in Profile search, a canonical Profile route or independently known canonical link, or private Follow activity. It never creates or changes the candidate, ordering, rank, recommendation, or eligibility of that surface.

The projection appears only when viewer and subject both have current eligible active statuses and no Block or policy rule suppresses the pair. It contains current Profile name/photo, selected intentions, and—only if separately enabled—the Message entry. It does not expose activation time, exact expiry, age result, claim method, request setting history, Profile or Review scores, rejection history, view history, or other participants. Feed items, Reviews, Posts, Comments, Share Clips, external metadata, signed-out routes, ordinary notifications, exports, and anonymous-author surfaces never carry it.

## Messaging and consent

Activation does not enable requests. **Let people in Open To send me an introduction** is a second, default-off control that can be disabled immediately. When both statuses and this setting remain eligible, a sender may use their verified claimed Profile as Message Identity and submit one link-free, text-only request with purpose **Open To** through the existing Message Request policy. All pair and Account quotas, decline, expiry, Block, report, retention, and attention-privacy rules remain.

Leaving or disabling introductions removes the entry and generically closes pending Open To requests. An accepted request creates ordinary DM permission; later status expiry does not close it. A Block still closes it immediately. Status means openness to an introduction only—not consent to sexual language, off-platform contact, a meeting, touch, sex, or any continuing interaction.

## Safety, privacy, and reputation isolation

Open To collects no location, distance, gender target, orientation, preference, Like, Match, availability schedule, or media. There are no peer status/expiry notifications and no external email or push reminders at launch. The owner sees an in-product receipt and expiry; required security and moderation notices remain.

Every contextual projection and request exposes Block and Report. Reports include underage use, impersonation, unwanted sexual conduct, coercion or power abuse, stalking, threats, doxxing, outing, intimate-image abuse, trafficking, off-platform harm, and retaliation. Reports remain possible after status or Profile access ends. A rejection, decline, withdrawal, screenshot, or status never establishes a professional Relationship Claim or Review basis, and Open To data never affects Feed, Profile Aggregates, Review moderation, votes, awards, or recommendations.

Participants receive clear copy that screenshots and external copies cannot be prevented or recalled. Withdrawal controls future platform projection only. Ordinary closed intentions and settings are erased or irreversibly minimized within 30 days; proportionate reported evidence follows the foundation safety class and legal holds.

## Deep module seams

The **Open To policy module** owns activation eligibility, fixed-window transitions, contextual mutual projection, introduction consent, pair Blocks, and safe outcomes behind one interface. Callers supply actor, encountered canonical Profile, ordinary-surface context, intended action, and policy context; they receive only an authorized projection or generic denial, never raw Account, age, Block, claim, report, or status records.

The age-assurance provider is an adapter behind the adult-eligibility seam. The existing messaging policy module remains authoritative for requests and DMs; Open To supplies only its scoped entry context and claimed-Profile Message Identity. Centralized trust-safety and notification policy remain authoritative rather than being reimplemented.

## Launch gates

Before any cohort enablement: choose launch jurisdictions; obtain specialist privacy, child-safety, sexual-safety, and platform counsel; complete privacy/child-safety impact assessments; contract and test the age-assurance adapter for accuracy, bias, accessibility, alternatives, security, and deletion; staff underage and sexual-harm escalation; run closed abuse tests for outing, coercion, stalking, compromised Accounts, retaliation, anonymous linkage, and screenshots; prove retention deletion and deployed non-leakage across APIs, caches, logs, analytics, metadata, notifications, and exports. Repository validation alone is not launch approval.
