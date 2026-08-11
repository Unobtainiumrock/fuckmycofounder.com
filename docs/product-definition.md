# fuckmycofounder.com — Product Definition

Status: core product direction defined; ready to begin feature specifications,
with unresolved feature decisions listed below. This is the living source for
OpenSpec proposals, not an implementation specification.

## Product goal

Become the social network and professional reputation layer for founders,
investors, venture capitalists, operators, and people building or participating
in startups.

LinkedIn primarily records what people say about themselves. This product
combines three views of a startup person: the minimal Profile they can claim,
the named Posts they publish, and the first-hand Reviews filed by people who
worked with them. The useful question is not only **What have they done?**, but
**What are they like to build with, and would people run it back?**

## Product thesis

fuckmycofounder.com is a public directory and social network for people in the
startup ecosystem. Anyone can find or create a minimal Profile for a founder,
investor, operator, advisor, or other identifiable startup participant. People
who have actually worked with that person can file a Review, and named members
can publish ordinary Posts about startup life.

The product should feel like Rate My Professors escaped business school and got
access to a cap table: useful enough to inform a serious decision, mischievous
enough that founders want to read and share it.

Profiles remain the canonical people directory. Reviews belong to Profiles;
Posts belong to their named authors. Both can appear in the Feed without
becoming the same kind of content.

## Product principles

1. **Profiles first.** The app begins with people, not anonymous standalone
   stories. Every published Review belongs to one Profile.
2. **Tiny profile, rich history.** An unclaimed profile needs only a name and a
   photo. Its usefulness comes from the experiences attached to it.
3. **First-hand or it does not belong.** A reviewer must state a real working
   relationship with the Profile subject. Hearsay is not a Review.
4. **Rate the working experience, not the human soul.** Prompts and metrics ask
   about observable behavior inside a specific relationship.
5. **Rascal outside, rigorous underneath.** Public labels can be funny. The
   behaviors being measured and the moderation rules must remain clear.
6. **Browse before bureaucracy.** Reading, searching, and opening profiles do
   not require an account. Account creation appears only when an action needs
   identity or abuse prevention.
7. **The joke never obscures the action.** A user should never need to decode a
   punchline to understand what a button, rating, or moderation state means.

## Core domain

### Profile

A public record representing one individually identifiable, living adult with
substantiated professional participation in the startup ecosystem. The person
may or may not have an Account. The Profile's authored identity consists only
of a canonical professional name and profile photo; Reviews, Posts, role
context, and computed summaries are associated records rather than additional
required identity fields.

### Account

A lightweight sign-in identity used to take protected actions. An account is
not automatically a profile and does not require a username, biography, or
completed onboarding sequence.

### Profile Claim

The verified association between an account and the profile representing that
account holder. A claimed profile may receive messages if its owner opts in.

### Relationship Claim

A reviewer's statement describing how they directly worked with the Profile
subject, in what direction, and for approximately how long. It provides context
and must be accepted before a Review may publish. An accepted claim is publicly
**Self-attested** unless independent evidence supports the people, direction,
and approximate period, in which case it may show **Relationship verified**.
Neither state verifies the Review's testimony or scores.

### Review

One first-hand account of a working relationship with a Profile subject. A
Review contains relationship context, a structured assessment, a qualitative
account, and the reviewer's attestation. One Account may have one active Review
for the same Profile and continuous or overlapping relationship period; a
materially distinct later engagement requires moderation before it may support
another Review.

### Public Byline

The display name and optional photo an Account uses for named participation.
A Public Byline is required to publish a Post. It is not automatically a
Profile and does not make every Account discoverable in the Profiles
directory.

### Post

A named publication by an Account using its Public Byline. A Post may contain
text and media, but it has no Relationship Claim or Review Assessment and
cannot be used to rate a Profile subject.

### Comment

An Account-backed response attached to a Review, Post, or another Comment.
Comments add discussion; they do not alter the original Review Assessment or
become independent Feed items.

### Review Assessment

The structured startup-collaboration scores completed as part of a Review.
They describe capabilities the reviewer directly observed during one working
relationship rather than a permanent or objective quality of the Profile
subject.

### Feed

A ranked view of published Reviews and Posts. Opening a Feed item opens its
canonical object. The Feed ranks content, not people.

### Share Clip

A platform-rendered, link-backed visual excerpt of a Review, Profile, or
Comment. It preserves the source identity and context while making the object
easy to share outside the product.

### Open To Status

An Account-owned, self-declared signal describing whether its holder is open to
hooking up, dating, or a relationship during one fixed 14-day window. It is
projected only through the holder's verified claimed Profile when another
eligible active participant encounters that Profile in an ordinary product
context; it is never a public Profile field or inferred from behavior.

## Information architecture

The primary navigation is intentionally small:

- **Profiles** — search and discover startup people.
- **Feed** — read trending and recent Reviews and Posts.
- **Post** — publish a named update.
- **File a review** — search for a person, then begin the Review flow.
- **Me** — account, claimed profile, messages, drafts, and moderation status.

The default signed-out experience should foreground a people search and a live
slice of the feed. The product should be useful before it asks for an account.

## Profile discovery and creation

Profile creation starts with search. This reduces duplicates and makes the
existing directory feel like the main product.

1. Search by name.
2. Select the matching Profile, or choose **Add this person**.
3. Add a name and photo.
4. Privately identify how this adult substantively participated in the startup
   ecosystem and provide a corroborating reference or evidence.
5. Confirm the photo was supplied by the subject, supplied with subject and
   rights-holder permission, or licensed for redistribution. Public availability
   by itself is not permission.
6. Submit the Profile for duplicate and pre-publication moderation review, then
   continue to its status or approved page.

Duplicate resolution, profile correction, photo disputes, and merging are
required product flows even if they begin as manual operations.

At launch, eligible people include founders, investors, VCs, operators, startup
employees, advisors, board members, accelerator participants, and material
professional collaborators. Minors, deceased people, fictional people,
organizations, teams, purely personal acquaintances, incidental observers, and
people whose startup connection is only aspirational are out. Eligibility does
not require fame, a following, an Account, or a Profile Claim.

An accepted Profile photo is stored as a metadata-stripped platform derivative,
never hotlinked. A credible wrong-person, privacy, copyright, or personal-safety
dispute may replace it with a neutral placeholder while review continues.
Profile name/photo corrections and duplicate merges are reviewable and
reversible; a verified Profile Claim gives the subject priority in supported
self-identification but not unilateral control over Profile existence or
associated compliant content.

## Profile page

The Profile page is the canonical destination for a person. It contains:

- Name and profile photo.
- Claimed or unclaimed status.
- **Message** when the profile is claimed and messages are enabled.
- **File a review** as the primary action.
- **Claim this profile** when unclaimed.
- Review count and relationship mix.
- **Run it back?** summary once enough eligible reviews exist.
- Assessment summaries once enough eligible reviews exist.
- A chronological or relevance-ranked review ledger.
- Report, correction, and dispute actions.
- **Open to** status only when both the viewer and Profile owner are actively
  opted into the private mode.

An unclaimed profile remains useful. Claiming adds agency and communication; it
does not determine whether the profile or its compliant reviews may exist.

## Review flow

The review should feel like filing a short incident report, not completing an
employee-performance form.

### 1. Find the person

Search for and select a Profile. A missing Profile may be created inline with a
name and photo.

### 2. State the relationship

