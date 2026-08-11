# Cold-start patterns for a founder social and review network

**Research date:** 2026-08-04
**Question:** How can a new network for founders, investors, operators, and startup people acquire Accounts and create enough Profiles, Reviews, Posts, and Comments to feel alive without sacrificing trust?

## Executive recommendation

Do not launch as an empty global feed. Launch as a **dense, verified micro-network** for one startup graph, supported by three acquisition loops:

1. **Utility loop:** public Profile pages, founder tools, and searchable reference material provide value before the social graph is dense.
2. **Invitation loop:** a Compatibility Test, Profile claim, Review response, or named Post recruits a specific second person into an already-relevant context.
3. **Conversation loop:** a hand-picked founding cohort guarantees that legitimate Posts and Reviews receive useful comments quickly.

The right precedent is Product Hunt's small group of hand-picked contributors, not Reddit's fake personas. Public anonymity can increase candid Review supply, but the platform should know that each reviewer is a real startup participant and enforce first-hand relationship rules. This is the combination used by professional communities such as Blind and Fishbowl.

## What the first-party evidence actually shows

### Product Hunt: recruit contributors before building a general audience

Product Hunt began as an email experiment. Ryan Hoover invited startup friends to contribute, announced it in communities where he already participated, and reported **170 subscribers and 30 hand-picked contributors within two weeks**. Before opening its full site, the team asked early email users for feedback and beta-tested with a few dozen people. These figures and steps come from Hoover's own accounts, not reconstructed growth folklore. ([The Wisdom of the 20-Minute Startup](https://medium.com/@rrhoover/the-wisdom-of-the-20-minute-startup-368d093ecb89), [Making Product Hunt](https://www.ryanhoover.me/post/making-product-hunt))

Product Hunt's current launch guidance still tells makers to participate in the community before launch, use channels where they already have relationships, and respond to comments throughout launch day. It explicitly prohibits paying for upvotes. ([Product Hunt launch timeline](https://www.producthunt.com/stories/launch-timeline))

**Implication:** recruit the supply side by name. A founding cohort should know that its role is to create the tone, submit useful material, and answer other members—not merely join a waitlist.

### LinkedIn: Profiles and invitations were the early product, not a content feed

