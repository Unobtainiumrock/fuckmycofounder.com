# Person-profile directory — primary-source research

Researched: 2026-08-04
Scope: `add-person-profiles` for a US-facing public startup/professional
directory in which an authenticated user may create a minimal record about
another identifiable person. This is product and technical-design research,
not legal advice or a determination that any cited law applies.

## Recommended launch boundary

Allow a user to submit a Profile about another person only when all of the
following are true:

1. the subject is a living adult who participates professionally in the startup
   ecosystem as a founder, investor, venture capitalist, operator, or closely
   adjacent professional;
2. the submitter supplies a public, authoritative professional source or other
   privately reviewable evidence that distinguishes the subject from people
   with the same name;
3. search-before-create finds no existing Profile for that person; and
4. a moderator approves the identity match before the Profile is public,
   searchable, or reviewable.

The public Profile can remain only a canonical name, lawful photo or neutral
placeholder, and claimed/unclaimed state. Professional source, submitter,
match evidence, and moderation history should remain private. Treat the adult
and professional-connection boundaries as conservative product policy, not as
facts required by every jurisdiction.

## What primary-source product precedents establish

These are precedents, not legal requirements.

| Precedent | First-party rule | Product implication |
| --- | --- | --- |
| Rate My Professors | A contributor must search first; the creation form requests school, department, email, and a directory listing; every new professor is moderator-verified before being rated ([creation help](https://help.ratemyprofessors.com/article/5-add-professor), [creation form](https://www.ratemyprofessors.com/add/professor)). | A tiny public record does not require a context-free submission. Collect private role/affiliation/source evidence, deduplicate, and moderate before activation. |
| Crunchbase | A socially authenticated user may create a public person profile for themself or someone else, while the login account stays private and separate from the public record; Crunchbase also tells contributors to search before creating ([account/profile distinction](https://support.crunchbase.com/hc/en-us/articles/115010462427-What-s-the-difference-between-user-accounts-and-person-profiles), [create profile](https://support.crunchbase.com/hc/en-us/articles/115011823988-How-do-I-create-a-Crunchbase-profile)). | Preserve the already-decided Account/Profile separation. Authentication establishes an accountable submitter, not ownership of the person being described. |
| Crunchbase | Anyone with a socially authenticated account can edit public person profiles, but duplicate/correction requests are reviewed by staff and a subject can submit a privacy removal request ([person profiles](https://support.crunchbase.com/hc/en-us/articles/115010462427-What-s-the-difference-between-user-accounts-and-person-profiles), [removal](https://support.crunchbase.com/hc/en-us/articles/360001279147-How-do-I-request-the-removal-of-my-Crunchbase-person-profile)). | Use the safer half of the precedent: easy correction proposals and staff review. Do not allow unreviewed public overwrites of canonical name/photo. |
| IMDb | A duplicate is merged only when all data belong to the same person; mixed records must be split item-by-item; an editor reviews the submitted merge ([merge guide](https://help.imdb.com/article/contribution/names-biographical-data/how-can-i-combine-two-imdb-filmography-pages/G3TNPWSGKZNRU3MP), [names policy](https://help.imdb.com/article/contribution/names-biographical-data/names/GSA3M6SFHRAERXZ3)). | A merge is a reviewed identity operation, not a fuzzy-name cleanup. Require evidence, preserve the canonical record, and support reversal from an audit trail. |
| Wikidata | For living people, challenged claims require reliable public sourcing; non-notable living-person items can be deleted; subjects can request private-information removal, including stronger suppression where appropriate ([living people](https://www.wikidata.org/wiki/Wikidata%3ALiving_people), [deletion](https://www.wikidata.org/wiki/Wikidata%3ADeletion_policy)). | Do not treat “it is somewhere online” as enough. Prefer widespread, professional public facts; give the subject a private correction/removal route and suppress sensitive material from ordinary history. |
| LinkedIn | LinkedIn prohibits profiles for someone other than the account owner, requires authentic identity, provides a confidential fake/impersonation report, and treats duplicate profiles as a warning signal ([community policies](https://www.linkedin.com/legal/professional-community-policies), [fake-profile reporting](https://www.linkedin.com/help/linkedin/answer/a1338436/reporting-fake-profiles?lang=en)). | Although this product deliberately allows third-party directory records, it still needs a prominent `Report impersonation/wrong person` action, confidential reporting, and a clear distinction between an unclaimed directory record and an Account speaking as that person. |

## Profile creation and abuse controls

The creation flow should be **search → select or distinguish → evidence →
moderation**, not a bare name/photo form.

* Require an authenticated, adult, non-restricted Account. Keep the submitter
  ID and source/evidence in the private moderation record; never imply publicly
  that the submitter is the Profile subject. Label every third-party-created
  public record **Community-created · Unclaimed** until a separate claim is
  verified.
* Search exact and normalized names before accepting a submission. Show likely
  matches using safe professional disambiguators in the creation flow, even if
  those disambiguators are not part of the eventual minimal public Profile.
  Ask “Is this one of these people?” before “Create new.”
* Require one private professional anchor: official company/team page,
  investment-firm page, credible event/speaker biography, or comparable
  first-party source. A social profile alone may support a match but should not
  automatically establish eligibility or authorize reuse of its photo.
* Put submissions into `pending moderation`. Do not expose a canonical URL,
  allow Reviews, or index the page until a moderator verifies real-person
  eligibility, identity distinction, photo provenance, and duplicate status.
* Rate-limit creation by Account and abuse/risk signal; retain an append-only
  record of who submitted, what source was supplied, what candidates were
  shown, and who approved or rejected it. Repeated fake, duplicate, minor, or
  impersonation submissions should restrict further creation.
* Every public Profile needs `Report wrong person/impersonation`, `Suggest a
  correction`, and `Report this photo`. A claim or correction must work without
  revealing the original submitter. Claiming an existing Profile is a separate
  proofed operation and must never be granted merely because the claimant
  created it.
* Do not admit extra identity fields through descriptions or metadata. Prohibit
  addresses, personal contact details, birth dates, family/minor information,
  schedules, private locations, and government identifiers. Keep
  platform-authored prose off unclaimed Profiles so a neutral directory shell
  cannot be mistaken for an allegation or endorsement.

## Photo provenance, correction, and removal

A person owning a copy of their headshot does not necessarily own its
copyright. The US Copyright Office says the photographer generally owns the
photo and that using someone else's photo online ordinarily requires permission
from the copyright owner ([Photography & Copyright](https://www.copyright.gov/engage/docs/photography.pdf),
[Circular 16A](https://copyright.gov/circs/circ16a.pdf)). An open license also
has enforceable conditions; for example, CC BY-SA 4.0 requires creator and
license identification, a link when practicable, and modification disclosure
([license §3](https://creativecommons.org/licenses/by-sa/4.0/legalcode.en#s3)).
The depicted person's privacy/publicity rights are separate from the
photographer's copyright. Wikimedia Commons' official guideline makes that
distinction and uses the place, context, identifiability, and public/private
setting when assessing subject consent ([identifiable people](https://commons.wikimedia.org/wiki/Commons%3APhotographs_of_identifiable_people/en-us)).

Therefore:

* Accept only: (a) a subject-uploaded photo with a rights attestation, (b) an
  uploader-owned photo with subject permission and a platform license, (c) a
  photo with an explicit compatible license, or (d) verified public-domain
  material. “Found online,” a search-result thumbnail, or copying a social
  network avatar is not provenance.
* Record source URL, creator/rightsholder, license basis and version, retrieval
  date, uploader attestation, and any required attribution. Keep the evidence
  even if only the resulting credit is public.
* A lack of a cleared photo must not block an otherwise eligible Profile. Use a
  neutral platform-generated placeholder; never synthesize the person's face.
* Let the verified subject replace or remove their photo. During a credible
  identity, privacy, or copyright dispute, replace it with the placeholder
  while staff reviews the evidence. Maintain a DMCA notice/counter-notice route
  and designated agent if the company intends to rely on 17 U.S.C. §512; the
  Copyright Office explains that the safe harbors are conditional and require
  a registered/publicly identified agent ([DMCA overview](https://www.copyright.gov/dmca/)).
* Strip EXIF and other embedded metadata. Do not retain face embeddings, run
  face recognition, or infer age/personality/identity from the photo. The FTC
  warns that biometric-image processing can create privacy, security, bias, and
  deception risks ([FTC biometric policy](https://www.ftc.gov/legal-library/browse/policy-statement-federal-trade-commission-biometric-information-section-5-federal-trade-commission)).

## Canonicalization, redirects, tombstones, and deletion

Use stable opaque Profile IDs. Treat display names and slugs as mutable aliases,
not identity keys.

### Duplicate merge

1. A moderator chooses a surviving canonical Profile only after evidence shows
   both records represent the same person. Ambiguous same-name records remain
   separate.
2. Reassign all dependent objects transactionally, preserve object IDs, and
   record `source profile → canonical profile`, evidence, actor, time, and
   reversal metadata in a private merge ledger.
3. Old Profile IDs/slugs become permanent aliases that issue a server-side
   `301` or `308` to the canonical Profile. Google treats a permanent redirect
   as a canonicalization signal and specifically recommends it for consolidated
   pages ([Google redirects](https://developers.google.com/search/docs/crawling-indexing/301-redirects));
   HTTP defines `301` as a resource assigned a new permanent URI
   ([RFC 9110 §15.4.2](https://www.rfc-editor.org/rfc/rfc9110.html#name-301-moved-permanently)).
4. Do not render a second public “duplicate” page or transfer a Profile Claim
   automatically when the claim evidence does not identify the survivor.

### True removal or suppression

Do not redirect a removed person to another person, search results, or the home
page. If no public replacement exists, return `404` or preferably `410 Gone`;
Google recommends `404`/`410` for removed content and `301` only when there is a
clear replacement ([crawl errors](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors)).
If a temporary safety/legal hold must leave a reachable status page, remove the
name, photo, and reason from it and return `noindex`; Google notes that a crawler
must be able to access a page to observe `noindex`
([noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)).

Keep only a private, access-controlled suppression record sufficient to prevent
immediate malicious recreation and to preserve moderation/legal obligations:
canonical identifier or privacy-preserving match key, action basis, scope,
review/expiry date, and case ID. Do not publish a named tombstone or removal
reason. Because even a hashed match key or retained source can remain personal
data, counsel must approve its purpose, access, retention, and erasure behavior.

## Legal requirements and counsel flags

Unlike the platform precedents above, these are laws or regulator guidance. The
precise applicability, exceptions, and geographic launch scope require counsel.

* **EU/UK-style indirect collection.** If GDPR applies, Article 14 addresses
  personal data obtained from someone other than the subject and requires
  source, purpose/legal basis, recipient, retention, and rights information;
  notice is generally due within one month, or earlier at first communication
  or disclosure. Articles 16 and 17 provide rectification and conditional
  erasure rights, with exceptions including freedom of expression/information
  and legal claims ([GDPR](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0679),
  [European Commission obligations](https://commission.europa.eu/law/law-topic/data-protection/rules-business-and-organisations/obligations_en)). Counsel should determine launch geography, lawful basis,
  how an unclaimed subject is notified, and which expression/public-interest
  exception—if any—supports retention after objection.
* **California privacy.** A covered CCPA business has notice and consumer-rights
  duties, including correction and conditional deletion; publicly available
  information and other categories may be exempt, but that is not a blanket
  exemption for a crowdsourced directory. Covered businesses must provide a
  correction route, and cannot force a non-account holder to create an Account
  merely to make a rights request. The statutory deletion right and its
  free-expression exceptions do not safely answer whether a Profile subject can
  delete another user's contribution ([California Attorney General](https://oag.ca.gov/privacy/ccpa),
  [Cal. Civ. Code §§1798.105–.106](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.106.)).
  If the product later sells or shares profile data to third parties with whom
  subjects lack a direct relationship, counsel must assess California's
  data-broker definition, registration, and DROP deletion duties
  ([CPPA data brokers](https://cppa.ca.gov/data_brokers/)).
* **Name/photo commercial use.** California Civil Code §3344 regulates knowing
  use of another person's name or photograph for advertising or selling without
  consent, while also stating news/public-affairs and commercial-medium
  limitations. Whether this directory, its provocative branding, paid product,
  advertisements, notifications, or Share Clips fall on either side is a
  fact-specific counsel question ([Cal. Civ. Code §3344](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=3344.)).
  New York separately regulates use of a living person's name or likeness for
  advertising or trade without written consent
  ([N.Y. Civil Rights Law §§50–51](https://www.nysenate.gov/legislation/laws/CVR/50)).
  Do not use a Profile subject's photo in acquisition ads or endorsements
  without separate permission.
* **Children.** COPPA generally concerns information collected online from
  children under 13, and FTC guidance says it does not apply merely because an
  adult submits information about a child. Photos are personal information when
  collected from a child, and teen privacy remains a regulator concern
  ([FTC COPPA FAQ](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions)). Other state/international and
  publicity/privacy rules may still apply. An adults-only Profile-subject
  boundary is the safer launch policy; route a credible minor report to urgent
  suppression rather than demanding public proof.
* **Third-party content protections are not a launch opinion.** 47 U.S.C. §230
  distinguishes information provided by another content provider and contains
  exceptions, including intellectual property; it does not eliminate the need
  for a defamation, privacy, publicity, or moderation review of this exact
  product ([statutory text](https://uscode.house.gov/view.xhtml?edition=prelim&num=0&req=granuleid%3AUSC-prelim-title47-section230)). Counsel should review how
  staff-written Profile fields, prompts, ranking, and Share Clips affect the
  analysis.
* **Impersonation.** California criminalizes knowingly creating a credible
  online impersonation without consent to harm, intimidate, threaten, or
  defraud ([Cal. Penal Code §528.5](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PEN&sectionNum=528.5.)). A Profile creator
  must never speak, message, or publish as the subject; **Community-created ·
  Unclaimed** and **Claimed** require distinct permissions as well as labels.
* **Employment-report boundary.** The federal Fair Credit Reporting Act can
  cover businesses that regularly assemble or evaluate character, reputation,
  or personal-characteristic information for third-party employment or other
  statutory eligibility decisions ([15 U.S.C. §1681a](https://uscode.house.gov/view.xhtml?edition=prelim&num=0&req=granuleid%3AUSC-prelim-title15-section1681a%28f%29)).
  Prohibit use or sale of Profiles and Reviews as employment, credit, housing,
  or insurance eligibility reports unless a separate counsel-led FCRA program
  is approved.
* **Protected-person escalation.** Federal law requires removal of specified
  sensitive information about covered federal judges and family after a
  qualifying request, on a short statutory timeline. The prohibited data is
  broader than this minimal Profile but can leak through later text or images
  ([Daniel Anderl Act, §§5933–5934](https://www.govinfo.gov/content/pkg/USCODE-2024-title28/pdf/USCODE-2024-title28-partIII.pdf)). Trust and Safety needs an urgent protected-person path; the
  Profile data model should not accept those fields in the first place.

## Spec-level decisions this research supports

The Profile specification should make the following testable:

* an Account can submit but cannot directly publish a new Profile;
* search-before-create and candidate acknowledgement precede submission;
* private eligibility evidence and photo provenance are required, while the
  public Profile remains minimal;
* moderators can approve, reject, correct, merge, split, suppress, and reverse
  an erroneous merge from an auditable case;
* a merge permanently redirects every former canonical URL to one survivor;
* a removal exposes no subject PII or reason, cannot be recreated through the
  ordinary flow, and returns a non-indexable absent state;
* subjects have correction, photo-dispute, impersonation, and removal-request
  routes whether or not they create or publicly associate an Account; and
* a neutral placeholder is the only fallback when photo rights or subject
  safety are unresolved.

Counsel must decide before implementation whether a verified subject receives
unconditional removal of the public identity shell, suppression/deindexing
while compliant third-party speech remains, or a jurisdiction-specific result.
