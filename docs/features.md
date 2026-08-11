# fuckmycofounder.com — Feature Roadmap

Status: historical exploration. This document predates the Profile-first startup
network direction and contains superseded object, consent, and sequencing
decisions. [Product Definition](./product-definition.md) is the current living
source of truth; retain this file only as a library of acquisition, retention,
quiz, toolkit, and sharing concepts until those ideas are reconciled.

## Principles

1. **Retention beats reach.** Every feature must answer "why does someone come back tomorrow?" before it ships. Viral spikes are worthless without a loop that catches them.
2. **One link shares everywhere.** Every shareable object (story, verdict, quiz result, leaderboard) has a single short URL that unfurls beautifully on every platform. Sharing is never more than one tap.
3. **Anonymous authors, consenting subjects.** Anyone can tell their story anonymously. But a person's face, name-as-profile, or ranking only appears on the platform if they opted in. This is the line between "confession site" and "harassment site" — it protects the brand, the users, and us.
4. **Not cringe.** The incident-report aesthetic stays deadpan and minimal. No forced startup jokes in product surfaces people interact with daily. AITA works because the format is neutral and the stories carry the drama.
5. **Static-first.** Ship everything that doesn't need a server on the current stack. The backend arrives exactly when the feed does, not before.

---

## 1. Share Engine (infrastructure — powers everything)

**What:** One canonical short link per shareable object (`fmc.com/s/abc123`), plus auto-generated share cards.