Relationship choices use complete directional sentences:

- We were cofounders or business partners.
- I reported to this person.
- This person reported to me.
- We were peers or teammates.
- I invested in or advised this person.
- This person invested in or advised me.
- We worked together as clients, vendors, or external partners.

The reviewer also supplies an approximate date range and relationship duration.
Company or project context may be collected privately without requiring it to
appear publicly. Public Review context uses the directional relationship, a
coarse duration, an optional moderator-approved coarse year range, and
**Self-attested** or **Relationship verified**. Exact dates, company or project
context, verification method, evidence, and Account linkage remain private.

Relationship evidence is optional. Verification may use a mutual confirmation,
an authoritative public professional record, or minimized private professional
records that establish the people, direction, and approximate period. A shared
email domain, matching name, social connection, or the subject's silence is not
enough, and an anonymous-intended Review must not use subject confirmation in a
way that reveals its author or submission timing. Raw verification evidence is
redacted, access-restricted, and normally deleted within 90 days of a final
decision unless an appeal or legal hold applies.

### 3. Score what you observed

The scorecard should reveal the shape of the person as a startup collaborator
rather than reproduce an HR competency review or collapse into a universal
"quality" number.
Its labels must come from language current tech people already use. Brand-
workshop inventions and forced animal metaphors are explicitly rejected.

Two accepted concepts anchor the scorecard: **LARP Score** and **Would you run
it back?** Three parallel current-language scans supplied the initial
capability set. Product discussion then replaced **Ships** with **On Time**,
replaced **Technical** with **Domain Expertise**, and accepted **Charisma**:

> **LARP · Domain Expertise · On Time · Taste · GTM · Charisma · Run it back**

| Label | Direct review question | Status |
|---|---|---|
| **LARP** | How much of their startup persona was backed by work or results you personally saw? | Accepted concept. Use **Legit ↔ LARP** or equally explicit anchors so direction is unmistakable. |
| **Domain Expertise** | Did they deeply understand the problem, users, industry, and constraints the company operated within? | Accepted, replacing the narrower **Technical**. Technical depth counts when it is part of the relevant domain. |
| **On Time** | Did they show up when expected, deliver when promised, and flag delays before they became surprises? | Accepted, replacing **Ships**. Use the plain label **On Time**, not **Timeliness**. |
| **Taste** | Did they know what was worth building, what to cut, and what good looked like? | Accepted when the relationship gave direct product, brand, or strategic exposure. |
| **GTM** | Could they find demand and turn it into customers or repeatable distribution? | Accepted when the relationship gave direct commercial exposure. Spell out **Go to market** in helper copy. |
| **Charisma** | Did they make people want to listen, believe, join, or move? | Accepted concept. This measures interpersonal pull, not whether the underlying claims were true. |
| **Run it back** | Knowing what you know now, would you choose to build or work closely with them again? | Accepted summary question. |

These labels are intentionally terse. The interface should not append **Score**
to every noun or wrap them in additional founder-themed metaphors.

**On Time** measures whether someone manages commitments reliably, not whether
they work quickly or never encounter delays. A founder can still rate well when
an external event changes a deadline if they surface the risk early, reset the
commitment clearly, and then meet it. The failure being measured is leaving
other people surprised or waiting.

**Technical**, **Ships**, **Agency**, **Velocity**, **Clock speed**, and
**Product sense** remain credible reserve terms. They are not in the current
set because they either overlap the selected dimensions, require unusually
long observation, or capture a different product priority than the current
review.

Every eventual score must include **Not enough exposure**. A reviewer must never
guess about capabilities they did not directly observe. The interface may call
these **scores**, but each score remains visibly attached to the relationship
in which it was observed.

The launch Assessment offers LARP, Domain Expertise, On Time, and Charisma in
every Review, asks Run it back in every Review, and adds Taste and GTM when the
relationship and observed-work answers support those prompts. Relationship type
may tailor examples but does not change what a metric means. This single
exposure-aware pool applies to founders, investors, and operators and never
collapses into a universal Founder Score.

The language research behind this candidate set is recorded in:

- [Current tech-community judgment language](./research/current-tech-community-judgment-language.md)
- [Current rating-product language](./research/current-rating-product-language.md)
- [Current founder and VC judgment language](./research/current-founder-vc-judgment-language.md)

The summary question is:

> **Would you run it back?**

- **Absolutely.**
- **Maybe, with better paperwork.**
- **Fuck no.**

The response is always displayed with its relationship context. It must not be
presented as an objective universal verdict about the Profile subject.

### 4. Tell the story

The qualitative section uses bounded prompts rather than one context-free box:

- **What happened?** Describe what you personally experienced.
- **What should their next collaborator know?** Include the useful part, not
  hearsay.
- **Anything they did right?** Optional, but deliberately available so a
  difficult story can still be specific and credible.

Copy should invite candor without prompting allegations the platform cannot
adjudicate. Reviews may describe first-hand events and opinions. They may not
include hearsay, private contact information, confidential records, protected-
class commentary, diagnoses, or unverified accusations of criminal conduct.

### 5. Create an account and attest

The reviewer can draft the review before creating an account. At publication,
the product asks for the minimum necessary identity:

- Continue with a one-tap identity provider, or use an email sign-in link.
- No password creation.
- No public username requirement.
- No profile-building questionnaire.
- No forced contact import, notification opt-in, or onboarding carousel.

The reviewer confirms that the review is first-hand, materially accurate to
the best of their knowledge, and based on the stated relationship. Public
pseudonymity does not mean the platform lacks an accountable account behind the
review.

Before publication, the reviewer chooses one attribution mode for that Review:

- **Post with my name** — display the Account's Public Byline.
- **Post anonymously** — display **Anonymous reviewer** while retaining the
  Account, Relationship Claim, and moderation history privately.

Attribution is selected per Review. Switching a published named Review to
anonymous is allowed once after an explicit warning that screenshots and prior
Share Clips cannot be recalled; the change is permanent. An anonymously
published Review cannot later become named at launch. Anonymous Reviews must
not expose an Account through a message button, profile link, analytics, or an
accidental byline in notifications.

At launch, anonymous Reviews use the single public label **Anonymous reviewer**,
not a stable pseudonym that connects one Account's Reviews. The Account link
remains private to the platform for moderation and valid legal process; the
product must not promise anonymity from the platform.

### 6. Moderate and publish

At launch, every review enters moderation before publication. The reviewer sees
a plain status—draft, under review, published, needs changes, or removed—and a
specific explanation when action is required.

One Account may publish at most one active Review for the same Profile subject
and relationship period. Editing updates that Review instead of manufacturing
a second vote.

The Profile subject does not receive a pre-publication copy. When a Review
publishes, the verified Profile claimant receives notice and may file a factual
correction or policy dispute and one separately moderated, clearly labeled
Profile Subject Response. The subject cannot edit the Review, veto publication,
force a score change, remove compliant criticism, or learn an anonymous author.

Review visibility uses draft, submitted, changes required, published,
withdrawn, limited, and removed states. An edit creates an immutable Review
Revision rather than a new state, and a dispute opens a Moderation Case rather
than automatically labeling or removing the Review.

## Account setup

Account creation should take roughly one decision and one confirmation. The
product creates the account when the user first attempts a protected action,
rather than presenting signup as a destination.

Protected actions include:

