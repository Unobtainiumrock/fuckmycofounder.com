# Profile review aggregation: evidence and product implications

## Scope

This note covers public summaries derived from relationship Reviews: disclosure
risk at small counts, communication of low-volume evidence, five-point ordinal
ratings, and resistance to one person or coordinated group dominating a result.
The cited government rules govern their own statistical releases, not this
product. They are useful conservative design evidence, not a legal safe harbor or
a universal threshold.

## What the primary sources establish

### 1. A minimum count is only one part of disclosure control

The [U.S. Census Bureau Statistical Quality Standards](https://www2.census.gov/about/policies/quality/quality-standards-apr2022.pdf)
require disclosure-avoidance techniques and list sensitive-cell thresholds,
suppression, category collapsing, rounding, and controlled adjustment as options
(S1-2, pp. 158-159). They do not prescribe one threshold for every dataset.

The UK Office for National Statistics explains why. Counts of one or two may
create identity or attribute-disclosure risk, but risk depends on the sensitivity
and dimensions of the table. Related totals and overlapping tables can reveal a
suppressed value by subtraction, so primary suppression may require secondary
suppression. For flexible online tools, ONS suggests a more cautious minimum cell
count of five, while explicitly warning that its policy is specific to birth and
death data. See the ONS [policy on protecting confidentiality in tables](https://www.ons.gov.uk/methodology/methodologytopicsandstatisticalconcepts/disclosurecontrol/policyonprotectingconfidentialityintablesofbirthanddeathstatistics),
especially sections 2, 4.2, 4.3, and 4.4.

[NIST SP 800-188](https://doi.org/10.6028/NIST.SP.800-188) adds that removing
direct identifiers does not itself de-identify data: quasi-identifiers, linked
datasets, repeated releases, and future external data can increase
re-identification risk. It recommends threat modeling the intended release,
measurable standards, review, validation, and post-release monitoring rather
than relying on masking alone (sections 3.2, 4.3.8-4.3.13, and 4.6).

**Product implications**

- Use **five distinct eligible reviewers per displayed cell** as a conservative
  launch default, subject to privacy and abuse testing. Apply it separately to
  every metric and to Run it back; `Not enough exposure` is not an observation.
- Below five eligible answers, render **Not enough reviews yet** rather than a
  score, percentage, empty bar, zero, or hidden decimal value.
- Do not expose relationship-type, time-period, verification, or other breakdown
  cells below five. Do not publish a total beside partial categories when the
  remainder would reveal a suppressed cell. Pool categories only when the pooled
  label remains honest and the pool itself clears the threshold; otherwise omit
  the breakdown.
- Apply suppression consistently to the profile, API, share clip, feed card,
  notifications, exports, and historical views. A hidden UI value that remains
  available elsewhere is not suppressed.
- Treat this as harm reduction, not anonymity proof. Reviews and their coarse
  relationship context are public records; aggregation can make linkage easier
  even when it adds no new underlying fact. Review coarse context, narrative, and
  exhibit safety before publication, then monitor aggregation releases for new
  linkage attacks.

### 2. Small, self-selected review sets do not support precise population claims

The Census standards require conclusions from sample data to include appropriate
measures of uncertainty and require reports to disclose assumptions, limitations,
error sources, and methodology (E1-4 and E2). They also require a caveat when
qualitative work is nonrandom, nonrepresentative, or too small to support
statistical testing (E2-2.1). A profile's reviewers are more selective than a
probability sample, so a confidence interval alone would not repair selection,
relationship, survivorship, or retaliation bias.

**Product implications**

- Always show the eligible answer count next to an aggregate and describe it as
  **what these reviewers reported**, never an objective trait, founder-success
  prediction, or estimate of everyone who worked with the person.
- At launch, do not rank Profiles, declare winners, display percentile badges, or
  imply that two close summaries differ. A minimum disclosure threshold is not a
  reliability threshold.
- Label five-to-nine-answer summaries as **Early signal** and keep the five-bin
  distribution visible. Revisit the band after observing real response and abuse
  patterns; do not silently increase decimal precision as volume grows.
- Publish a short methodology explaining eligibility, `Not enough exposure`,
  revision/removal handling, suppression, and known self-selection limits. Keep
  an auditable version of the aggregation policy so old share surfaces can be
  recomputed or withdrawn when the policy changes.

### 3. Five-point answers are ordered categories, not known equal intervals

Liddell and Kruschke's original simulations and real-rating examples show that
treating ordinal answers as metric can produce distorted effects and even reverse
comparisons. They recommend an ordinal model rather than assuming equal distance
between adjacent categories: [*Analyzing ordinal data with metric models: What
could possibly go wrong?*](https://doi.org/10.1016/j.jesp.2018.08.009), Journal
of Experimental Social Psychology 79 (2018), 328-348.

**Product implications**

- Do not make a decimal arithmetic mean the primary public summary for LARP,
  Domain Expertise, On Time, Taste, GTM, or Charisma.
- Show the full **five-bin answer distribution**, the eligible `n`, and a
  categorical median once the cell clears the threshold. The distribution is
  essential because the same median can describe consensus or polarization.
- Keep LARP's inverse direction explicit (`Legit` to `LARP`) in every aggregate.
  Never average LARP with positively oriented dimensions or combine dimensions
  into a Founder Score.
- Keep Run it back as its own categorical/binary verdict with its own denominator.
  Do not derive it from the capability answers.
- If later ranking or trend analysis is justified by substantially more data,
  use a preregistered ordinal model with uncertainty and sensitivity checks;
  do not retrofit equal-interval arithmetic because it is convenient.

### 4. Distinct accounts do not guarantee independent people or opinions

Douceur's original [*The Sybil Attack*](https://www.microsoft.com/en-us/research/publication/the-sybil-attack/)
shows that one actor can undermine redundancy by presenting multiple identities;
without a trusted identity authority, robustly proving that identities are
distinct is generally impossible. Lam and Riedl experimentally demonstrated that
groups of false rating profiles can manipulate recommender outputs in
[*Shilling Recommender Systems for Fun and Profit*](https://doi.org/10.1145/988672.988726)
(WWW 2004). These results do not prescribe a specific product detector, but they
do rule out treating raw review count as automatic independence.

**Product implications**

- Count at most one eligible active Review per Account, Profile, and continuous
  relationship period. Account verification, relationship acceptance, and Review
  eligibility remain separate gates.
- Compute public aggregates only from currently eligible Reviews after duplicate,
  enforcement, and coordinated-activity checks. A removed or limited Review must
  stop contributing everywhere in the same policy version.
- Display relationship mix when safe so readers can see concentration. Do not
  invent equal relationship weights at launch: arbitrary reweighting can hide the
  fact that nearly all evidence came from one context.
- Before any future rank or badge, run leave-one-review-out and relationship-stratum
  sensitivity checks. If one reviewer, one connected cluster, or one relationship
  stratum materially determines the result, withhold the rank and describe the
  evidence as concentrated.
- Do not reveal fraud scores, device links, private identity evidence, or cluster
  membership. Those are restricted integrity signals, not public accusations.

## Recommended launch contract

1. A Profile may show its public Reviews before an aggregate exists.
2. Each aggregate field has its own denominator and requires five distinct,
   eligible answers.
3. A cleared field shows `n`, five-bin distribution, and categorical median; five
   through nine answers are labeled **Early signal**.
4. Relationship breakdowns follow cell and residual suppression; unsafe
   breakdowns are omitted rather than filled with zeroes.
5. No cross-Profile leaderboard, percentile, universal score, or statistical
   comparison ships with the first aggregation release.
6. Eligibility and suppression are enforced by one server-side projection reused
   by every public surface, with policy versioning and post-release monitoring.

This contract is deliberately conservative. The threshold should change only
after a documented privacy/abuse review using realistic sparse, overlapping,
revision, removal, and coordinated-review fixtures—not because five reviews
feels numerically sufficient.
