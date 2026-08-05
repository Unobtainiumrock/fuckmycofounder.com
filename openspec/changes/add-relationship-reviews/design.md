## Context

This change attaches first-hand, Account-backed testimony to public Profiles. It consumes the foundation's private identity, Public Byline, anonymous-attribution, policy, report, Moderation Case, appeal, audit, and retention contracts and the Profile registry's stable canonical identity. It does not select storage, authentication, moderation-vendor, or image-scanning vendors.

## Decisions and rationale

### Acceptance and verification answer different questions

A Relationship Claim must be accepted before its Review may publish. Acceptance means the claim is complete, internally plausible, first-hand, nonduplicative, and has passed launch moderation and abuse checks; it does not mean the platform has proven the relationship. The public evidence state is separately either **Self-attested** or **Relationship verified**.

Verification requires independent support for the two people's professional relationship, direction, and approximate period. A mutual confirmation, authoritative public role record, or minimized private professional record may qualify after review. A shared email domain, matching name, image, contact-list edge, or the subject's silence does not. The Profile subject cannot veto acceptance by refusing confirmation. Verification says nothing about whether the story, assessment, or conclusion is true.

Public Review context is the directional relationship label, a coarse duration bucket, and verification state. Exact dates, employer or project context, evidence, verification method, reviewer Account, risk signals, and moderator notes remain restricted. The author may opt into a moderator-approved coarse year range, but anonymous publication never exposes exact dates, organization, project, or evidence.

### One continuous relationship produces one active Review

At launch, uniqueness is reviewer Account + Profile + one continuous relationship period. Overlapping dates, a role change inside the same continuing engagement, or relabeling the same work update the existing Relationship Claim and Review. A later, non-overlapping material engagement may support another Review only after moderation establishes that it is not duplicate or enforcement evasion. This preserves legitimate "worked together again" context without manufacturing extra votes from one experience.

### The scorecard has one vocabulary and exposure-aware depth

The canonical pool is **LARP**, **Domain Expertise**, **On Time**, **Taste**, **GTM**, **Charisma**, and **Run it back**. **On Time** is the exact label; **Timeliness** is not. Every Review asks Run it back and offers LARP, Domain Expertise, On Time, and Charisma. Taste and GTM appear when relationship and exposure selections indicate the reviewer observed product, brand, strategic, commercial, sales, fundraising, or distribution work. Every scored dimension offers **Not enough exposure**; the interface never forces a guess to complete the form.

Relationship type and observed-work flags may change helper examples, never the meaning or direction of a metric. This works across founders, investors, and operators without making a minimal Profile carry a role taxonomy or pretending every reviewer observed every capability. Run it back remains a separate counterfactual, not a calculated rollup. No dimensions are summed into a Founder Score.

### Attribution becomes safer, never more revealing

Before first publication, an author chooses named attribution through their Public Byline or **Anonymous reviewer** through the foundation's isolation seam. Once public, an anonymous Review cannot become named at launch. A named Review may step down once to anonymous after an explicit warning that screenshots, exports, notifications, and downloaded Share Clips cannot be recalled; the change then becomes irreversible. This monotonic rule handles retaliation risk without making identity exposure a toggle that coercion or Account takeover can flip.

Every public projection, notice, export, analytics event, canonical route, later Comment hook, and moderator view must obtain attribution through the dedicated projection seam. The Profile subject receives no pre-publication copy and no author-identifying timing signal. A verified claimant is notified when the Review publishes, not before, so they can respond or dispute without gaining an advance pressure window.

### Review state, revisions, and disputes are orthogonal

| Model | Values | Key rule |
|---|---|---|
| Review visibility state | `draft`, `submitted`, `changes required`, `published`, `withdrawn`, `limited`, `removed` | Only `published` is ordinarily public. |
| Revision | immutable numbered versions with author, time, attribution choice, reason, and moderation outcome | `edited` is an event, not a state; material edits never replace public text before approval. |
| Dispute | open or resolved Moderation Case linkage | `disputed` is case context, not an automatic public badge or takedown. |
| Relationship Claim | `draft`, `submitted`, `accepted`, `rejected`, `revoked` plus self-attested/verified evidence state | Only accepted claims can support publication. |