- Publishing or saving a review.
- Publishing a named Post.
- Creating a profile.
- Voting, awarding, or commenting.
- Claiming a profile.
- Sending or receiving messages.
- Activating an Open To Status.
- Reporting or disputing content.

The first session should not ask the user to become a content creator, complete
a profile, choose interests, or configure notifications. Those requests appear
only when they unlock the action the user is already trying to take.

Account identity, Public Byline, Review attribution, and Profile are separate:

- An account may review without creating a public personal profile.
- A Public Byline is created only when an Account chooses a named action.
- Each Review may use the Public Byline or appear as **Anonymous reviewer**.
- Posts always use the Public Byline.
- Claiming a Profile requires additional verification.
- Message availability is an explicit setting on a claimed profile.

Launch sign-in methods are Sign in with Google, Sign in with Apple, and a
one-time email sign-in link. Matching email addresses never silently merge two
Accounts. Adding or recovering a sign-in method is a higher-risk action with
reauthentication, throttling, notification, and reviewed recovery when all
linked methods are unavailable.

## Feed

The feed contains Reviews and Posts, not ranked people. It borrows the legible
reading loop of X and the low-friction community judgment of Yik Yak without
copying X's visual shell.

Reviews remain the product's durable reputation layer. Posts are the named,
lower-friction participation layer. They must look different and remain
filterable through **All**, **Reviews**, and **Posts** views so a flood of casual
Posts cannot erase the Profile-and-Review utility.

Each Review item shows:

- Profile subject's name and photo.
- Reviewer's relationship to the Profile subject, with verification state when
  one exists.
- A short excerpt from the first-hand account.
- Image thumbnails when the review contains exhibits.
- The most legible assessment signal, without collapsing the person into one
  score.
- The **Run it back?** answer.
- Upvote and downvote controls for judging the review's usefulness.
- Award count, comment count, and publication time.
- A situation verdict poll only when the review format calls for one.

Each Post item shows its named Public Byline, body, media, publication time,
Comment count, and sharing action. Posts do not display relationship context,
Review scores, **Run it back?**, Review Votes, Review Awards, verdict polls, or
Review verification states.
If a Post substantially evaluates a named person's working behavior, the
composer should redirect its author to the Review flow rather than allowing a
Post to bypass first-hand attestation and moderation.

Initial feed views are **Trending** and **Latest**. **Latest** is chronological
and gives new reviews a transparent path to discovery. **Trending** should
reward useful, current reviews while resisting coordinated dogpiles. A
personalized **For you** feed can follow only after the product has enough
real behavior and explicit interests to personalize honestly.

The feed composer cannot publish a free-floating story. Its first prompt is
**Who are you reviewing?**, backed by Profile search and inline Profile
creation. Relationship selection follows before story composition.

The Post composer is separate and begins with the author's Public Byline. The
interface never asks people to remember which disclosure or moderation rules
apply to a single ambiguous composer.

## Comments and discussion

Every published Review and Post has a Comment section. Comments may reply to
the object or one existing Comment; the interface should stop at two visible
levels rather than building infinitely nested threads.

Comments should be named by default. The author of an anonymous Review may
reply inside that Review's thread as **Review author** without exposing their
Public Byline. Allowing unrelated anonymous commenters would create a second
anonymous-content system with weaker relationship context and is not
recommended for launch.

Comment authors can edit, delete, report, block, and share. Review and Post
authors can mute notifications but cannot remove critical Comments merely for
disagreeing with them. Moderators can lock a thread, remove individual
Comments, or slow participation when a thread becomes a pile-on.

Comments contribute only a capped discussion signal to Trending. Raw Comment
volume is not evidence that the underlying Review is useful.

### Review interactions

The three community judgments have different jobs and should not be presented
as interchangeable engagement buttons:

| Interaction | The question it answers | Availability |
|---|---|---|
| **Review Vote** | Was this review useful, specific, and worth seeing? | Every published Review; one upvote or downvote per Account. |
| **Review Award** | Is this one of the rare reviews I especially want to endorse? | Every eligible published Review; consumes the giver's weekly Award Credit. |
| **Verdict Vote** | What do readers think about the situation described? | Optional and story-specific; never used as a Profile score. |

Changing an upvote to a downvote replaces the existing Review Vote. An author
cannot vote on or award their own Review. Reviews display a net vote score and
Award count; the system retains the underlying positive and negative counts
for ranking and abuse analysis.

The Review Vote is the everyday relevance signal. The Review Award is the
scarce signal. The Verdict Vote is editorial texture. If testing shows that
the Verdict Vote makes this hierarchy confusing, it should be removed before
the vote or Award is removed.

The launch product defers Verdict Votes. Review Votes and Review Awards already
answer the necessary everyday and scarce endorsement questions; a situation
poll may return only through a later proposal after observed interaction makes
its additional value clear.

### Weekly Award

Each eligible Account has an **Award Credit** balance with a maximum of one.
At the weekly refresh, the balance becomes one regardless of whether the prior
credit was used. Unused credits expire; they never accumulate into a hoard.

The weekly period is global: Monday 00:00 UTC through the next Monday 00:00
UTC. Award eligibility requires an active Account with a verified sign-in
contact, at least seven full Account days, no Award-disqualifying enforcement,
and current risk approval. An Account that first becomes eligible during a
period receives that period's one Credit without waiting for the next Monday.

Giving the credit creates a Review Award and reduces the giver's balance to
zero until the next refresh. The action is not anonymous to the platform, is
not transferable, and cannot be purchased at launch. Multiple people may
award the same Review, so the Review's Award count can grow even though each
giver's balance cannot stack.

The Award should feel closer to spending a weekly endorsement than tapping a
second like button. The interface should show when the next credit arrives,
but should not add streaks or punish a person for not using it. Initial abuse
controls should include verified contact information, account-age or risk
eligibility, one Award per giver per Review, and reversal when an awarded
Review is removed.

### Ranking

X's published recommendation architecture is useful as a pipeline reference,
not as a model or set of weights to copy. The relevant pattern is:

1. Gather eligible candidates from several pools.
2. Hydrate each candidate with viewer, Review, Profile, and safety signals.
3. Score the candidates.
4. Apply visibility, deduplication, diversity, and fatigue rules.
5. Mix and serve the result with enough logging to explain what happened.

The launch product does not have the data to justify a large learned ranker.
Its Trending feed should use an inspectable score built from:

- Time-decayed Review Vote quality, using a confidence-adjusted rate rather
  than raw net votes alone.
- A capped, time-decayed Award contribution.
- Meaningful discussion and expanded reading, not raw taps.
- Relationship confidence and moderation state.
- Negative signals such as reports, hides, reversals, and suspected brigading.

Candidate pools should include newly published Reviews, currently trending
Reviews, and a deliberate exploration slice. Later pools may use followed
Profiles, relationship types, or topics. Media presence alone should not
increase rank; an image is not proof.

Post-ranking rules should remove already-seen duplicates, limit repeated
Reviews of the same Profile, preserve author and relationship diversity, and
prevent a single controversy from consuming the feed. Raw replies, outrage,
or vote volume must never be treated as quality by themselves. The system
identifies real people, so trust and safety is part of relevance rather than a
cleanup step after ranking.

The supporting source review and launch recommendation are recorded in
[Feed ranking, voting, and awards](./research/feed-ranking-voting-and-awards.md).

### Review metrics

The public Review should show only metrics that help a reader interpret it:

