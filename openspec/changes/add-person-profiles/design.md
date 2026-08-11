## Context

Profiles may be proposed by someone other than their subject, remain useful while unclaimed, and later accumulate records from other capabilities. The implementation must preserve a canonical person reference through corrections and duplicate merges while exposing only name, photo, and derived public states. This change extends the foundation's private identity, Profile Claim, policy, moderation, and audit seams without selecting vendors.

## Decisions and rationale

### Eligibility is professional participation, not fame

At launch, a Profile represents one individually identifiable, living adult whose work as a founder, investor, VC, operator, employee, advisor, board member, accelerator participant, or material professional collaborator is publicly corroborated or privately substantiated. A following, press coverage, or claimed Account is unnecessary. Minors, deceased people, fictional people, organizations, teams, people connected only socially, and people whose startup connection is merely aspirational are ineligible. This admits the real working graph while preventing the directory from becoming a general-purpose real-person listing system.

The proposer supplies a private eligibility category and corroborating reference or evidence. Those inputs support moderation and duplicate detection; they never become extra public Profile fields. No Profile publishes before review.

### Minimal public identity does not mean minimal accountability data

| Class | Data | Visibility |
|---|---|---|
| Authored Profile identity | canonical professional name, approved photo | Public while the Profile is published |
| Public system state | opaque Profile identifier, claimed/unclaimed state, canonical URL | Public |
| Restricted registry metadata | proposer Account, eligibility category/evidence, photo provenance, moderation history, duplicate features, prior accepted values | Authorized policy and moderation roles only |

The canonical name is the name the subject currently uses professionally, not necessarily a legal name. The system does not publish former names by default, infer aliases, or turn a Public Byline into a Profile.

### A photo needs redistribution authority, not mere public availability

A photo is publishable only when it was supplied by the subject, supplied with permission from the subject and rights holder, or made available under terms that permit the platform's redistribution. A public URL alone is insufficient provenance. The platform stores a processed copy rather than hotlinking, strips metadata, and retains only the minimum source/license facts needed to administer the use. Creation requires a candidate photo, but a neutral system placeholder replaces an image that must be hidden or removed until a compliant replacement is approved; retaining a disputed likeness is not a condition of retaining an otherwise eligible Profile.

### Claiming grants agency, not ownership of the record

The Profile registry consumes only the foundation's derived `verified` Profile Claim state. A verified claimant's supported self-identification is preferred for name and photo corrections, but every change still passes impersonation, rights, and safety checks. Claim revocation removes owner controls without altering the Profile's independent lifecycle. A claimant cannot delete the Profile or later associated records merely because they are negative or unwanted.

Any active Account may propose a correction or dispute. The current public value remains while an ordinary request is reviewed; a credible wrong-person, privacy, copyright, or safety report may hide a photo or limit the Profile immediately under the foundation's scoped-enforcement contract. Affected Accounts receive a reason and appeal path without receiving reporter or evidence identities.

### Canonical identity survives name changes and reversible merges

Each Profile receives an opaque, nonsemantic identifier. Its canonical route is `/profiles/<id>/<current-slug>`; the slug is readability-only. A stale slug redirects to the same identifier. Search indexes only canonical published routes.

Duplicate selection prioritizes verified subject control and validated identity accuracy, then the earliest eligible published record as a tie-breaker. Popularity, review sentiment, and creator status never choose the survivor. A conflict between verified claims pauses the merge for confidential claim review. A completed merge redirects every source route to the canonical target and moves eligible Profile associations by stable identifier without rewriting the associated objects. Merge lineage is append-only so an erroneous merge can be reversed.

### Removal is not Account deletion

Profile states are independent of Account and Profile Claim states:

| State | Public behavior |
|---|---|
| `pending` | Visible only to the proposer and authorized staff; not searchable or indexable |
| `published` | Public canonical page and eligible for search |
| `limited` | Available only to the audience or route allowed by the scoped enforcement decision; excluded from ordinary search when required |
| `merged` | Source route redirects to its canonical Profile |
| `removed` | Excluded from search and indexing; route returns a generic unavailable result |

Account deletion or claim revocation does not remove an independent Profile. Removal is available for ineligibility, wrong-person records, confirmed death under the launch policy, substantiated privacy or personal-safety grounds, rights violations that cannot be cured, or required legal action. Public name/photo data are erased or minimized after the applicable appeal window. A restricted, expiring tombstone may retain only the identifiers, decision, merge lineage, and minimum anti-recreation fingerprint permitted by the foundation retention classes; it never exposes the removal reason.

## Deep module seams

The **Profile registry module** owns proposal, correction, lifecycle, merge, reversal, and canonical resolution behind one interface. Callers supply actor, intended operation, candidate identity, and evidence reference; they receive the resulting public projection or a literal unmet requirement. They do not interpret claim, moderation, or merge tables.

The **Profile search module** owns normalization, policy filtering, duplicate candidates, canonicalization, and search-before-create eligibility. It returns only public projections and a separate safe creation disposition. If its authoritative duplicate or policy checks are unavailable, creation fails closed rather than bypassing search.

The **profile-photo module** owns provenance validation, safe processing, metadata removal, derived sizes, and removal. Production storage and an in-memory test adapter sit behind its interface; public callers never receive the original upload, provenance evidence, or source URL.

## Operational and legal boundary

The launch directory is intentionally searchable and indexable once a Profile is approved. Rate limits, no bulk-export interface, and abuse monitoring reduce enumeration but cannot promise that public pages are unscrapable. Raw search queries are purpose-limited operational data, not social-graph input, and must receive a documented short retention period before collection.

Before launch, specialist counsel must review the eligible-person policy, third-party-created profile notices, photo copyright/publicity/privacy rules, subject correction and removal rights, search-engine deindexing, retention fingerprints, and jurisdiction-specific response procedures. These gates may narrow policy but do not permit implementing an undefined catch-all retention or photo-use rule.