All launch submissions and material revisions pass moderation. A safe material revision can remain pending while the prior approved version stays public; a credible urgent risk can limit the Review or Exhibit immediately. Reports do not change visibility from volume alone. Withdrawal is author-controlled and immediate on public surfaces, but restricted evidence and audit history follow the foundation's retention and hold rules.

### The subject may answer, not edit the file

A verified Profile claimant may file one active, clearly labeled **Profile Subject Response** attached to a published Review. It is separately Account-backed, attributable to the claimed Profile, moderated under the same conduct rules, and versioned. The subject may also identify a factual correction or policy dispute. They cannot edit the Review, force a score change, learn the anonymous author, withhold publication, or remove compliant criticism. A correction accepted by the author becomes a moderated Review Revision; a platform-required correction uses scoped enforcement and appeal.

### Exhibits illustrate testimony but do not certify it

A Review may contain up to four optional images. The Exhibit pipeline safely decodes input, strips metadata, creates platform derivatives, scans and lets the author redact private contact, location, financial, health, credential, and third-party data, captures a rights/provenance attestation, and routes risky images to review. Public derivatives remain part of the Review; originals and unredacted evidence are restricted and purpose-limited. An Exhibit never changes Relationship Claim verification or makes an allegation verified.

## Deep module seams

The **relationship-policy module** owns claim completeness, canonical directional type, overlap/uniqueness, evidence state, acceptance, revocation, and public context projection behind one interface. Callers provide actor, Profile, claimed period, context, and evidence references and receive an accepted/blocked/unmet-requirement result plus the safe projection; they do not interpret private evidence.

The **Review lifecycle module** owns submission, immutable revisions, allowed transitions, current approved projection, attribution-change monotonicity, withdrawal, subject-response attachment, and profile/claim consequences. Its interface returns a stable Review projection or literal unavailable state; callers do not patch current text or infer visibility from Moderation Case state.

The foundation's **attribution projection seam** remains the only route from private authorship to named or anonymous public output. The **Exhibit module** owns image intake, redaction state, derivatives, public eligibility, and removal. Production and deterministic test adapters sit behind these interfaces.

## Logic-prototype findings

Walking overlapping relationships, a manager-to-peer role change, a second engagement years later, named-to-anonymous conversion, attempted anonymous-to-named conversion, edits during a dispute, Relationship Claim revocation, Profile merge/removal, Account deletion, blocked participants, and Exhibit-only limitation exposed four constraints: uniqueness belongs to the continuous relationship rather than the selected label; attribution may only become less revealing; revisions and disputes cannot be Review states; and Relationship Claim revocation must fail closed by limiting the Review without destructively rewriting its last approved revision.

## Operational and legal boundary

Named Reviews remain named through a live Public Byline. When an Account deletion finalizes, an otherwise compliant named Review becomes **Former member** with no interactive Account, photo, or Profile link; an anonymous Review stays **Anonymous reviewer**. Drafts and unpublished submissions expire under the deletion schedule. Authors can withdraw a published Review before deletion, and the deletion flow must state these consequences.

Raw Relationship Claim evidence expires within 90 days of a final verification decision unless an appeal or legal hold applies. Public Exhibit derivatives remain while the Review is eligible; restricted originals expire within 90 days of final media moderation and are removed sooner after withdrawal where no case or hold needs them. Minimum decision, enforcement, revision, and anonymous-accountability records follow the foundation's up-to-24-month safety class rather than becoming indefinite evidence storage.

Pre-launch counsel must review defamation and opinion/fact policy, first-hand and criminal-allegation rules, anonymous process and valid legal requests, subject notice and response, evidence and Exhibit retention, copyright/privacy/publicity, subpoenas, and jurisdiction-specific removal and appeal procedures. The platform must not market acceptance, verification, or moderation as proof that a Review is true.

## Explicit exclusions

Comments, Review Votes, Verdict Votes, Awards, Profile aggregates, Feed ranking, notifications beyond stable event hooks, Share Clips, Direct Messages, and Posts remain for later changes. A Profile Subject Response is the single review-owned right of reply, not an ordinary Comment system.