- Net Review Vote score.
- Award count.
- Comment count.
- Publication age.
- Relationship type and verification state.
- Exhibit count when images are attached.
- Verdict distribution when a Verdict Vote is present.

The product should not show view counts at launch. Low counts make a young
network feel empty, and high counts turn attention into a misleading proxy for
truth. Internally, ranking and safety need impressions, unique viewers,
expanded reads, dwell, Profile opens, image opens, votes, Awards, comments,
shares, reports, hides, moderation actions, and suspected coordinated activity.

Community voting evaluates the Review or situation, not the Profile subject's
worth. The product must not become a real-person "worst people" leaderboard.

## Images and exhibits

The Review flow should strongly encourage optional image uploads under the
existing **Add receipts** or **Add exhibits** language. Images make first-hand
stories more legible and feed-native, but a reviewer must still be able to
publish a useful text-only Review.

The initial composer should support up to four images with previews, reorder,
removal, captions, and an explicit reminder to redact private information.
Before publication the system should strip location and other EXIF metadata,
scan for contact and financial information, offer an easy redaction tool, and
route risky media through moderation. Images do not automatically verify a
Relationship Claim or the claims made in a Review.

## Sharing and Share Clips

Every Profile, Review, Post, and Comment has a literal **Share** action for
copying its canonical link. Profiles, Reviews, and Comments additionally offer
**Make a clip**, a distinctive export designed for social feeds and messaging.
An approved Profile Subject Response also has a stable deep link that opens it
inside the canonical Review. A Profile Aggregate remains derived Profile state,
so it has no independent share object or frozen metric URL.

The signature sharing interaction is selecting the useful line and pulling it
out of the open document as a filed clipping. The paper separates along a
perforated edge and resolves into a clean Share Clip; the existing **FILED**
stamp-down supplies the one theatrical beat. Ordinary Feed actions remain
quiet.

Share Clips are available in portrait story, square, and link-preview formats:

- A **Review Clip** includes the reviewed Profile, relationship context, an
  exact Review excerpt, attribution mode, **Run it back?** when useful, and the
  canonical link.
- A **Profile Clip** includes the Profile photo and name, review volume,
  relationship mix, selected aggregate signals, and the canonical link.
- A **Comment Clip** includes the exact Comment or, for a longer Comment, a
  clearly labeled exact contiguous excerpt; its named author or **Review
  author** label; enough parent context to avoid misrepresenting it; and the
  canonical link.

People may select among exact source excerpts but cannot rewrite text inside a
Share Clip. The domain and a compact case identifier remain visible after
cropping. Uploaded Exhibits are excluded by default and included only when the
sharer explicitly selects media that is eligible for redistribution. Deleting,
removing, or anonymizing the source updates the live landing page even though
already-downloaded images cannot be recalled.

The launch export presets are square (1080×1080), portrait story (1080×1920),
and link preview (1200×627). Review and Comment excerpts remain exact contiguous
source spans with mandatory parent, relationship, and attribution context;
Profile Clips may include only complete currently eligible aggregate panels
with their denominators and disclosure labels. Sharers may choose a preset,
bounded layout, and eligible media crop, but cannot alter source words or crop
away required context, provenance, the domain, or the case identifier.

Native device sharing is progressive enhancement. Copy link, selectable URL,
download, and copyable accessibility text remain available when native or file
sharing is unsupported. Shared links contain no sharer, recipient, campaign, or
anonymous-author token. Platform-hosted previews and Clips are invalidated when
the source changes or becomes ineligible, while screenshots, downloaded files,
and third-party caches remain outside the platform's ability to recall.

Posts use ordinary link and image sharing rather than the case-file treatment
unless a future Post-specific artifact earns its own visual grammar.

## Aggregation

Individual Reviews display their own Assessments immediately after publication.
A Profile Aggregate is derived system state, not part of the Profile's authored
identity. Each aggregate field requires five distinct eligible reviewer
Accounts. Only current published Reviews with accepted Relationship Claims and
eligible Assessment versions contribute; **Not enough exposure** is excluded,
and one Account contributes at most its most recent eligible Assessment per
Profile.

Capability summaries show the full five-position ordinal distribution,
eligible denominator, coverage, and a categorical median when relationship
evidence is not concentrated. Run it back shows its three named answer
categories and its own denominator. Five through nine answers are labeled
**Early signal**. Decimal means, universal star ratings, percentiles, Profile
comparisons, predictions, and a universal Founder Score are out.

Public relationship context uses coarse cofounder/partner, reporting,
peer/teammate, investor/advisor, and client/vendor/external-partner groups. The
product does not invent equal group weights. When fewer than two groups
contribute, the second-largest group has fewer than two reviewers, or one group
provides more than 80 percent of answers, the summary says **Concentrated
perspective** and withholds the cross-relationship median. Any relationship or
verification breakout independently requires five reviewers.

Self-attested and verified Relationship Claims remain visibly distinct but
count equally because Relationship Verification supports the relationship, not
the truth of the Review or Assessment. Named and anonymous Reviews have the
same eligibility and weight. Public aggregates never expose attribution-mode
filters or counts, arbitrary combined filters, or cells and residual totals
that could single out an anonymous reviewer. Source revisions, withdrawals,
limitations, removals, Claim changes, integrity holds, Profile merges, and
Profile removal invalidate affected aggregates before stale values can remain
public.

## Claiming, replies, and direct messages

A person can claim their existing Profile through an Account. Claiming grants
the ability to:

- Correct the canonical name and profile photo.
- Receive alerts about new reviews.
- Post one clearly labeled response to a review.
- Report, dispute, or request correction of a review.
- Enable or disable direct messages.

Claiming does not grant the ability to erase a compliant negative review.

A Profile Claim verifies scoped control, not every fact about the person. It
requires a verified Account contact plus control of an authoritative identity
associated with the Profile subject or private human evidence review. A matching
name, email domain, or photo alone is insufficient. One Account may control one
active Profile Claim and one Profile may have one active claimant; public clients
see only claimed or unclaimed state, never the proof.

Direct Messages exist only between Accounts. A verified Profile claimant may
enable requests from that Profile; an Account with a Public Byline and an
eligible named Post may separately enable requests on its Posts. Both settings
default off. An unclaimed Profile never presents a disabled fake button, and a
Public Byline without an eligible Post is not made independently discoverable.

An ordinary sender needs a verified Account contact and Public Byline. The
Open To exception uses the sender's current verified claimed Profile as Message
Identity after both people independently activate and the recipient separately
enables introductions. Either path gets one short, text-only, link-free request
with purpose and source context. A pending request expires after 30 days.
Recipients can accept, privately decline, archive, block, report, or disable
requests. Baseline request limits are three new recipients per rolling 24 hours
and ten per rolling seven days, with pair-level replay controls and lower risk
limits when warranted. Acceptance opens one private one-to-one conversation but
creates no Connection or Follow.

Accepted conversations support bounded text and safe HTTP(S) links at launch,
but not attachments, previews, read receipts, unsend, disappearing messages,
groups, or calls. Disabling new requests does not close an accepted
conversation. Each participant can archive, mute, locally delete, report, or
Block; Block stops the conversation immediately and never reveals direction.

An anonymous Review never exposes its author as a DM target. Replying to the
Review author happens publicly in the moderated Comment thread unless that
author independently reveals their Public Byline.

## Open To mode

