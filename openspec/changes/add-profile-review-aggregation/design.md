## Context

A Profile Aggregate is derived public state, never authored Profile identity. It consumes the current public Profile, Review, Relationship Claim, Assessment, and trust-safety decisions. It does not change those source objects or choose a database, queue, analytics, or cache vendor.

## Decisions and rationale

### Each field earns its own release

A public field requires five distinct eligible reviewer Accounts. A Review contributes only while its current approved revision is `published`, its Relationship Claim is `accepted`, the Profile is public, the Assessment version is supported, and no scoped integrity decision withholds it. **Not enough exposure** is a non-observation. The most recent eligible Review per Account and Profile supplies at most one answer per metric, even when a later material engagement legitimately produced another Review.

Five is a conservative launch disclosure floor, not evidence that reviewers are representative. Fields with five through nine answers are labeled **Early signal**. The threshold changes only through a versioned policy and privacy/abuse review.

### Ordinal evidence stays ordinal

LARP, Domain Expertise, On Time, Taste, GTM, and Charisma show their five canonical response-position distribution, eligible `n`, coverage against eligible reviewers, and a categorical median when the relationship evidence is not concentrated. LARP always retains **Legit ↔ LARP** direction. Run it back shows only its three named answer categories and denominator. Decimal means, stars, sums, percentiles, comparisons, predictions, and a universal Founder Score are prohibited.

The median is secondary to the distribution because the same middle category can hide polarization. It is withheld when fewer than two coarse relationship groups contribute, the second-largest group has fewer than two reviewers, or one group supplies more than 80% of answers. That state says **Concentrated perspective** and names the dominant coarse group without inventing equal weights.

### Context is visible without becoming a reidentification tool

Public relationship groups are cofounders/partners, reporting relationships, peers/teammates, investor/advisor relationships, and clients/vendors/external partners. A group-specific distribution requires five distinct eligible reviewers in that group. Verification-specific distributions have the same threshold. `Self-attested` and `Relationship verified` answers otherwise count equally because verification supports relationship context, not testimony truth; the interface states this explicitly.

No public aggregate groups or filters by named versus anonymous attribution, exact or coarse year, organization, project, author, or combinations of relationship and verification. Every public surface applies primary and complementary suppression: if a displayed total or neighboring cell would reveal a cell below five by subtraction, exact counts and proportions are withheld or the categories are honestly pooled. Suppression applies to pages, public interfaces, metadata, exports, notifications, and later sharing surfaces.

### One versioned projection owns eligibility and release

The **Profile Aggregate policy module** is a deep module behind one interface. Given a canonical Profile identifier, authoritative source-set version, and optional permitted single breakdown, it returns an `available`, `not-enough-reviews`, `not-enough-exposure`, `concentrated-perspective`, `updating`, `removed`, or `unavailable` public projection. Callers cannot request arbitrary cells or raw anonymous, Account, exact-time, evidence, integrity, or moderation data.

The projection records aggregation-policy, Assessment-scale, and source-set versions. Publication, approved revision, withdrawal, limitation, removal, claim acceptance/revocation/verification, integrity hold, Profile merge, and Profile removal advance the authoritative source-set version. Subtractive or safety transitions invalidate the old projection before the source change becomes publicly observable. A cache is served only when its source-set version is current; otherwise the surface shows a literal updating or temporarily unavailable state rather than stale values.

## Logic-prototype findings

The time-boxed state probe exercised 4+1 versus 3+2 relationship mixes, metric-level **Not enough exposure**, anonymous attribution, repeat engagements, and a limited Review. It confirmed that thresholding must happen after current-state filtering and Account/Profile deduplication, that every metric needs its own denominator, and that attribution mode is irrelevant to eligibility but unsafe as a public grouping key.

## Research basis

The primary-source note in `docs/research/profile-review-aggregation-evidence.md` supports per-cell suppression, complementary suppression, low-volume caveats, ordinal distributions and categorical medians, integrity eligibility, and a versioned server-side projection. These are conservative product decisions, not a legal safe harbor or proof of statistical confidence.

## Explicit exclusions

No Profile ranking, leaderboard, percentile, winner badge, trend comparison, Feed signal, reaction signal, share artifact, social graph, or universal assessment is introduced. Real-person leaderboard work requires a separate proposal and substantially stronger statistical, privacy, integrity, and legal review.