Reid Hoffman's account says LinkedIn launched with a professional Profile, connections, people search, and messaging. Initial invitations stalled; the team responded to observed behavior by adding address-book import, which Hoffman credits with helping LinkedIn pass one million Profiles. ([Reid Hoffman's launch account](https://www.linkedin.com/pulse/7-counterintuitive-rules-growing-your-business-from-reid-ch%C3%A9ret))

LinkedIn's 2011 filing describes invitations as a direct membership loop: a non-member who accepts becomes a member connected to the sender. LinkedIn later optimized public Profile pages for search engines and for converting guests into members. ([LinkedIn S-1](https://www.sec.gov/Archives/edgar/data/1271024/000119312511314369/d250692ds1a.htm), [LinkedIn Engineering on public Profiles](https://www.linkedin.com/blog/engineering/archive/speed-performance-and-public-profile))

**Implication:** a Profile should be useful and shareable even when its owner has not built a feed. Every Profile claim, connection request, and Review response should open into an existing social context instead of a generic signup screen. Do not copy LinkedIn's address-book collection by default; explicit, person-selected invitations are safer and more legible.

### Glassdoor: a contribution can unlock high-intent data

Glassdoor documented a “give-to-get” model: contributing a Review, office photo, or salary report unlocked access to its data. Registration required a verifiable sign-in; submissions were screened before publication, while access was granted when the submission was received. ([Glassdoor's description of give-to-get](https://www.glassdoor.com/about/press-release/glassdoor-launches-in-france/))

Glassdoor also says it combines automated detection and human moderation, prohibits multiple Reviews of the same company, and does not allow employers to pay to remove negative Reviews. ([Glassdoor Trust and Transparency](https://www.glassdoor.com/about/trust/))

**Implication:** reciprocity can create supply, but it should unlock an additive benefit rather than hold all public information hostage. For example, a verified Account can browse public Profiles; completing its own Profile unlocks voting and weekly Awards; a relationship-backed Review can unlock deeper aggregate insights. Moderation must remain independent of Profile owners and paying customers.

### Rate My Professors: community-created Profiles need verification and strict contribution limits

Rate My Professors says all Professor Profiles are community-submitted, but newly added Profiles are moderator-verified before they can be reviewed. Ratings are limited to people with first-hand classroom experience, one rating per person per course; every rating is read by moderators, and dogpiling can trigger removal and account locks. Profile subjects can claim an account, reply, and receive alerts. ([Profile creation flow](https://help.ratemyprofessors.com/article/5-add-professor), [Rate My Professors guidelines](https://www.ratemyprofessors.com/guidelines))

**Implication:** letting anyone create a Profile can seed the entity graph, but Profile creation is not the same as immediate publication. Search-before-create, duplicate detection, moderator verification, first-hand Relationship Claims, submission limits, and a claim/reply path must ship together.

### Blind and Fishbowl: anonymous in public, accountable to the platform

Blind gives work-email-verified members read/write access and private company spaces, while personal-email members receive more limited access. It separates verification information from anonymous activity, opens a company channel only after 30 members join, moderates Reviews, delays new-account DMs, and caps free DMs to reduce spam. ([How to join Blind](https://help.teamblind.com/article/67-how-to-join-blind), [Blind FAQ](https://us.teamblind.com/faq))

Fishbowl similarly describes itself as a verified professional network, using company email or LinkedIn verification, while allowing a member to choose a name-, company-, or title-level identity for each Post. ([Fishbowl FAQ](https://www.fishbowlapp.com/faq/))

**Implication:** Review anonymity should be a display choice, not an unverified account state. Named Posts and anonymous Reviews can coexist under one verified Account. Do not reveal reviewer identity to the Profile subject, but retain enough internal integrity signals to enforce one-person limits and investigate abuse.

## Evidence versus folklore

| Claim | Evidence status | Decision |
|---|---|---|
| Hand-pick the first contributors | Directly documented by Product Hunt's founder, including cohort size and early results | Use |
| Give contributors access to additional value | Directly documented by Glassdoor | Test carefully; never hide safety or basic Profile facts |
| Verify professional status while allowing public anonymity | Current first-party Blind and Fishbowl product rules | Use for Reviews |
| Let the community create missing Profiles | Current first-party Rate My Professors rules, with pre-publication verification | Use with moderation and deduplication |
| Public Profiles can acquire users through search and sharing | LinkedIn engineering documentation | Use, subject to privacy and indexing controls |
| Populate the site with fake users because Reddit did | Reddit founders have described seeding content under multiple accounts; the common causal claim that this created Reddit's success is not established, and impersonation is especially corrosive for a people-review product | Reject; staff seed transparently under labeled identities |
| A referral waitlist or launch-day leaderboard creates a durable network | No causal evidence found in the first-party sources reviewed | Do not make it the GTM strategy |
| A broad Product Hunt launch solves network cold start | Product Hunt documents launch attention, not durable local density for another social graph | Treat as an announcement after the first wedge works |

## Recommended product-level cold-start system

| Inventory needed | Why a person contributes | Initial mechanism | Trust constraint |
|---|---|---|---|
| **Accounts** | Claim a Profile; respond; vote/comment; receive a weekly Award; message relevant people; save tools or results | Apple/Google/email signup followed by optional startup-status verification | Browse without an Account; progressively ask for verification when the action creates risk |
| **Profiles** | Be findable; control one's name/photo; receive relevant opportunities; reply to Reviews | Claim flow plus moderated community submission; direct claim invitation | Search-before-create, dedupe, source/identity review, corrections and appeals |
| **Named Posts** | Get a useful answer, find a collaborator, demonstrate expertise, or share a build/update | Recurring high-utility prompts; founder AMAs; guaranteed early response from founding cohort | Named Account; topic and self-promotion rules; rate limits |
| **Reviews** | Help the network make a consequential decision while choosing named or anonymous display | Relationship-first Review flow; private draft; clear audience and impact preview | Platform-verified reviewer, first-hand Relationship Claim, one relationship-period limit, moderation before reach |
| **Comments** | Answer a concrete question, add context, earn trusted visibility, or respond to one's own Profile/Post | Invite specific qualified people to a thread; notify authors and mentioned/claimed Profiles; feature substantive replies | No generic comment bounties; voting, rate limits, brigading detection, and author controls |

The existing **Cooked Quiz**, **Compatibility Test**, **pattern library/toolkit**, **share-card engine**, and **weekly aggregate report** are useful acquisition assets. The Compatibility Test is particularly strong because its value requires a second participant, making the invitation the product rather than a marketing add-on. Quiz results and prevention tools can generate demand before enough person-level Reviews exist, while aggregate reports should launch only after privacy thresholds and enough representative data exist.

## Recommended GTM sequence

### Phase 0: choose one graph and recruit its supply

- Select one dense, bounded wedge—not “everyone in startups.” Examples to evaluate include one accelerator/alumni graph, one startup city plus sector, or one founder role community.
- Recruit roughly **30–50 founding contributors**, following the scale Product Hunt actually documented. Balance founders, operators, angels, and investors so one constituency cannot define the culture.
- Ask each contributor for a specific commitment: claim/create a Profile, write one useful named Post, and answer a small number of relevant threads during the beta.
- Seed staff Posts and prompts under clearly labeled staff identities. Never fabricate people, Reviews, votes, or comments.

### Phase 1: private beta with a response guarantee

- Open Profile search, claims, named Posts, comments, Review drafts, and the Compatibility Test to the wedge.
- Operate a concierge response desk: route each legitimate unanswered Post to two or three qualified founding contributors. The product must demonstrate “people like me answer here” before algorithmic ranking matters.
- Moderate every Profile creation and Review before broad distribution. Let named Posts use a faster risk-based queue.
- Send a compact weekly digest containing useful threads, new claimed Profiles, an aggregate insight, and the member's refreshed Award.

### Phase 2: public reading and object-level acquisition

- Make safe Profile pages, named Posts, approved Reviews, and comments individually linkable with distinctive share cards and useful logged-out landing pages.
- Give every invitation a reason and destination: “claim your Profile,” “answer this cofounder question,” “compare compatibility,” or “respond to this Review.” Avoid generic “join my network” invitations.
- Publish the pattern library and founder tools for search demand. Link each high-intent page to the relevant conversation or Profile action.
- Partner with a few accelerators, founder communities, newsletters, or coworking groups on a useful prompt, AMA, or private cohort—not a blast to an undifferentiated mailing list.

### Phase 3: expand only after local liquidity exists

Expansion gates below are **operating hypotheses, not evidence-backed universal constants**:

- Most eligible Posts and Reviews receive several genuine votes and at least one substantive comment within 24 hours.
- New members encounter multiple relevant Profiles and active threads without following strangers manually.
- Review reports, duplicates, and moderator reversals are stable enough that a larger cohort will not overwhelm trust operations.
- A meaningful share of new Accounts arrive through object-specific invitations or shared pages and then complete a core action.

Add the adjacent startup graph only after those conditions hold. Preserve a global “Latest” surface, but rank the main feed around relevance and graph density rather than global outrage.

## Ranked tactics by fit

1. **Founding contributor cohort plus response guarantee** — best way to create authentic supply and establish culture; directly supported by Product Hunt's founding approach.
2. **Compatibility Test and Profile-claim invitations** — recruit a specific second person into a useful context; fits the existing product assets and the LinkedIn invitation pattern.
3. **Verified Account with per-Review anonymity** — unlocks candid supply without accepting unaccountable Reviews; strongly supported by Blind and Fishbowl mechanics.
4. **Public, shareable, indexable object pages** — lets Profiles, Posts, Reviews, and tools acquire users independently; supported by LinkedIn's public Profile strategy.
5. **Moderated community Profile creation** — fills the directory even before every subject joins, with the verification and claim safeguards demonstrated by Rate My Professors.
6. **Selective give-to-get** — use completion of a Profile or first legitimate contribution to unlock voting, Awards, or deeper aggregate insights; supported by Glassdoor, but test conversion and resentment carefully.
7. **Weekly editorial ritual** — digest, refreshed Award, one founder prompt, and aggregate insight create a predictable return moment; treat this as retention infrastructure, not artificial streak gamification.
8. **Partner-led cohort launches and AMAs** — useful for adding the next dense graph once the first is liquid; the partner must bring a real conversation, not just impressions.
9. **Broad launch campaigns** — useful only after retention and density exist. Product Hunt, X, podcasts, and press amplify a working loop; they do not create one.

## What not to do

- Do not pre-fill Reviews, votes, comments, or follower counts with fabricated activity.
- Do not optimize early ranking for raw engagement; identifiable-person controversy will manufacture activity while destroying trust.
- Do not pay for Reviews, comments, referrals, or votes. Incentives attract low-integrity supply and complicate moderation.
- Do not require invasive verification during the first screen. Ask for the minimum Account first, then verify at the moment a user Reviews, DMs, or accesses a sensitive community.
- Do not launch dating/availability visibility as a cold-start hook. It is a separate mutual-consent network with unusually high safety risk and could obscure the professional value proposition.
- Do not expand geography or audience merely because signup count is growing. Expand when conversations inside the first graph are reliably useful.