**Open To** is a separate, adults-only, mutually visible mode for claimed
Profile owners. A participant may select one or more current intentions:

- **Hook up.**
- **Date.**
- **Relationship.**

Only Accounts with their own active Open To Status can see that another claimed
Profile has an active status or which intentions it contains. Visibility is a
contextual decoration after ordinary Profile search, canonical Profile
navigation, an independently known Profile link, or private Follow activity has
already returned that person. Open To has no participant directory, search
filter, ranking, recommendation pool, swipe, Like, Match, preference matching,
or location discovery. The signal never appears in public search, ordinary
Profile sharing, Review cards, Share Clips, or anonymous-author surfaces.

Activation creates one fixed 14-day window and must be immediately revocable at
any time. Leaving stops visibility now but does not permit another activation
until the original window closes; intention changes never extend expiry. A
product cannot make a sexual or romantic availability signal impossible to
withdraw. Renewal after expiry requires a fresh explicit action.

Activation does not enable requests. **Let people in Open To send me an
introduction** is a second, default-off, immediately reversible choice. An
eligible introduction reuses the controlled Message Request lifecycle and uses
the sender's verified claimed Profile as Message Identity. A status means
openness to an introduction; it is never consent to sexual messages, contact,
or any particular interaction. Blocking immediately hides both people from
each other throughout Open To and DMs.

Open To is disabled by default and is not part of the first release. Later
cohort enablement requires a privacy-preserving adult-eligibility assertion,
claimed-Profile control, no location collection, screenshot-aware privacy copy,
reporting, blocking, rate limits, immediate Leave, counsel and impact review,
moderation readiness, closed abuse testing, and deployed non-leakage proof. It
remains isolated from professional reputation so romantic rejection cannot
quietly become Review retaliation.

## Trust and safety baseline

The relationship selector is context, not proof. Public identifiable profiles
and reviews require additional defenses:

- Account-backed submissions and abuse rate limits.
- First-hand-experience attestation.
- Optional private relationship evidence and a verification state.
- Pre-publication moderation at launch.
- One-review-per-relationship controls.
- Duplicate-profile detection and merging.
- Profile correction, content reporting, dispute, takedown, and appeal paths.
- Review-subject replies that are held to the same content rules.
- Audit history for moderation and material review edits.
- Detection and response for impersonation, brigading, and retaliatory reviews.

The exact public-profile, photo, review, retention, and dispute policies require
specialist legal review before launch. Product copy must not claim that selecting
a relationship makes a review verified or eliminates defamation risk.

An Account Block is immediate, unilateral, and non-notifying across direct
interaction and targeted signed-in discovery. It does not erase an otherwise
public Profile or compliant public content and cannot guarantee invisibility to
a logged-out visitor. Reports create cases for review rather than automatic
ranking or enforcement effects; affected Accounts receive scoped notices and a
30-day appeal path without learning a confidential reporter or anonymous author.

Launch retention defaults are purpose-specific: Account deletion has a 30-day
recovery window; finalized primary identity is erased within another 30 days;
backups expire within 90 days; raw Profile Claim evidence expires within 90 days
of a final decision; and minimum safety and audit records may remain for up to
24 months. Active appeals and recorded legal holds pause only the affected
category. Specialist review may revise a period before launch, but indefinite
undifferentiated retention is rejected.

The primary-source foundation research and legal-review flags are recorded in
[Identity and safety foundation](./research/identity-and-safety-foundation-primary-sources.md).

## Experience and visual direction

The established visual thesis remains **Evidence, filed**: bureaucratic
officialdom applied to founder chaos. The application should feel like a living
case registry rather than LinkedIn with red paint.

- Profiles are dossiers, but never criminal mugshots.
- Reviews are filed accounts or incident reports.
- Collections are ledgers and docket rows rather than floating card grids.
- Assessment controls resemble evidence scales or marked forms.
- Claim, moderation, and verdict states earn the existing stamp treatment.
- Cream paper, black ink, indictment red, and rare acid highlights remain the
  palette.
- The humor lives in compact, current language such as **LARP Score** and **Run
  it back?** Instructions, errors, safety copy, and buttons remain literal.

The memorable interaction should be completing the relationship-grounded
scorecard as one coherent "filed assessment" moment. Other interactions stay
quiet so the product does not become a carnival of startup jokes.

### Design G as an interaction reference

Design G remains the preferred interaction study for feed density, structured
composition, image exhibits, and fast voting. Its X-like three-column shell is
not the product layout. The application must be recognizable without its logo
or color palette rather than reading as an X skin.

The useful pieces to retain are:

- The primary identity in every timeline item is the reviewed Profile, with
  the pseudonymous reviewer and Relationship Claim as secondary context.
- The composer starts with **Who are you reviewing?** rather than allowing a
  standalone charge or anonymous story.
- Global search searches Profiles first.
- The existing exhibit treatment becomes the image-upload pattern for Reviews.
- Upvote/downvote and the weekly Award take visual priority over an optional
  situation verdict poll.

### The Caseboard layout

The candidate product layout is **The Caseboard**: a purpose-built master-detail
workspace rather than three independent social columns.

- A dense **docket index** lists mixed Feed items with unmistakable **Review**
  or **Post** labels.
- The selected item opens as one generous **active document**. Reviews look like
  filed assessments; Posts look like named correspondence, not smaller Reviews.
- Comments live as margin annotations attached to the active document rather
  than a detached social sidebar.
- Profile search and the current Profile open as a dossier layer, preserving
  the sense that people—not the Feed—are the durable system of record.
- On mobile, the docket becomes a single reading stream and the active document
  takes over the screen; the content hierarchy survives without desktop rails.

The signature interaction is the Share Clip tear-off described above. It comes
directly from the product's evidence-and-filing world and gives the layout an
ownable social behavior without adding decorative machinery everywhere else.

## Direction assessment

The direction is now more coherent than a generic professional-review site
because each reference product supplies a different layer:

- Rate My Professors supplies the durable lookup utility: one canonical person
  with a history of contextual Reviews.
- X supplies the familiar reading and discovery loop: a dense feed, media, and
  fast movement from an item into its surrounding identity and conversation.
- Yik Yak supplies lightweight community judgment and a lower-friction public
  voice.
- The weekly Award adds a scarce ritual that neither another like nor a paid
  badge can provide.

The combination also creates the product's largest risk: feeds learn to amplify
emotion faster than they learn truth, while this product names real people.
Optimizing raw engagement would predictably reward outrage, piling on, and
performative dunks. Relationship context, moderation, diversity limits,
negative feedback, and confidence-adjusted voting therefore belong inside the
ranking definition, not in a separate safety appendix.

The second risk is interaction overload. Upvote/downvote, Award, comments,
shares, and a verdict poll are already five possible actions. The hierarchy
must remain obvious: vote when a Review is useful, Award when it is unusually
valuable, comment when adding context, and use a Verdict Vote only when the
situation genuinely benefits from a poll.

The third tension is easy signup versus manipulation. Browsing should remain
open and account creation should remain one-tap, but Reviews, votes, Awards,
and comments must be Account-backed. Award eligibility can mature behind the
scenes through contact verification, account history, and risk checks without
turning signup into LinkedIn onboarding.

Posts are a good addition only if they remain the participation layer around
the Profile-and-Review core. They give named users a reason to return when they
do not have a Review to file and make following people more meaningful. If they
become an unrestricted substitute for Reviews, the product loses its unique
utility and becomes a smaller X with unusually dangerous gossip.

