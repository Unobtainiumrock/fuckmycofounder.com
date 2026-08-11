## Why

Profiles are the product's canonical people directory, but the current product has no contract for who may be listed, how an Account proposes a record for someone else, or how identity mistakes are corrected without turning a claim into unilateral ownership. Because Profiles identify real people, search, photo provenance, duplicate handling, correction, removal, and abuse states must be defined before Reviews can attach to them.

## What Changes

- Add public Profiles for individually identifiable, living adults with substantiated professional participation in the startup ecosystem.
- Keep public authored identity to name and profile photo while retaining eligibility, provenance, creator, lifecycle, claim, moderation, and deduplication data as private or system metadata.
- Make name search public and Account-free; require search-before-create and an active Account only when someone submits **Add this person**.
- Moderate every proposed Profile before publication and define pending, published, limited, merged, and removed behavior.
- Accept only subject-provided, permission-backed, or redistribution-licensed photos; remove metadata, avoid hotlinking, and replace disputed or withdrawn photos with a neutral placeholder when needed.
- Add correction, eligibility dispute, photo-removal, duplicate-merge, merge-reversal, and Profile-removal flows with notices, appeals, and append-only history.
- Give each published Profile a stable opaque canonical URL; redirect duplicate and stale-slug URLs without exposing merge or moderation evidence.
- Reuse the foundation's Profile Claim, policy, report, moderation, block, retention, and audit contracts.

Explicitly out: Reviews and assessment data, profile aggregates, Posts, Feed ranking, social graph, messaging, Share Clips, and Open To.

## Impact

- Adds capability specs `profiles` and `profile-search`; depends on `accounts` and `trust-safety` from `add-account-identity-and-safety-foundation`.
- Introduces a durable Profile registry, public search projection, moderated image pipeline, canonical-resolution/merge seam, and search indexing controls.
- Primary risks are listing ineligible private people, wrong-person photos, impersonation, duplicate histories, blocked-person discovery, public removal leakage, and accidental expansion of the Profile beyond name and photo. Public-person, image-rights, deindexing, and removal policy copy requires specialist legal review before launch.