**How it works:**
- Every story, verdict, quiz result, and weekly ranking gets a short URL.
- The URL serves dynamic OG/Twitter meta tags → the link unfurls as a styled card on X, LinkedIn, Slack, iMessage, WhatsApp, Discord.
- Card images are rendered server-side (or pre-rendered at publish time) in three aspect ratios:
  - **1.91:1** — link unfurls (X, LinkedIn, Facebook, Slack)
  - **9:16** — Stories/TikTok/Reels (these platforms don't unfurl links, so we generate a downloadable/shareable image with the short link burned into the card)
  - **1:1** — Instagram feed
- On mobile, the share button opens the **native share sheet** (Web Share API) with the link + the right image attached. On desktop, one-click copy + per-platform buttons.
- Card design: the existing case-file visual language (cream/red/black, monospace stamps). Distinctive enough that a cropped screenshot is still recognizably ours. The card is the ad.

**Viral hook:** The card itself. It should make a stranger stop scrolling and think "what is this site?"
**Retention hook:** None directly — this is plumbing. But every other feature's loop runs through it.

---

## 2. Story Feed (the core product)

**What:** People post about their cofounder situation; the community reads, votes, and comments. Two post types:

- **Horror story** — it already happened, here's the wreckage. (Entertainment)
- **Advice ask** — it's happening right now, what do I do? (Utility)

**Verdicts (AITA-style, kept neutral):** Readers vote one of:
- `NTP` — Not the problem
- `YTP` — You're the problem
- `ESH` — Everyone sucks here
- `NBD` — No villains, just a startup dying normally

The winning verdict gets stamped on the post (and its share card) after a voting window. No joke severity stamps, no "vibes jurisdiction" in the feed UI — deadpan verdict, real comment section. The drama comes from the stories.

**Comments:** Threaded, votable. This is where the actual engagement lives — AITA's comment section IS the product. Top comment appears on the story's share card ("top take" line).

**Anonymity:** Posts are pseudonymous by default (auto-generated handle per post, e.g. `founder-4417`). Authors can reveal a persistent username if they want reputation.

**Media uploads ("receipts"):**
- Screenshots of Slack/iMessage/email threads, cap tables, calendar invites — receipts are what make stories land and what makes ours different from text-only forums.
- **Built-in redaction brush:** before upload, a client-side editor to black-bar names, faces, phone numbers, emails. Make redacting satisfying and fast (one tap auto-detect of text regions later; manual brush at v1).
- EXIF/metadata stripped client-side on upload.
- **Receipts, not faces:** photos whose subject is a person (profile pics, headshots, photos of the cofounder) are blocked by policy and moderation. Screenshots of conversations and documents are the content.
- Limits at launch: images only, ~5 per post, 10MB each. Video later if demanded.

**Viral hook:** Verdict cards + wild receipts. "You have to see this one" links.
**Retention hooks (strongest in the whole product):**
1. **Your own post** — nothing pulls someone back like checking what the internet said about *their* drama. In-app notifications on votes/comments/verdict-reached.
2. **Jury habit** — a "vote on today's docket" surface: 5 fresh stories, quick verdict votes. Do it well = the daily Reddit loop. Do it badly = engagement-bait cringe. Done well means: no streaks, no points fanfare, just an efficient "you're caught up" reading flow.
3. **Comment threads** — reply notifications.

**Requires:** First real backend (posts, votes, comments, media storage, accounts-lite), moderation queue, report button, takedown/appeal flow. See §8.

---

## 3. Quizzes

### 3a. "How cooked are we?" (single-player)

- ~12 questions mixing multiple-choice with 2–3 free-text answers.
- **LLM-scored:** free-text answers ("describe your last disagreement about money") get scored by an LLM against the red-flag taxonomy (§7) and woven into a personalized diagnosis, not a canned bucket. This is the differentiator — the result reads like it actually understood your situation.
- Output: a **Cooked Report** share card — overall score, top 3 risk factors, one uncomfortably specific line from the LLM.
- Cost/abuse control: rate-limit by IP/session, cap free-text length, cache the model, degrade gracefully to rules-only scoring if the LLM call fails.

### 3b. Compatibility Test (two-player)

- You answer, then send your cofounder (or a prospective one) a link; they answer blind; the site compares.
- Question areas: equity expectations, commitment level (full-time? until when?), spending authority, what happens if one wants out, title/credit ego, work-hours philosophy, personal-runway honesty.
- Output: an **alignment report** — where you match, where you're dangerously far apart, LLM-written "talk about this before you incorporate" section.
- **The share loop is the mechanic:** the feature doesn't work until you send the link to a second person. Every use recruits a user.
- Results are private to the pair by default; a shareable "we scored 74%" card is opt-in.

**Viral hook:** Score cards + the built-in send-to-your-cofounder loop.
**Retention hooks:** Re-take over time ("your cooked score, tracked quarterly" — a status that changes is a reason to return); compatibility test becomes the standard "cofounder dating" step (§6 feeds off it).
**Requires:** 3a ships static + one LLM endpoint (first tiny backend function). 3b needs paired sessions — small backend.

---

## 4. Weekly Leaderboard — "Most Wanted"

**What:** The weekly ranking surface, humanized through **recurring archetype characters**, not real people.

- Every story gets tagged (by author + community + LLM assist) with an archetype: **The Ghost** (disappears for weeks), **The Equity Goblin** (renegotiates splits at midnight), **The Visionary** (allergic to shipping), **The LinkedIn Founder** (posts more than commits), **The Pivot Addict**, etc. Each archetype gets an illustrated mugshot — consistent, memeable characters with faces.
- Weekly: "**Most Wanted this week: The Ghost — 34% of all reports.**" Plus "Case of the Week" (top-voted story) and "Verdict of the Week" (most contested vote).
- The humanness comes from the characters — people recognize their cofounder in The Ghost and tag friends ("this is literally your cofounder"). Faces, personality, recurring lore — without ranking a real person.
- **Hard rule:** no leaderboard of real/identifiable individuals, no real photos. That's the Tea-app lawsuit feature and the fastest way to kill the brand. If someone famous opts in to guest on a future podcast ep, that's different — consent.

**Viral hook:** Archetype mugshots are sticker-grade shareable; "which one is YOUR cofounder" is a tag-a-friend machine.
**Retention hook:** Weekly cadence — the docket resets, characters accumulate lore, people check who "won."
**Requires:** Feed (§2) + tagging. Illustrations are a one-time content investment.

---

## 5. Data & Stats — "How Cofounders Fall Apart"

**What:** Aggregate the taxonomy data from stories, verdicts, and quizzes into the reference dataset on cofounder failure. Nobody has this data. We accumulate it as exhaust.

- Live stats page: top charges this month, archetype distribution, stage-of-company vs. blowup-type correlations, "median time from incorporation to first equity fight."
- **Annual "State of the Cofounder" report** — designed PDF + web page. This is a press-cycle machine (journalists cite it, VCs share it) and the single most legitimizing artifact we can produce.
- All aggregate, never individual. k-anonymity floor (no stat shown unless n ≥ some threshold).

**Viral hook:** Stat cards ("Equity Amnesia reports up 40% this quarter") via the share engine.
**Retention hook:** Weak directly — but it's the authority moat, and it feeds §7.

---

## 6. Profiles, References & Matching (the business, built last)

**What:** Opt-in profiles for people who *want* to be found — looking for a cofounder, or willing to be reference-checked.

**Profile contents (v1 sketch):**
- Identity: name, photo, links (verified — this surface is NOT anonymous; credibility is the point)
- Looking-for: role sought/offered, commitment level, location/remote, stage, domain
- **Compatibility fingerprint:** their §3b answers (equity philosophy, exit expectations, work style) — shown as ranges, compared automatically against viewers
- **Cooked/compat history:** badges for having done the work ("took the compatibility test with 3 candidates")
- **References ("vouches"):** short structured endorsements from past collaborators, attached with both parties' consent. Prompted fields ("what's it like when things go wrong?") not free-form praise.

**The consent line, applied:** you can *rate your experience* in an anonymous story (§2, no profile linkage), or you can *reference a person* on their opt-in profile. There is no "review a person who never signed up" surface. Private, consented reference-check requests ("ask their former cofounder 3 questions") can come later as a paid feature.

**Matching:** starts as a browsable/filterable directory ranked by compatibility fingerprint overlap. Swipe mechanics never; this is due diligence, not dating. Positioning writes itself: *"We've read ten thousand ways it goes wrong. Match on the questions that actually kill companies."*

**Viral hook:** Low. This is the monetization/value layer, not the growth layer.
**Retention hook:** High for the subset that matters — active seekers check daily. Paid tier lives here (reference checks, boosted profiles, the prenup kit at the moment of match).
**Requires:** Real accounts + verification. Cold-start risk is real — do not launch until the feed/quiz audience exists to seed it.

---

## 7. Red-Flag Pattern Library

**What:** The searchable field guide to cofounder failure, grown from tagged stories.

- Each pattern page: name, description, early warning signs, real (anonymized) story excerpts, "what people wish they'd done," linked prevention tool.
- Sits between entertainment and utility: you arrive laughing at a story, you leave having read "Signs your cofounder is about to ghost" at 1am before your incorporation meeting.
- Pairs with a small **prevention toolkit**: cofounder-prenup checklist, honest equity-split calculator, the awkward-questions script, the breakup checklist. Static content, high bookmark value, later the paid kit.

**Viral hook:** Moderate — pattern pages get linked in founder group chats ("read this before you sign").
**Retention hook:** Strong for the right moment — this is the utility that makes the site *matter* to someone's actual decision, not just their lunch break. It's also the SEO surface ("cofounder won't sign vesting agreement" searches land here).
**Requires:** Content effort + story tagging. Toolkit v1 can ship static, day one.

---

## 8. Trust & Safety baseline (ships WITH the feed, not after)

Not a feature users see — the reason the features get to keep existing.

- Moderation queue for posts + media before/shortly-after publish (start human, add LLM pre-filter).
- Contact-info blocking stays (already live: email/phone regex; extend to media via the redaction flow).
- Report button on everything; takedown request path for people who believe they're identified; documented response process.
- No real-person photos as content (§2), no non-consented profiles (§6), no individual-level stats (§5).
- Legal review of the format before the feed launches. Platform ToS + content policy written in the brand voice but unambiguous.

---

## Retention map (the honest version)

| Feature | Why someone returns | Strength |
|---|---|---|
| Own post notifications | "What did they say about MY story?" | ★★★★★ |
| Comment replies | Conversation loop | ★★★★★ |
| Daily docket voting | Judging habit, 3 min/day | ★★★★ |
| Weekly Most Wanted | Cadence + character lore | ★★★ |
| Quiz score tracking | Status that changes over time | ★★★ |
| Pattern library / toolkit | Utility at a real decision moment | ★★★ (episodic, deep) |
| Matching directory | Active seekers check daily | ★★★★ (narrow audience) |
| Stats page | Curiosity | ★ |

In-app/push notifications on your own content are the primary retention channel (email digest deprioritized — too intrusive as a requirement; offer it as opt-in only).

## Phasing

1. **Now (static):** Cooked quiz (rules-scored v1) · prevention toolkit pages · share engine v1 (pre-rendered cards + Web Share API) · archetype design work.
2. **First backend:** LLM quiz scoring · story feed with verdicts/comments/receipts + moderation + T&S baseline · notifications · short links with dynamic OG.
3. **Audience exists:** Compatibility test · Most Wanted weekly · pattern library from real data · stats page.
4. **The business:** Profiles · references · matching · paid kit. (Podcast slots in anywhere after 2 — the feed is its sourcing pipeline.)