The launch social graph uses one-way **Follow** only. Follow targets a canonical
Profile, including an unclaimed Profile, and privately subscribes an Account to
eligible Profile activity. A Public Byline exposes Follow only when explicitly
linked to a verified Profile Claim, in which case the action resolves to that
Profile. Launch has no mutual Connection, public graph list, graph count, or
graph-size credibility signal. Accepting a message does not create a Follow. A
Connection requires a later proposal that identifies a capability Follow,
message requests, and Open To cannot express.

The current Review Assessment began as a founder-fitness scorecard. Most of its
signals—LARP, Domain Expertise, On Time, Taste, GTM, Charisma, and **Run it
back?**—can describe investors and operators too, but the final specification
must test whether one scorecard works across roles. We should not force a
direct report to rate an investor on a capability they could not observe merely
to preserve one universal form.

The broader goal creates a brand-architecture question. **fuckmycofounder.com**
is unforgettable and gives the product its candid posture, but it frames a
network for investors, operators, and builders through cofounder conflict—and
Open To makes the word **fuck** feel more literal. Before specification, we
should decide whether the domain is the enduring network brand, a provocative
front door, or the name of the Review product inside a broader network.

Open To is the most distinctive and the most destabilizing proposed addition.
As a separate mutual mode, it could fit the site's candid adult personality and
create a powerful connection loop. Displayed in the normal reputation product,
it would sexualize Profiles, invite harassment, and undermine professional
trust. It should therefore remain isolated, reversible, and a later launch
candidate until identity, blocking, DMs, and moderation are proven.

## Cold start and go-to-market

Status: deferred from the current product-specification phase. Retain this
research-backed strategy for later; GTM choices do not block feature specs.

### Launch thesis

Do not launch an empty global "LinkedIn for startups." Start with one dense,
relationship-rich cell in which people already know one another and the product
can reliably answer a contribution with useful attention.

The recommended initial wedge is **San Francisco pre-seed through Series A
founders and founding operators**, with experienced angels, scouts, community
hosts, and early employees present as connected participants. The broad network
for founders, investors, VCs, operators, and startup people remains the
destination; it is not a credible cold-start audience.

The lead launch question is:

> **Who would you actually run it back with?**

This is specific, relationship-backed, legible in a Share Clip, and capable of
producing positive or balanced participation before the brand becomes known
only for public conflict. The remaining Review Assessment provides texture
inside the Review rather than competing equally in the acquisition message.

### Participation ladder

The product should never ask a cold visitor to join an abstract social network.
It should let people receive value, then request the minimum identity required
for the action they already chose:

1. Browse Profiles, Posts, Reviews, Comments, tools, and Share Clips without an
   Account.
2. Create an Account to follow, save, or choose a small number of interests.
3. Vote or answer a lightweight prompt.
4. Publish a named Comment or Post.
5. Publish a named or publicly anonymous Review.
6. Unlock abuse-prone actions such as downvotes, Awards, and outbound DM
   requests through healthy history, Account age, or optional verification.

Anonymous Review means anonymous to the public, not unaccountable to the
platform. Risk controls should appear when the risky action occurs rather than
making the first signup screen feel like a background check.

### The four initial loops

1. **Utility loop.** The no-account incident report, Cooked Quiz, prevention
   Toolkit, and two-player Compatibility Test create value before the social
   graph is dense. The Compatibility Test naturally recruits one specific
   second person. Saving history, publishing a result, or joining its discussion
   can introduce the Account.
2. **Relationship loop.** A member identifies people they actually built with.
   The platform sends a single-purpose invitation to contribute candid,
   relationship-backed context. The requester cannot choose sentiment, receive
   a reward for completion, or learn the identity of an anonymous contributor.
   Timing may need batching so it cannot deanonymize a Review.
3. **Conversation loop.** A named Post asks a concrete startup question, receives
   a substantive Comment, and brings the author back through a reply
   notification. During the beta, disclosed community hosts manually route or
   answer legitimate threads that would otherwise remain empty.
4. **Object-sharing loop.** Every safe Profile, Post, Review, Comment, and tool
   result has a useful logged-out landing page and distinctive Share Clip. Its
   call to action is contextual—**Read the Review**, **Join the discussion**,
   **Claim this Profile**, or **Complete the comparison**—rather than **Invite
   friends**.

### Founding cohort

Run a four-week invitation-only **Would You Run It Back?** cohort before a broad
launch:

- Recruit roughly 25 anchor members and grow the cell to 50–100 participants.
  Choose for overlapping real relationships and willingness to contribute, not
  follower count.
- Balance founders with founding engineers, designers, GTM operators,
  experienced angels or scouts, and recurring community hosts.
- Ask each anchor to claim a Profile, publish one useful named Post, invite
  three past collaborators through the relationship flow, and answer a small
  number of relevant threads.
- Seed only transparent staff Posts, prompts, tools, and editorial material.
  Never fabricate people, Reviews, votes, Comments, or follower counts.
- Moderate every Review and community-created Profile before broad reach; give
  lower-risk named Posts a faster risk-based path.
- Guarantee that every legitimate early Post receives at least one substantive
  response within a published service window.

The candidate public moment is a small **Run It Back Office Hours** event after
the cohort, with a larger event considered for SF Tech Week. Product Hunt and
Show HN come only after a logged-out visitor can use a real tool and browse a
credible, active network; neither is the cold-start strategy.

### Channel sequence

Use first:

- Personal invitations from the team and anchor members, each pointing to a
  specific Profile, relationship request, Post, or Compatibility Test.
- Recurring SF founder communities, startup houses, coworking groups, and event
  hosts that already contain a real relationship graph.
- Organic Share Clips on X, LinkedIn, Slack, iMessage, WhatsApp, and Discord.
- Search-oriented cofounder tools, checklists, and pattern pages.

Use after the first 1,000 healthy Accounts:

- Small accelerator or fellowship pilots.
- Founder podcasts and newsletters using original aggregate findings rather
  than a generic product announcement.
- A methodology-backed **State of the Cofounder** report after privacy
  thresholds and representative data exist.
- Investor-specific participation through named Posts, Profile claims, and
  discussions—not an invitation to "come get rated."

Defer paid acquisition, broad influencers, mass cold email, scraped directory
imports, real-person leaderboards, and city expansion. The provocative domain
also makes some paid and institutional channels less reliable. **FMCF** is the
recommended restrained mark for professional Profile, Share Clip, event, and
partner surfaces while the full domain remains the discovery voice. Launch
web-first so native app review is not on the critical path before moderation is
proven.

### Expansion gates and metrics

The first operating target is not registration count. It is a **Complete Local
Profile**: a claimed or accurately moderated Profile with contributions from at
least two distinct relationship-backed people and recent meaningful activity.

The staged targets in the GTM research are hypotheses to revise after the first
100 people:

- **0 → 100 Accounts:** prove that relationship invitations convert, every
  useful Post gets a response, safety operations hold, and activated members
  return.
- **100 → 1,000 Accounts:** prove that recurring community partners can
  reproduce the cell and that at least half of acquisition comes from members,
  partners, shared objects, or search rather than the founding team's outreach.
- **1,000 → 10,000 Accounts:** prove a second city can reach local density
  without weakening Review quality, moderation, or retention before opening a
  third.

