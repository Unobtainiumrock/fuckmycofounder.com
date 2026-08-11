## Why

Individual Reviews describe one relationship, but a Profile needs a careful way to show the pattern across eligible experiences. Raw averages, tiny subgroup cells, and one universal score would overstate self-selected evidence, invite manipulation, and make anonymous reviewers easier to isolate.

## What Changes

- Add a derived Profile Aggregate sourced only from current, published Reviews with accepted Relationship Claims and eligible Assessments.
- Require five distinct eligible reviewers for each displayed aggregate field; exclude **Not enough exposure** and count at most one current Assessment per Account and Profile.
- Show ordinal answer distributions, coverage, relationship mix, evidence-state context, and conditional categorical medians rather than decimal means or a universal Founder Score.
- Label five-to-nine-answer fields **Early signal**, disclose concentrated relationship perspectives, and suppress unsafe subgroup or residual cells.
- Give named and anonymous Reviews identical eligibility without exposing attribution-mode counts, filters, or joinable author clues.
- Invalidate summaries on revisions, withdrawals, limitations, removals, claim changes, merges, and integrity holds; fail closed when current eligibility cannot be proven.

Explicitly out: Profile leaderboards, percentiles, predictions, Feed ranking, reactions, sharing, social features, and changes to the Review Assessment vocabulary.

## Impact

- Adds the `profile-aggregation` capability and consumes Profiles, Relationship Claims, Reviews, Review Assessments, and trust-safety policy.
- Affects Profile summary projections, aggregation policy, cache invalidation, moderation/integrity hooks, methodology copy, and privacy tests.
- Main risks are sparse-cell inference, selection bias, coordinated Reviews, stale removed values, ordinal scales treated as interval data, and relationship strata being mistaken for a universal judgment.
