# GTM Wedge for a Startup Reputation Network

Status: research note and launch recommendation, 2026-08-04. This is not yet a
product decision. The current product definition remains authoritative.

## Executive recommendation

Do not launch as "LinkedIn for everyone in startups." Launch as the place where
**San Francisco early-stage founders and founding operators answer one useful
question: _who would you actually run it back with?_**

The initial wedge should be:

- **Audience:** pre-seed through Series A founders and founding operators who
  are choosing cofounders, early employees, advisers, or investors.
- **Geography:** San Francisco and the immediate Bay Area until the Feed has
  local density.
- **Core signal:** relationship-backed Reviews, led by **Run it back?**, plus
  named Posts that let people participate without reviewing someone.
- **Acquisition utility:** the existing Cooked Quiz, two-player Compatibility
  Test, founder-safety Toolkit, and distinctive Share Clips.
- **Launch vehicle:** a 30-day, invitation-led **Would You Run It Back?** cohort,
  followed by an in-person event during SF Tech Week, October 5-11, 2026.

This sequencing makes the product useful before the social graph is large:

1. A person arrives for a quiz, compatibility check, event, or shared object.
2. They create or claim their Profile to save the result or join the discussion.
3. They invite people they have actually worked with.
4. Those people contribute a Review, complete a paired test, comment, or claim
   their own Profile.
5. Each contribution creates a new shareable object and a notification loop.

The broad founder/investor/operator network is the destination. It is not a
credible cold-start audience.

## What the market evidence says

### The need is real, but matching and directories are not open territory