The north-star candidate is **Weekly Complete Local Profiles**, not total
Accounts. Supporting measures include activation through a meaningful action,
time to first substantive reply, first-to-second contribution conversion,
invitation-to-contribution conversion, 7- and 28-day contributor retention,
approved Review rate, Profile-search success, Share Clip conversion, and safety
events per 1,000 interactions.

Do not optimize launch success around time on site, raw Comment volume, negative
vote volume, or controversy. Do not pay for Reviews, reward Review referrals,
allow Profile subjects to condition benefits on Reviews, force contact imports,
or use dating availability as the launch hook.

The deferred source research and detailed experiments are recorded in:

- [Cold-start patterns for social review networks](./research/cold-start-patterns-for-social-review-networks.md)
- [Account and content participation incentives](./research/account-and-content-participation-incentives.md)
- [GTM wedge for the startup network](./research/gtm-wedge-for-startup-network.md)

## Specification status

The planning document has been converted into nine dependency-ordered product
changes plus an Order 0 engineering-foundation change, all listed below. Each
product package has passed strict structural
validation and root semantic review. They remain proposed product contracts:
none is accepted for implementation until the complete set receives human
approval. The engineering foundation is implemented as the repository-level
prerequisite for every network feature. This implementation does not authorize
deployment, production migrations, secrets, or live-provider setup; each remains
a separately approved and verified operation.

### Specified product areas

The following areas now have reviewable normative behavior and tracer-bullet
implementation tasks:

- Accounts, progressive signup, Public Bylines, and Profile Claims.
- Profile search, creation, claiming, correction, dispute, and merging.
- The first-hand Review flow, Relationship Claims, qualitative testimony,
  structured assessments, attribution choice, moderation, and publication.
- Named Posts and Account-backed Comments as objects distinct from Reviews.
- Mixed Feed composition, chronological Latest, and an inspectable Trending
  pipeline.
- Review Votes, weekly Review Awards, images and Exhibits.
- Canonical sharing and Share Clips.
- Profile replies and Direct Message requests.
- The Caseboard application layout and the established visual system.

### Decisions resolved during specification

- Launch uses private one-way Profile Follow; mutual Connections and public
  graph metrics are deferred.
- Profile-level aggregation uses a five-distinct-reviewer threshold per field,
  ordinal distributions, safe-cell suppression, and relationship-concentration
  disclosure.
- Open To is excluded from the first release and remains default-disabled until
  its separate safety, age-assurance, privacy, moderation, and launch gates pass.

### Recommended implementation order

0. **Application engineering foundation** — server-rendered TypeScript
   scaffold, Postgres and transaction seams, public/private projection
   boundaries, repository rules, canonical quality gates, CI, and migration of
   the existing static experience without feature expansion.
1. **Identity, trust, and safety foundation** — Account, Public Byline, Profile
   Claim, privacy boundaries, blocking, reporting, moderation, and audit states.
2. **Profiles** — discovery, creation, ownership, corrections, disputes, and
   duplicate merging.
3. **Reviews** — Relationship Claim, Assessment, story, attribution,
   moderation, and subject response.
4. **Posts and Comments** — named publishing, discussion, thread controls, and
   the rule preventing Posts from becoming unverified Reviews.
5. **Feed and reactions** — candidate eligibility, Latest, Trending, Review
   Votes, Awards, deferred Verdict Votes, and notifications.
6. **Sharing** — canonical links, Share Clips, attribution, media eligibility,
   and deleted or anonymized source behavior.
7. **Social and communication graph** — Follow or Connection, Profile activity,
   message requests, and Direct Messages.
8. **Open To** — a separate adults-only proposal after identity, blocking,
   messaging, and moderation contracts are proven.

Do not create one monolithic specification for the entire application. Each
proposal should state its dependency on earlier contracts and close the open
questions that belong to that feature.

### OpenSpec change map

Use verb-first change IDs for reviewable increments and stable noun capability
folders for the resulting requirements. A change may add several capabilities
only when they form one walking product slice.

| Order | OpenSpec change | Capability specs | Depends on | Explicitly out |
|---|---|---|---|---|
| 0 | `establish-application-engineering-foundation` | `application-foundation`, `engineering-standards`, `verification-gates` | Existing static product | Network feature behavior, live providers, deployment |
| 1 | `add-account-identity-and-safety-foundation` | `accounts`, `public-bylines`, `trust-safety` | Engineering foundation | Profiles, content, Feed, DMs |
| 2 | `add-person-profiles` | `profiles`, `profile-search` | Identity foundation | Reviews, Posts, social graph |
| 3 | `add-relationship-reviews` | `relationship-claims`, `reviews`, `review-assessments` | Identity foundation, Profiles | Profile aggregates, community reactions |
| 4 | `add-named-posts-and-comments` | `posts`, `comments` | Identity foundation, Profiles, Reviews | Feed ranking, Review reactions, sharing delivery |
| 5 | `add-profile-review-aggregation` | `profile-aggregation` | Reviews | Real-person leaderboards |
| 6 | `add-mixed-feed-and-review-reactions` | `feed`, `review-votes`, `review-awards`, `notifications` | Reviews, Posts, Comments | Learned personalization, paid Awards |
| 7 | `add-share-clips` | `canonical-sharing`, `share-clips` | Profiles and all shareable content objects | Editable quotations, default Exhibit redistribution |
| 8 | `add-social-graph-and-messaging` | `social-graph`, `message-requests`, `direct-messages`, `notifications` (modified) | Identity foundation, Profiles, Feed/reactions | Anonymous-author discovery, open inboxes |
| 9 | `add-open-to-mode` | `open-to`, `message-requests` (modified) | Profiles, identity, blocking, DMs | Public visibility, irreversible activation, minors |

The existing `add-cooked-quiz-and-toolkit` change remains an independent static
product contract. Order 0 migrates its already-implemented surface into the new
scaffold with parity; it does not fold the quiz's product behavior into the
network foundation merely because its tools may later help acquisition.

Later changes modify the foundational `trust-safety` and `notifications`
capabilities when they introduce new object-specific behavior. They should not
restate conflicting local versions of blocking, reporting, moderation, or
delivery rules.

Every change folder uses the standard OpenSpec package:

```text
openspec/changes/<change-id>/
├── proposal.md
├── specs/<capability>/spec.md
├── tasks.md
└── design.md  # only when a real technical trade-off needs a decision
```

`proposal.md` explains why, concrete scope, exclusions, dependencies, and risk.
Capability specs contain normative `SHALL` requirements with `WHEN`/`THEN`
scenarios. `tasks.md` is an ordered, verifiable walking-skeleton implementation
plan. `design.md` records only contestable technical choices; it is not a second
product specification.

All spec-building agents must follow the sequential Matt Pocock skill pipeline
and per-change skill matrix in [`openspec/AGENTS.md`](../openspec/AGENTS.md).

## Current product decisions

- Profiles are the first-class product object.
- Profiles may represent founders, investors, venture capitalists, operators,
  advisors, and other identifiable startup participants.
- Anyone may create a minimal Profile for another startup person.
- A profile contains only a name and photo as authored identity fields.
- At launch, a Profile subject must be one identifiable, living adult with
  substantiated professional participation in the startup ecosystem; minors,
  deceased people, organizations, and merely social or aspirational connections
  are ineligible.
