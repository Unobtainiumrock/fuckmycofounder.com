# Feed ranking, voting, and awards

Researched: 2026-08-04

## Question

What should fuckmycofounder.com borrow from X, Rate My Professors, Reddit, and
Yik Yak for a Profile-linked Review feed with votes and one non-stackable
weekly Award?

## Source findings

### X: borrow the system shape, not the model

X has published more than one generation of its recommendation system. The
current [`xai-org/x-algorithm`](https://github.com/xai-org/x-algorithm) release
describes two main candidate sources—followed accounts and global retrieval—
combined and ranked by a transformer that predicts engagement probabilities.
It also hydrates viewer and candidate context such as served history, mutual
follows, engagement counts, language, media, and brand-safety signals.

The older official
[`twitter/the-algorithm`](https://github.com/twitter/the-algorithm) release is
more useful as a legible architecture reference for a small product. Its
[Home Mixer overview](https://github.com/twitter/the-algorithm/blob/main/home-mixer/README.md)
separates candidate generation, feature hydration, scoring, filtering and
heuristics, mixing, serving, feedback, and observability. It explicitly names
author diversity, content balance, feedback fatigue, deduplication, seen-item
removal, and visibility filtering.

Inference: the reusable lesson is a staged recommendation pipeline with
multiple candidate pools, negative-feedback handling, and post-rank diversity.
Copying either generation's learned engagement objective would be unjustified
for a cold-start product and dangerous for reviews of identifiable people.

### Rate My Professors: usefulness stays tied to a specific experience

Rate My Professors' current product presents Helpful up/down votes on individual
ratings. Its [posting guidelines](https://www.ratemyprofessors.com/guidelines)
require first-hand course experience, limit a person to one rating per course,
discourage hearsay and dogpiling, and say every submitted rating is read by
moderators. The guidelines also encourage both pros and cons and forbid private
contact information and several categories of personal allegation.

Inference: ordinary votes should answer whether the Review is useful, not
whether the Profile subject is good or bad. Review eligibility and moderation
must do more anti-abuse work than the vote count.

### Yik Yak: low-friction judgment still needs Account enforcement

Yik Yak's [official FAQ](https://yikyak.com/faq) says an iPhone app is required
to post, comment, and vote, and that harassment, hate speech, inappropriate
posts, and multiple-account creation can lead to bans.

Inference: Yik Yak is useful as interaction inspiration—fast up/down judgment
and pseudonymous participation—but not as an algorithm to reproduce. The
platform still needs a private accountable identity behind each action.

### Reddit: assume vote and award manipulation will happen

Reddit's [community-disruption policy](https://support.reddithelp.com/hc/en-us/articles/360043066412-Disrupting-Communities)
specifically prohibits multi-account voting, automated vote manipulation, and
coordinated voting against a target. Reddit's current Awards documentation also
[treats an Award as visible recognition distinct from a vote](https://support.reddithelp.com/hc/en-us/articles/26465598697876-What-are-awards-and-how-do-I-use-them),
disallows self-awards, and removes eligibility when content is removed.

Inference: Review Votes and Review Awards need independent records, account and
risk controls, self-action prevention, coordination detection, and reversal
when a Review becomes ineligible. Reddit's paid, multi-award economy should not
be copied; it would weaken the intended scarcity of one weekly endorsement.

## Recommended launch model

### Interaction hierarchy

1. **Review Vote:** one replaceable upvote or downvote per Account, answering
   “Was this Review useful and worth seeing?”
2. **Review Award:** one scarce endorsement, consuming the Account's current
   Award Credit.
3. **Verdict Vote:** optional poll about the described situation. Remove this
   first if three judgment mechanisms are confusing.

An Account's Award Credit balance is capped at one. Each weekly refresh sets
the balance to one; it does not add one. Unused credit expires, multiple people
may Award the same Review, and a reviewer may not vote on or Award their own
Review. Do not sell Awards or add streaks at launch.

### Trending pipeline

Use a small, inspectable pipeline:

1. Gather fresh, trending, and exploration candidates.
2. Remove ineligible, blocked, removed, and already-seen duplicates.
3. Rank with freshness, confidence-adjusted Review Vote quality, a capped Award
   boost, meaningful discussion/read signals, relationship confidence, and
   report/hide/brigading penalties.
4. Limit repetition by Profile and author; preserve relationship diversity.
5. Log why candidates were included, excluded, and ordered.

Keep **Latest** strictly chronological. Do not introduce a learned **For you**
ranker until real behavior and explicit interests justify it. Media presence is
not a positive ranking feature by itself.

### Measurement

Publicly show net Review Vote score, Award count, comments, age, relationship
and verification state, exhibit count, and an optional Verdict distribution.
Internally measure impressions, unique viewers, expanded reads, dwell, Profile
opens, image opens, votes, Awards, comments, shares, reports, hides, moderation
actions, and suspected coordination. Do not show view counts at launch.

## Product conclusion

The combination works because each reference product contributes a different
layer: Rate My Professors supplies the durable Profile lookup, X the feed and
media grammar, Yik Yak the fast community response, and the weekly Award a new
scarce ritual. The concept fails if these are all reduced to engagement. For a
real-person review product, relevance is usefulness plus confidence, diversity,
and safety—not the reaction most likely to keep somebody scrolling.