Y Combinator reported that 20% of active Startup School founders were seeking a
cofounder and 25% of aspiring founders considered not having one a blocker. Its
matching beta produced 9,000 matches among 4,500 founders. YC explicitly
recommends a time-boxed trial project rather than treating a profile match as
proof of compatibility. That creates an opening for a network centered on what
people learned **after working together**, rather than another preference-based
matching tool. [YC cofounder-matching launch](https://www.ycombinator.com/blog/co-founder-matching/)

There are already credible products for each adjacent transactional job:

- [CoffeeSpace](https://www.coffeespace.com/) says it has more than 30,000
  users, 65,000 matches, and a median of three first-week matches.
- [NFX Signal](https://signal.nfx.com/faq) is a free community-driven investor
  discovery network for founders, VCs, scouts, and angels.
- [Wellfound](https://wellfound.com/) positions itself as the startup hiring
  marketplace and currently advertises 27,000 startups and 10 million opted-in
  candidates.
- [Techstars](https://www.techstars.com/portfolio) publishes a searchable
  portfolio and reports 10,966 accelerated founders.

Consequently, "find startup people" is not a launch wedge. The differentiated
job is **relationship evidence and founder reputation**, expressed in a format
that feels more candid and alive than LinkedIn recommendations.

### Dense communities already exist; the product should ride them

The best early distribution is concentrated and relationship-rich:

- [a16z Tech Week](https://www.tech-week.com/) describes SF Tech Week as seven
  days with hundreds of events across the Bay. The 2026 SF dates are October
  5-11. Hosts can submit their own panels, dinners, launches, hackathons, or
  meetups, and the [host form](https://www.tech-week.com/host) lists an August
  21 deadline for priority consideration.
- [SHACK15](https://www.shack15.com/ventures) describes a 2,000-person
  entrepreneur, innovator, and investor community in San Francisco's Ferry
  Building.
- [Founders Running Club](https://lu.ma/ubtb4lb2) describes a recurring SF-born
  community spanning founders, investors, operators, and creators. Its events
  supply repeated, low-cost contact rather than one-off conference traffic.
- [SaaStr Annual](https://www.saastrannual.com/networking) markets a Bay Area
  gathering of more than 10,000 founders, executives, and VCs, including 3,000
  scheduled one-to-one meetings. It is a later-stage distribution opportunity,
  not a day-one dependency.

These are not invitations to spam attendee lists. They are evidence that event
hosts and recurring local communities are better partners than a city-wide ad
campaign. Any attendee import should be opt-in and approved by the organizer;
public pages should be used for market mapping, not assumed redistribution
rights.

### Public launch channels expect a working product

[Show HN's official guidelines](https://news.ycombinator.com/showhn.html) ask
makers to provide something people can try, ideally without signup or email,
and explicitly reject landing pages. [Product Hunt's featuring guidelines](https://help.producthunt.com/en/articles/9883485-product-hunt-featuring-guidelines)
prioritize live, useful, novel, high-craft products and say directories and
waitlists are not featured. Product Hunt also recommends that makers post their
own product and start the discussion in the first comment. [Product Hunt launch
instructions](https://help.producthunt.com/en/articles/479557-how-to-post-a-product)

Therefore neither Product Hunt nor Show HN should be used for a waitlist
announcement. Launch there only when a visitor can browse real content, take a
quiz or compatibility flow without an account wall, and understand the product
before being asked to join.

## The cold-start system

The product has four separate cold starts. Account count alone does not solve
any of them.

| Cold start | Failure mode | Launch solution |
|---|---|---|
| Profiles | Search returns empty or unclaimed people | Concierge-claim 25 anchor Profiles; let each anchor nominate collaborators |
| Reviews | Nobody wants to be the first public critic | Begin with requested, relationship-backed Reviews and make `Run it back?` the lead signal |
| Feed | A visitor sees too little relevant content | Add named Posts, editorial prompts, quizzes, and local event recaps alongside Reviews |
| Trust | Anonymous allegations make the product feel unsafe | Require an Account and relationship claim for Reviews; moderate before reach; never reward negativity |

The operating principle is **seed relationships, not records**. Mass-importing
thousands of empty names from public directories may make search look populated,
but it supplies neither trust nor a reason to return. It also maximizes backlash
for a provocative brand. Public directories such as YC, Techstars, NFX Signal,
and Wellfound can identify ecosystems and potential partners; their existence
does not imply permission to scrape or republish people.

### The minimum complete local network

A Profile becomes useful when it has:

1. an owner claim or an accurate public identity;
2. two contributions from distinct, relationship-backed people;
3. one recent activity surface: a named Post, comment thread, Review, or open-to
   signal; and
4. enough neighboring Profiles that search and the Feed have meaningful local
   alternatives.

The launch team should measure the count of these **Complete Local Profiles**,
not merely registrations.

## Initial product package

### 1. The identity entry point

Signup should produce a useful object in under two minutes:

- Create or claim Profile.
- Add startup role, company, location, and one verified external link to the
  Account layer; the public Profile can retain the current name-and-photo
  simplicity.
- Choose one current intent: building, looking for a cofounder, hiring,
  advising, investing, or just browsing.
- Publish a restrained Founder Card or keep it private.

Do not require a resume import, full employment history, contact upload, or five
follow decisions during onboarding.

### 2. The relationship loop

After Profile creation, ask:

> Who are two people you have actually built with?

The user can send a private, single-purpose request for a structured Review or
`Run it back?` answer. The recipient sees the relationship choices before the
text box. The invitation should say that honesty is expected and that the
sender cannot choose the answer. Never reward positive Reviews or condition a
perk on a favorable rating.

The invite creates a legitimate reason to make an Account. After contributing,
the recipient is prompted to claim or create their own Profile and request
their own references. This is the primary account loop.

### 3. The utility loop

The historical feature exploration already contains two useful acquisition
products:

- **Cooked Quiz:** useful alone, immediately shareable, and capable of driving
  search traffic around cofounder problems.
- **Compatibility Test:** inherently recruits a second participant, because a
  result cannot be completed alone.

Quiz completion should not require signup. Saving history, comparing over time,
commenting on a result, or publishing an opt-in card can require an Account.
Private compatibility answers must stay private by default.

### 4. The content loop

Named Posts solve a structural problem: most people will not have a defensible
Review to write every week. Weekly editorial prompts can create regular supply:

- "What did you learn the expensive way this week?"
- "What would you ask before splitting equity again?"
- "Who helped you ship, and what did they do?"
- "What is one investor behavior founders should normalize?"

Posts should lead to comments, Profile opens, and follows. Reviews remain the
distinctive reference layer; Posts keep the network alive between Reviews.

### 5. The share loop

Every Profile, named Post, eligible Review, comment, quiz result, and aggregate
stat gets one canonical URL and an ownable Share Clip. The external object must
be legible without login and make the source recognizable even as a screenshot.

Use the existing Share Engine concept:

- link-unfurl card for X, LinkedIn, Slack, iMessage, WhatsApp, and Discord;
- square downloadable card for Instagram;
- vertical downloadable card for Stories, Reels, and TikTok;
- native share sheet on mobile and copy-link on desktop;
- no redistribution of Review media or quoted comment text unless that content
  is explicitly eligible to be shared.

The card should carry one provocative line and one trustworthy context line,
for example:

> **Would you run it back with Alex? 8 of 9 said yes.**
> Relationship-backed responses on FMCF.

Avoid public rankings of real people. Aggregate pattern cards and personal
cards chosen by the Profile owner are safer and more shareable than a "worst
founders" leaderboard.

## The first campaign: Would You Run It Back?

Run a four-week, invitation-only SF cohort before the public launch.

### Anchor group

Recruit 25 people directly:

- 10 founders;
- 8 founding engineers, designers, or GTM operators;
- 4 angels or scouts who have operating experience; and
- 3 community hosts or startup-house organizers.

Select for relationship density and willingness to post, not follower count.
Each anchor agrees to create one named Post, invite three past collaborators,
and attend one feedback session. No one agrees to praise the product or post a
positive Review.

### Weekly sequence

| Week | Product action | External hook |
|---|---|---|
| 1 | Claim Profile and publish Founder Card | "The honest startup network I wish existed" |
| 2 | Invite three relationship-backed responses | "Would your old team run it back?" |
| 3 | Complete the Compatibility Test with one person | Opt-in pair result; private by default |
| 4 | Publish a named lesson or founder field note | Best comments become consented Share Clips |

Close the cohort with a small, moderated **Run It Back Office Hours** event:
short founder stories, a compatibility workshop, and live demos. Submit a
larger version as an SF Tech Week side event before the official August 21 host
deadline. The Tech Week page says creative formats including launches, dinners,
panels, and experiential events are accepted, making this a more natural fit
than a generic launch party. [Tech Week host guidance](https://www.tech-week.com/host)

## Channel strategy

### Use now

1. **Founder-led invitations.** Handwritten outreach from the team and 25
   anchors. The CTA is to create a useful Profile or complete a relationship
   request, not "join our social network."
2. **Recurring SF community hosts.** Offer a free co-branded compatibility
   workshop, event recap surface, or private organizer dashboard. Do not ask
   organizers to endorse individual Reviews.
3. **X and LinkedIn organic sharing.** Share Founder Cards, comments, quiz
   outputs, and founder lessons. The destination must work without login.
4. **Founder problem SEO.** Publish the prevention Toolkit and red-flag pattern
   library around real searches such as vesting disputes, equity splits,
   cofounder breakups, and trial-project checklists.
5. **Show HN and Product Hunt after liquidity.** Wait until the product is
   usable and populated. Do not solicit coordinated votes; Show HN explicitly
   forbids asking friends to upvote or comment.

### Use after 1,000 accounts

1. **Accelerator and cohort pilots.** Package a private compatibility exercise,
   opt-in Profile claiming, and aggregate cohort insights. Start with independent
   communities and founder houses before asking a major accelerator to carry
   brand risk.
2. **Podcasts and newsletters through proprietary data.** A pitch such as
   "What 1,000 relationship-backed founder Reviews reveal" is stronger than a
   product announcement. [StrictlyVC](https://strictlyvc.com/newsletter/)
   explicitly serves venture capitalists and entrepreneurs; [This Week in
   Startups](https://www.thisweekinstartups.com/about) focuses on founders,
   investors, and operators. Earned analysis should precede paid sponsorship.
3. **Aggregate State of the Cofounder report.** Publish only after meaningful
   sample sizes and disclosure of methodology. Apply a minimum cell size so no
   aggregate stat can identify a person.
4. **Investor entry.** Invite investors to claim Profiles, answer named founder
   questions, and participate in discussions. Do not lead with "come get rated."

### Defer

- Paid acquisition before activation and retention are proven.
- Broad influencer sponsorships.
- Campus-by-campus or city-by-city expansion.
- Mass cold email based on scraped founder directories.
- Buying or rewarding Reviews.
- A real-person leaderboard.

[Google Ads' policies](https://support.google.com/adspolicy/answer/6008942)
list profane language as inappropriate content in ads, so the uncensored brand
already makes some paid distribution unreliable. This reinforces an organic,
referral, community, and earned-media launch.

## Partnerships worth pursuing

| Partner type | What they receive | What FMCF receives | First ask |
|---|---|---|---|
| Founder meetup or run club | Free workshop, recap page, share cards | 20-50 dense opt-in users | Co-host one compatibility session |
| Startup house or coworking community | Private onboarding hour and member directory links | Repeated weekly participation | Recruit five anchor members |
| Accelerator or fellowship | Private paired test and aggregate cohort themes | A trusted cohort and references | Pilot with one small alumni group |
| Founder podcast/newsletter | Original aggregate data and stories with consent | Credibility and qualified traffic | Brief the host after 1,000 accounts |
| Startup conference | Useful side event rather than booth swag | Concentrated acquisition | Host Run It Back Office Hours |

Avoid partnerships whose only value is a logo. A partner must control a real,
repeated relationship graph or a trusted audience.

## Milestones from 0 to 10,000 accounts

The numeric thresholds below are launch hypotheses, not industry benchmarks.
Revise them after the first 100 people.

### 0 to 100 accounts: prove the atomic loop

Time box: four weeks.

Actions:

- Recruit 25 anchors by hand.
- Concierge-create or claim their Profiles.
- Each anchor publishes one named Post and sends three relationship requests.
- Hold two small moderated onboarding sessions.
- Interview every user who fails to invite or contribute.

Exit gates:

- 100 real Accounts, at least 60 claimed Profiles.
- 40 Complete Local Profiles.
- 75 relationship-backed contributions from at least 50 distinct contributors.
- 25 named Posts with at least one substantive comment each.
- At least 40% of new Accounts complete activation within seven days.
- At least 30% of activated Accounts return in week four.
- Every report and identity dispute reviewed by a human within 24 hours.

If invited recipients do not contribute, do not add growth channels. Fix the
request, trust model, or value proposition first.

### 100 to 1,000 accounts: prove repeatable community acquisition

Time box: the following eight to twelve weeks.

Actions:

- Enlist ten recurring community hosts, each with a trackable invitation path.
- Run three cohort or startup-house pilots.
- Publish two named editorial prompts each week.
- Launch the Compatibility Test and Share Clips broadly.
- Open Show HN and Product Hunt only after anonymous visitors can use a real
  product and browse a credible Feed.

Exit gates:

- 1,000 Accounts and at least 500 claimed Profiles.
- 300 Complete Local Profiles.
- At least half of new Accounts come through person-to-person or partner
  invitations rather than founder-team outreach.
- Invitation-to-contribution conversion is at least 25%.
- Activated-account day-28 retention is at least 25%.
- At least 250 people contribute in a typical week.
- No single community supplies more than 25% of weekly Feed inventory.
- Safety response times remain within the published policy under 10x volume.

### 1,000 to 10,000 accounts: prove a network, not a cohort

Time box: three to nine months after the 1,000-account gate.

Actions:

- Expand to New York only after SF meets the density and retention gates for
  four consecutive weeks.
- Partner with 30-50 recurring communities across no more than two cities.
- Publish the first methodology-backed State of the Cofounder report.
- Add investor and accelerator programming without changing the founder-first
  Feed objective.
- Build city-level cold-start playbooks from the SF evidence.

Exit gates:

- 10,000 Accounts and 4,000 claimed Profiles.
- 2,000 Complete Local Profiles.
- 2,000 weekly contributors and 3,000 additional weekly readers.
- Activated-account day-28 retention stays at or above 25%.
- At least 60% of acquisition is attributable to member invitations, organic
  shares, search, or partners rather than paid media.
- The second city reaches 150 Complete Local Profiles within eight weeks
  without lowering review or safety standards.

Do not launch a third city merely because registrations arrive there. A city
opens only when enough connected people agree to seed it.

## Metrics

### North-star metric

Track **Weekly Complete Local Profiles**: claimed Profiles with at least two
distinct relationship-backed contributions and a meaningful Profile, Post,
Review, comment, DM, or follow interaction in the last 28 days.

This measures whether the network is generating useful, current reputation—not
whether it collected email addresses.

### Seven-day activation

An Account is activated after it:

1. creates or claims a Profile;
2. makes one meaningful contribution or completes a paired Compatibility Test;
   and
3. sends at least two legitimate relationship or content invitations.

Track both activation rate and the percentage of those invitations that create
a contribution. The latter is the truer cold-start signal.

### Supporting measures

- Profile claim completion and time to first useful object.
- Relationship-request send, open, start, and publish conversion.
- Share Clip creation, external click-through, and click-to-account conversion.
- Feed supply by Posts versus Reviews and by author/community concentration.
- Weekly contributor, commenter, and reader retention separately.
- Profile-search success: searches with a relevant result and useful next
  action.
- Report rate, upheld-report rate, appeal rate, moderator response time, blocks,
  and coordinated-activity detection.
- Percentage of named, anonymous, and relationship-verified contributions.

Never use raw time-on-site, outrage comments, or negative vote volume as the
primary success metric. Those optimize the product toward the exact behavior
that makes professional Profiles unsafe.

## Brand decision

### What the name does well

`fuckmycofounder.com` is memorable, immediately communicates emotional stakes,
and gives founders a sentence they will repeat to friends. It can make quizzes,
events, Share Clips, and earned-media pitches much more noticeable than another
generic startup-network name. This advantage is strongest at the top of the
funnel.

### What the name costs

The same name creates four material constraints:

1. People may not put the uncensored domain beside their legal name, employer,
   or fundraising history.
2. Accelerator, university, and VC partners may decline to place it on an
   official calendar or email.
3. Google lists profane language as inappropriate ad content, reducing paid
   channel reliability. [Google Ads policy](https://support.google.com/adspolicy/answer/6008942)
4. A mobile app combining identifiable ratings, anonymous contributions, DMs,
   and hookup intent will face unusually high platform scrutiny. Apple's
   current guidelines require filtering, reporting, blocking, and published
   contact information for UGC; they also say services used primarily for
   anonymous bullying or objectification of real people do not belong in the
   App Store. [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

The risk is larger than profanity alone: the name frames ambiguous content as
hostile before a partner or moderator sees the actual safeguards.

### Recommendation: one voice, two presentation levels

Keep the domain and provocative editorial voice for discovery, but use **FMCF**
as the default product mark on Profiles, professional Share Clips, partner
decks, and event materials. Let users choose a restrained sharing treatment.
Do not pretend the acronym hides the domain; it simply gives professional users
a surface they are willing to attach to their names.

If the long-term goal truly is the professional identity layer for founders and
investors, reserve the option to place the network under a neutral product name
while `fuckmycofounder.com` remains its media, quiz, and culture engine. Keeping
the uncensored name on every identity surface is a deliberate ceiling on
institutional distribution, not a free brand win.

The initial launch should be web-first. This is not because a native product is
unimportant, but because the current combination of UGC, identifiable reviews,
anonymity, messaging, and sexual/relationship intent is directly adjacent to
several App Store rejection categories. Prove moderation and user value before
making app review a critical path.

## Decisions needed before recruiting anchors

1. Is `Run it back?` the lead launch signal, with the other founder-fit metrics
   available inside the Review, or are all scores equally prominent?
2. Can a Profile owner privately request a Review without being able to learn
   whether its author chose anonymity?
3. Does a new Profile need an owner claim before appearing in external Share
   Clips, even though anyone may create the underlying Profile?
4. Will the Compatibility Test remain private by default and require both
   participants to opt in before publishing any result?
5. Are hookup and relationship-intent features excluded from the professional
   launch package and partner materials? They substantially complicate both
   positioning and platform review.
6. Is the team willing to use `FMCF` on professional identity surfaces, or is
   the uncensored domain non-negotiable everywhere?

## Bottom line

The app will not cold-start because it has a clever Feed algorithm or a large
directory. It will cold-start if 25 well-connected startup people receive a
clear private reason to invite people they have actually worked with, those
recipients get immediate value for responding, and every resulting object is
safe and interesting to share.

Start with one city, one relationship question, one invitation loop, and one
campaign. Add the broad startup social network only after that atomic network
works.