- Every Profile Proposal is Account-backed and moderated before publication.
- Profile photos require subject supply, permission from the subject and
  applicable rights holder, or redistribution-compatible licensing; a public
  image URL alone is insufficient.
- Profiles use stable opaque canonical identifiers; duplicate merges redirect
  source URLs, preserve association history, and remain reversible.
- Account deletion and Profile Claim revocation do not delete an independent
  Profile; removal uses eligibility, identity, privacy, safety, rights, or legal
  grounds with generic public tombstone behavior.
- Reviews attach to profiles and require a claimed first-hand relationship.
- Reviews contain qualitative text plus a relationship-grounded assessment.
- A Relationship Claim must be accepted before publication; acceptance may be
  self-attested or independently relationship-verified, and neither state
  verifies the Review's story or assessment.
- Public relationship context is directional type, coarse duration, optional
  approved coarse years, and verification state; exact dates, organization or
  project, evidence, method, and reviewer Account remain restricted.
- One Account may have one active Review for the same Profile and continuous or
  overlapping relationship period; a materially distinct later engagement
  requires moderation before another Review.
- LARP Score is a first-class score; a higher LARP Score means a larger gap
  between public startup persona and observed substance.
- The launch Assessment uses LARP, Domain Expertise, On Time, Taste, GTM,
  Charisma, and Run it back. Taste and GTM appear only with relevant direct
  exposure, and no scores are combined into a Founder Score.
- Reviewers may choose **Not enough exposure** instead of inventing a score.
- Accounts are introduced progressively and have no mandatory profile setup.
- Launch Account sign-in uses Google, Apple, or a one-time email link; matching
  emails never silently merge Accounts.
- A profile may exist without an account; messaging requires a claimed profile.
- Publicly anonymous Reviews use **Anonymous reviewer** without a stable
  cross-Review pseudonym; the accountable Account link remains private.
- Profile Claims verify scoped control through authoritative-control evidence
  or human review, not a matching name, email domain, or photo alone.
- The Feed ranks Reviews and Posts, not people.
- Posts are named and distinct from Reviews; they cannot contain Review scores
  or bypass Relationship Claims for evaluating a person.
- Named Posts and ordinary Comments require a Public Byline with a display name
  and optional photo, never a claimed Profile.
- Posts may discuss startup work, products, companies, markets, events,
  resources, and industry ideas using up to 2,000 Unicode grapheme clusters,
  up to four moderated images, and safe HTTP(S) links. A Post whose central
  purpose is to evaluate an identifiable person's working behavior is redirected
  to the Review flow.
- Posts have no Like, upvote, downvote, repost, poll, Verdict, or Award at
  launch; their lightweight participation action is discussion.
- Each Review may be published with the reviewer's Public Byline or as
  **Anonymous reviewer**.
- A named Review may permanently step down to **Anonymous reviewer** after a
  warning; an anonymously published Review cannot later become named at launch.
- A verified Profile claimant is notified only after Review publication and may
  file one moderated Profile Subject Response plus correction or dispute
  requests without gaining editorial or takedown control.
- Every published Review and Post has Account-backed Comments. Ordinary
  commenters use their Public Byline; only an anonymous Review's author may
  appear as **Review author**, and only inside that Review's thread.
- Comment Threads render top-level Comments plus one visible reply level in
  deterministic oldest-first order. Post and Review authors may mute discussion
  but cannot remove criticism; moderators own locks, slow mode, and removal.
- Comments support up to 1,000 Unicode grapheme clusters and safe HTTP(S) links;
  Comment attachments are deferred at launch.
- A Profile Subject Response remains a separately moderated Review object, not
  a Comment or a Comment moderation role.
- Design G is an interaction reference, not the product layout.
- The Caseboard is the current unique layout direction.
- Every published Review can receive an Account-backed upvote or downvote.
- Review Votes display a public net score only; positive and negative counts
  remain private and ranking uses confidence-adjusted quality rather than raw net.
- Verdict Votes are deferred at launch and require a later proposal to return.
- Eligible Accounts receive one non-stackable Award Credit each Monday 00:00
  UTC period after a verified contact, seven full Account days, eligible state,
  and current risk approval.
- Multiple Accounts may Award the same Review; an Account cannot Award its own
  Review.
- Community notifications appear in an Account-private in-app inbox by default;
  discussion and Award email require opt-in, while a claimed-Profile Review
  publication email may be disabled and individual Review Votes never notify.
- Images are encouraged but optional, moderated exhibits rather than proof.
- Trending uses a simple inspectable ranker at launch; Latest remains
  chronological.
- Profiles, Reviews, and Comments can generate exact, canonical Share Clips.
- Profiles, Reviews, Posts, Comments, and approved Profile Subject Responses
  have tracking-free canonical Share links; responses open within Review
  context and Profile Aggregates have no standalone share object.
- Share Clips launch as deterministic square, story, and link-preview PNGs;
  source words and mandatory context are locked, Exhibits are excluded by
  default, and native sharing always has link/download/accessibility fallbacks.
- Launch social graph is private one-way Profile Follow only; it has no public
  counts or lists, does not imply relationship, and never targets an unlinked
  Public Byline or anonymous author.
- Message requests default off, require a verified-contact sender and ordinarily
  a Public Byline, apply pair and Account quotas, and open a one-to-one
  conversation only after acceptance without creating a Connection or Follow;
  the contextual Open To path instead uses a current verified claimed Profile
  after separate participation and introduction consent.
- Accepted DMs support text and safe links, local archive/mute/delete, and
  report/Block, while attachments, previews, read receipts, unsend,
  disappearing messages, groups, and calls are deferred.
- Open To is a mutually visible claimed-Profile mode with a 14-day auto-expiry
  and immediate revocation; a non-revocable two-week lock is rejected.
- Open To has no discovery pool: it decorates Profiles found through ordinary
  product context only, and message introductions require a second consent.
- Open To uses **Hook up**, **Date**, and **Relationship**; **DTF** is not a
  separate status label.
- Profile-level aggregates require sufficient Review volume.

## Open questions

The Open To discovery, message-consent, and intention-label questions are
resolved above and in `add-open-to-mode`. The remaining cross-product question
is:

1. Is **fuckmycofounder.com** the enduring name of the whole startup network,
    the name of its Review product, or a provocative acquisition surface?

### Deferred GTM questions

These do not block feature specifications:

- Is the SF pre-seed through Series A founder/operator cell the launch wedge,
  or does the founding team have a denser relationship graph elsewhere?
- May a Profile owner initiate a neutral relationship request, or must Review
  invitations originate from the platform?
- Is **FMCF** the restrained mark on professional identity, event, and partner
  surfaces?
- What response-time promise can the founding team and disclosed community
  hosts maintain during a private cohort?

## Specification boundary

When this document is accepted, it should be converted into reviewable OpenSpec
changes covering at least:

- Accounts and progressive authentication.
- Profile discovery, creation, correction, claiming, and merging.
- Relationship claims and verification.
- Review drafting, assessment, moderation, publication, editing, and removal.
- Public Bylines and named Post authoring.
- Profile presentation and aggregation.
- Mixed Feed ranking, reactions, polls, Posts, and Comments.
- Share Clips and canonical external sharing.
- Replies, notifications, and direct messages.
- Open To eligibility, visibility, expiry, revocation, and safety.
- Trust, safety, privacy, disputes, and moderation operations.

The specifications must resolve the open questions rather than copying them as
implementation ambiguity.
