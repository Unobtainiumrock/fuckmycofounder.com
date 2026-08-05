# Identity and safety foundation — primary-source research

Researched: 2026-08-04
Scope: a US-facing, public professional-reputation network about identifiable
people. This is product and technical-design research, not legal advice or a
determination that a law applies.

## Foundation to specify before building

Treat these as separate records with deliberately narrow joins: **Account**
(private authenticated actor), **Public Byline** (named publishing identity),
**Profile Claim** (authority to correct/respond for an identifiable person's
profile), and **anonymous Review attribution** (no public actor identifier).
This is consistent with NIST's distinction between authentication and identity
proofing, and with its express recognition that an account may be pseudonymous
and not identity-proofed ([NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html),
[NIST SP 800-63A](https://pages.nist.gov/800-63-4/sp800-63a.html)). It prevents
the unsafe shortcut of treating control of an email address, a public byline,
and authority over a real-person profile as the same claim.

The resulting product promise should be narrow and plain: **anonymous means
not identified to other users; it does not mean unknown to the platform or
immune from valid legal process.** Glassdoor makes the same distinction while
stating that it resists disclosure requests where appropriate
([Glassdoor](https://help.glassdoor.com/articles/en_US/Article/How-does-Glassdoor-respond-to-legal-requests-or-legal-action-to-find-out-who-posted-a-review)).

## Account authentication and recovery

Keep the signup interaction low-friction—passkey and/or emailed sign-in link,
with no required public username or profile—but make recovery a higher-risk,
explicit flow.

* Offer a second independently managed authenticator or recovery method after
  signup. NIST says recovery is normally less convenient than authentication,
  identifies saved/issued recovery codes, recovery contacts, and repeated
  proofing as recovery classes, and requires a recovery notification
  ([SP 800-63B §4.2](https://pages.nist.gov/800-63-4/sp800-63b.html#account-recovery)).
  Let a user view and replace recovery methods; revoke sessions and require
  re-authentication after recovery or a credential change. Do not use
  knowledge-based/security questions as the sole recovery mechanism; OWASP
  notes that their answers are often guessable or obtainable
  ([OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)).
* For a magic-link or recovery code, use a cryptographically random, one-time,
  short-lived value; throttle attempts and do not reset the failure count by
  issuing a new value. NIST requires throttling for short secrets and gives
  recovery-code requirements; OWASP separately recommends one-use, expiry, and
  side-channel delivery ([NIST](https://pages.nist.gov/800-63-4/sp800-63b.html#recovery-codes),
  [OWASP Forgot Password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)).
* Return the same registration, sign-in, and recovery response with comparable
  timing whether or not an email/account exists. Rate-limit recovery requests
  by account and abuse signal. This limits account enumeration and inbox
  flooding ([OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html),
  [OWASP Forgot Password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)).
* Do not make government ID the normal sign-in/recovery mechanism. Reserve a
  documented, human-reviewed proofing route for high-impact events such as a
  contested Profile Claim or loss of all authenticators. If proofing collects
  ID, selfie, biometrics, or scans, show a just-in-time purpose/retention
  notice, obtain any needed consent, and prefer a vendor assertion or
  yes/no result over retaining the document. NIST calls for a privacy-risk
  assessment, explicit collection notice, and documented biometric deletion
  process ([SP 800-63A §§3.3, 8](https://pages.nist.gov/800-63-4/sp800-63a.html)).

## Public pseudonymity and accountable identity

Make public anonymity a per-Review publish choice that is irreversible from
anonymous to named without a high-salience warning. Do not attach an anonymous
Review to a byline page, profile, message target, public activity feed, public
history, or per-item author analytics. Do not infer a public identity from a
Profile Claim.

Professional verification may reduce abuse without becoming the public identity:
Blind says it verifies work-email status while keeping activity separate from
the email; LinkedIn makes identity/workplace/education verification optional,
uses a badge, and says the input used for verification is not public
([Blind FAQ](https://us.teamblind.com/faq),
[LinkedIn verification](https://www.linkedin.com/help/linkedin/answer/a1359065/verifications-on-your-linkedin-profile?lang=en)).
For this product, record a private, time-bounded verification state and what it
means (for example, *email controlled* or *claim reviewed*), not an overbroad
public assertion that every statement is true. Make professional verification
optional so people between jobs and independent workers are not excluded.

Use separate access-controlled storage for recovery/verification evidence and
the Account-to-anonymous-Review linkage. Log every staff reveal request with a
case reason and approver; restrict it to trained trust-and-safety personnel
with a documented escalation path. NIST Privacy Framework's disassociability
outcome specifically calls for limiting observability and linkability
([NIST Privacy Framework](https://www.nist.gov/document/nist-privacy-framework-v10webinardeck-29jan2020-002pdf)).

## Claims, impersonation, and correction

Profile existence, Account ownership, and Profile Claim need distinct states:
`unclaimed`, `claim pending`, `claimed`, `claim challenged`, `corrected/merged`,
and `removed or suppressed`. A claimant should be able to correct their own
name/photo and submit a dispute, but must not receive an anonymous reviewer's
identity or unilateral removal control over a compliant review.

* Make claims evidence-based and reviewable: show the claimant what profile
  fields are being claimed, collect the minimum private evidence needed for the
  asserted relationship, record the method/date/reviewer, and allow a
  correction or challenge when a claim fails. An optional verification badge is
  a comprehensible, bounded pattern; LinkedIn similarly distinguishes identity,
  workplace, and education verification rather than presenting a universal
  truth badge ([LinkedIn verification](https://www.linkedin.com/help/linkedin/answer/a1359065/verifications-on-your-linkedin-profile?lang=en)).
* Put **Report impersonation** and **Report incorrect profile** on every public
  Profile and account/byline surface. LinkedIn gives reporters specific fake,
  not-real-person, and impersonation reasons, keeps the reporter's identity
  from the reported member, and investigates before acting
  ([LinkedIn fake-profile reporting](https://www.linkedin.com/help/linkedin/answer/a1338436/reporting-fake-profiles?lang=en)).
* Preserve the submitted object and evidence snapshot privately when a report
  arrives; issue the subject a notice that describes the object, policy basis,
  action, and appeal route, but does not reveal a confidential reporter or
  anonymous reviewer. A correction/claim dispute must be workable without
  creating an Account that is publicly tied to the Profile.

## Blocking, reporting, moderation, notices, appeals, and audit history

Blocking is a safety boundary, not merely feed preference. Implement a
non-notifying, reversible **Account-to-Account** block that applies to the
blocked account's named byline, claimed Profile, DMs, message requests,
mentions/tags, notifications, recommendations, and any future social graph.
For public records, define and display the remaining limitation: the public may
still see an otherwise public Review or Profile, but neither party should be
made a contact/discovery target for the other. Check the block at read-time and
write-time, not only when a message is created. Meta documents both the useful
scope of blocking and the important exception that public/group or other-account
interactions may remain ([Meta block help](https://www.facebook.com/help/573359136015141),
[Meta limitations](https://www.facebook.com/help/116140961805074/)).

For every Profile, Review, Post, Comment, image, and message request, provide:

1. **Report** with a short reason taxonomy (impersonation, privacy/contact
   information, threat, harassment, false relationship/inauthentic activity,
   copyright/photo, other), optional context, and an immediate receipt.
2. **Triage states**: received, emergency/escalated, under review, actioned,
   no action, and closed. Reports of imminent harm need a prominent emergency
   instruction, not a promise that ordinary moderation is emergency response.
3. **Decision notices** to the reporter and affected contributor/claimant that
   identify the object, action, policy reason, effective time, whether an
   appeal is available, and deadline. Keep report-source and anonymous-author
   information confidential by default.
4. **An appeal** that preserves the original decision and permits new context;
   route high-impact actions—removal of a claimed profile, account restriction,
   or disputed review removal—to a different reviewer where practical. Meta's
   established pattern is policy-specific enforcement guidance, notice, and a
   request-for-review/appeal path; it also permits reports of content left up
   to be appealed ([Meta enforcement guidance](https://about.fb.com/news/2018/04/comprehensive-community-standards/),
   [Meta left-up appeal](https://about.fb.com/news/2021/04/users-can-now-appeal-content-left-up-on-facebook-or-instagram-to-the-oversight-board/)).
5. **An internal append-only case history** for report intake, evidence
   snapshot, policy/version, decision, actor role, notice delivery, appeal,
   and final disposition. Do not put raw private evidence, authentication
   secrets, government IDs, or anonymous-author linkage in ordinary
   application logs. OWASP specifically advises masking, hashing, encrypting,
   or excluding tokens and sensitive personal data from logs
   ([OWASP Logging](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)).

At launch, pre-publication human moderation of Reviews is appropriate to the
product's high-risk, real-person scope. The moderator must distinguish
policy-based action from deciding every factual disagreement. Glassdoor's
published approach—do not remove a review for payment or a mere special request,
and generally do not take sides in factual disputes—illustrates that boundary
([Glassdoor content removal](https://www.glassdoor.com/about/trust/when-is-content-removed/)).

## Deletion, retention, and data minimization

Create a data inventory and written schedule *before* collecting identity
evidence. For each class—account credential, recovery contact, verification
evidence, Profile Claim evidence, anonymous-linkage record, public content,
reports/evidence, moderation audit history, and security logs—state purpose,
access roles, retention trigger/duration, deletion/anonymization action, legal
hold exception, and processor location.

Default to collecting only what supports a protected action and do not reuse
identity-proofing data for discovery, advertising, or public ranking. NIST says
identity proofing should collect the minimum evidence/attributes needed and
that retention increases exposure; the FTC likewise recommends limiting
collection/retention and disposing of data when no longer needed
([NIST SP 800-63A](https://pages.nist.gov/800-63-4/sp800-63a.html#collection-and-data-minimization),
[FTC data minimization](https://www.ftc.gov/system/files/documents/reports/federal-trade-commission-staff-report-november-2013-workshop-entitled-internet-things-privacy/150127iotrpt.pdf)).

Design an authenticated deletion request and a safe completion receipt. Deleting
an Account should end access and remove or irreversibly detach direct
identifiers according to the schedule; it must also say, before confirmation,
what happens to public named Posts, anonymous Reviews, pending reports, fraud
controls, and legally preserved material. Do not promise to erase a public
record or investigative evidence in every circumstance. California's CCPA
contains a consumer deletion right with enumerated exceptions and requires a
business receiving a verifiable request to delete and notify certain processors
and third parties ([Cal. Civ. Code §1798.105](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.105.)).

## Anonymous-author leakage checklist

The primary risk is not only database compromise: a small community can infer a
writer from combinations of public facts. Blind explicitly warns authors not
to combine names, exact teams/dates, distinctive details, screenshots, or
small-team roles ([Blind anonymity guidance](https://us.teamblind.com/faq)).
Before publication and every later feature addition, test these paths:

* **Content:** exact dates, team/project, unique relationship, writing voice,
  screenshots, document metadata, image EXIF, and a stable anonymous alias.
* **Timing:** publish/review/appeal timestamps, a new-review alert sent only to
  one subject, and real-time reaction/view counts.
* **Product graph:** author/profile links, follower/activity feeds, search,
  contact imports, shares, and an author-facing “who saw this” surface.
* **Operations:** email/SMS/push templates, moderator notes, support tickets,
  analytics, exports, logs, error traces, and case notices that contain an
  account ID or byline.

Make the anonymous composer flag high-risk detail without claiming it can make
someone safe. Strip media metadata; warn about screenshots and unique facts;
avoid persistent aliases at launch; aggregate and delay anonymous-author
analytics; prohibit DMs/contact discovery; and privacy-test notification,
support, moderation, export, and analytics paths with a synthetic anonymous
account. NIST's linkability/disassociability framing and OWASP's logging rules
support treating those non-public paths as part of the anonymity system, not as
implementation afterthoughts.

## Legal-review flags before launch

Counsel should review the actual flows and copy before public launch, including:

* scope and retention of ID/selfie/biometric or employment-verification data;
  processor terms, security, and applicable US privacy-law rights/thresholds;
* person-profile creation, correction, merger, image use, subject notices, and
  review/dispute/removal rules for identifiable people;
* anonymous-speaker requests, subpoenas, preservation/hold procedure, and when
  to notify or resist; do not represent anonymity as absolute;
* content and evidence handling for defamation/privacy/harassment threats,
  retaliation, doxxing, threats, copyright images, and emergency/law-enforcement
  escalation; and
* the precise status of platform protections and responsibilities for
  third-party material. The text of 47 U.S.C. §230 is not a product safe harbor
  determination; it is a reason to obtain specific advice rather than make
  claims in UI or policy ([47 U.S.C. §230](https://uscode.house.gov/view.xhtml?edition=prelim&num=0&req=granuleid%3AUSC-prelim-title47-section230)).
