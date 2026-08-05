# Open To primary-source safety notes

Accessed 2026-08-04. This note supports product design; it is not legal advice.
Age-assurance, privacy, sexual-misconduct, and mandatory-reporting obligations
vary by jurisdiction, so counsel and a launch-market assessment remain required.

## Conclusions for the launch contract

1. **Treat Open To as an adults-only, higher-risk capability, not as an Account
   birthday field.** The activation gate should return only a current `18+`,
   `under 18`, or `unable to establish` result. Self-declaration alone is too
   easy to circumvent for a capability that exposes romantic or sexual intent.
   The service should support a proportionate alternative and an appeal when an
   automated or third-party result is wrong.
2. **Minimize and purpose-bind age data.** Do not expose a birth date, document,
   face capture, confidence score, exact age, or verification method to Open To
   participants. Do not use age-assurance input for recommendations, ads,
   Profile verification, identity enrichment, precise location, or risk
   profiling. Keep only the minimum eligibility assertion and audit facts for a
   documented period; require the processor to delete source material promptly.
3. **Availability is not consent.** An Open To Status can signal openness to an
   introduction, but not consent to a message, meeting, sexual language,
   contact, or activity. Consent must be informed, voluntary, mutual, and
   withdrawable. The product therefore needs immediate status withdrawal,
   independently consented message requests, and plain conduct copy.
4. **Reporting and blocking remain available after visibility ends.** Reports
   must cover unwanted sexual comments, coercion, threats, stalking, doxxing,
   outing, intimate-image abuse, impersonation, trafficking, underage use, and
   retaliation. The reporter stays confidential, and loss of current Profile or
   conversation access must not remove the reporting path.
5. **Do not promise screenshot prevention or recall.** Keep Open To out of
   public routes, feeds, sharing metadata, Share Clips, exports, notifications,
   search indices, and analytics payloads; warn that another participant may
   still copy what they legitimately see. Immediate withdrawal controls future
   platform visibility, not already captured material.

## Evidence

### Age assurance and privacy

- The European Data Protection Board's 2025 statement says age assurance should
  not reveal identity or precise location, enable targeting/profiling, or be
  reused beyond its purpose. It calls for strict data minimization, privacy by
  design, fairness, alternatives, and ongoing assessment of third-party methods.
  [EDPB Statement 1/2025, §§15–20](https://www.edpb.europa.eu/system/files/2025-04/edpb_statement_20250211ageassurance_v1-2_en.pdf)
- The UK Information Commissioner's Office says self-declaration can be
  insufficient for high-risk scenarios, official documents may be excessive,
  and a service may only need to retain a yes/no threshold result. It also calls
  for accuracy testing, challenge paths, and bias assessment. The page notes
  that the guidance is under review, so it is evidence for design principles,
  not a claim of universal current law.
  [ICO age-assurance opinion, §§6.1.5–6.3.3](https://ico.org.uk/about-the-ico/what-we-do/information-commissioners-opinions/age-assurance-for-the-children-s-code/6-expectations-for-age-assurance-and-data-protection-compliance/)
- A 2026 FTC COPPA enforcement statement is limited to the described COPPA
  circumstances, but its conditions reinforce a narrow pattern: sole-purpose
  use, prompt deletion, clear notice, security, processor diligence, and
  reasonable accuracy.
  [FTC COPPA age-verification policy statement](https://www.ftc.gov/news-events/news/press-releases/2026/02/ftc-issues-coppa-policy-statement-incentivize-use-age-verification-technologies-protect-children)

### Consent and sexual safety

- A U.S. Department of Justice Office on Violence Against Women model policy
  states that consent is informed, voluntary, mutual, and withdrawable; silence,
  past consent, force, coercion, intimidation, threats, duress, and certain
  incapacitation cannot establish consent. The document is a model-policy
  source, not a universal jurisdictional definition.
  [DOJ OVW model policy, pp. 2–3](https://www.justice.gov/ovw/page/file/910276/dl?inline=)
- Bumble's current first-party rules prohibit unwanted sexual behavior,
  cyberflashing, intimate-image abuse, stalking, sexual violence, trafficking,
  impersonation, and underage participation; they combine human and automated
  review and provide Block and Report.
  [Bumble Community Guidelines](https://bumble.com/en-us/guidelines/)
- Bumble's reporting flow allows reporting from a Profile and through support
  after access is lost, keeps the reporter confidential, and returns private
  case status.
  [Bumble Support: Reporting someone](https://support.bumble.com/hc/en-us/articles/28783343585565-Reporting-someone)
- Tinder's current rules are also 18+, prohibit sexual content or seeking sex on
  a public Profile, prohibit harassment, doxxing, sextortion, blackmail, and
  harm, and keep reports confidential. These are first-party precedent, not a
  safety guarantee or a mandate to copy Tinder's discovery model.
  [Tinder Community Guidelines](https://policies.tinder.com/community-guidelines/intl/en/)

## Evidence limits and launch gates

- No primary source makes one age-assurance method correct for every market or
  risk. Before enabling Open To, define launch jurisdictions, obtain specialist
  privacy and safety counsel, complete a documented child-safety/privacy impact
  assessment, select and test an assurance provider, validate accessibility and
  bias, and establish an underage report/escalation playbook.
- First-party dating-platform policies show necessary controls but do not prove
  that those controls are sufficient. A closed abuse test must cover outing,
  workplace power imbalances, stalking, status inference, rejected-introduction
  retaliation, compromised Accounts, screenshot sharing, and underage evasion.
- Do not enable the feature merely because repository tests pass. Provider
  behavior, moderator readiness, incident response, retention deletion, and
  deployed non-leakage require separate acceptance evidence.
