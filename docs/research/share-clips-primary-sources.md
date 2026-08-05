# Share Clips — primary-source platform requirements

Researched: 2026-08-04

Scope: canonical link sharing, downloadable image clips, Web Share delivery,
social preview metadata, launch image formats, QR provenance, and accessibility.
Platform behavior changes independently of this repository, so the launch gate
must include tests against public URLs and real target apps.

## Implementation conclusions

1. Treat `navigator.share()` as progressive enhancement. Always keep ordinary
   **Copy link** and **Download clip** actions available; feature detection alone
   does not prove that a particular file or destination works.
2. Generate three assets from one immutable clip model. Layout may reflow into
   format-specific safe areas, but the selected source words must not change:
   - **square:** 1080 × 1080 (1:1), the safest common direct-image export for X,
     LinkedIn, and Instagram Feed;
   - **story:** 1080 × 1920 (9:16), a product export choice consistent with
     Meta's official 9:16 Story guidance, not a currently published first-party
     minimum pixel requirement;
   - **link preview:** 1200 × 627 (about 1.91:1), matching LinkedIn's explicit
     preview requirement.
3. Every canonical landing page should emit server-visible Open Graph metadata
   and a publicly fetchable HTTPS preview image. Use the canonical object URL—not
   a temporary download URL, signed media URL, or third-party shortener—as both
   `og:url` and the shared URL.
4. The image must remain truthful when detached from its page: keep the site
   domain and compact case identifier visible, but do not rely on a QR code as
   the only destination or provenance signal.
5. Treat accessibility as a parallel text contract. Render the exact excerpt
   and context as real text beside the in-product preview, emit `og:image:alt`,
   and offer a concise suggested image description/caption for users to copy.
   The Web Share API has no field that can set a destination platform's alt text.

## Web Share API

### Hard technical constraints

- `navigator.share()` and `navigator.canShare()` are secure-context APIs. The
  share call requires and consumes transient user activation, so it must be made
  from a user gesture such as a button click; it is also controlled by the `web-share`
  Permissions Policy, whose default allowlist is `self`. Third-party iframes need
  explicit permission. ([W3C Web Share Recommendation, 30 May 2023; accessed
  2026-08-04](https://www.w3.org/TR/web-share/))
- A share must contain at least one recognized `title`, `text`, `url`, or `files`
  member. Targets may ignore unknown members, and a target may ignore `title`.
  Invalid URLs, unsupported files, hostile files, a blocked policy, lost user
  activation, another active share, no target, cancellation, or transport failure
  can all reject the promise. ([MDN `Navigator.share()`; updated 2026-07-20,
  accessed 2026-08-04](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share))
- File support must be checked with the actual `File[]` via
  `navigator.canShare({ files })`; a browser can support link sharing without
  supporting that file share, MIME type, size, or combination of members. The
  standard also permits the user agent to reject a file as a potentially hostile
  share. ([W3C Web Share Recommendation, 30 May 2023; accessed
  2026-08-04](https://www.w3.org/TR/web-share/))

### Required product behavior

- Prepare the clip file before, or promptly within, the click flow so
  `navigator.share()` is invoked while activation still exists.
- Test `navigator.share` before link/text sharing and both `navigator.share` and
  `navigator.canShare({ files: [clipFile] })` before file sharing. Test the exact
  final payload if it also contains text or a URL, and test members separately
  because unknown dictionary members can be ignored rather than rejected.
- A resolved promise does not consistently mean the recipient published or even
  completed the share: the W3C calls the operation “fire and forget,” and MDN
  documents different resolution points on Windows and Android. Do not record
  “published” or award conversion credit from resolution.
- Treat `AbortError` as user cancellation/no available target, not a product
  failure. Keep explicit Copy link and Download actions visible instead of
  automatically opening another chooser. If clipboard writing is unavailable,
  expose the canonical URL as selectable text and a normal `<a href>`.
- Do not assume a named platform will be present. Share targets are chosen by the
  browser/OS, and the API is still marked “Limited availability” by MDN.

## Open Graph and link previews

### Protocol requirements

The Open Graph protocol requires `og:title`, `og:type`, `og:image`, and
`og:url`; `og:url` is the object's canonical permanent identifier. It recommends
`og:description`, and its image structured properties include `og:image:type`,
`og:image:width`, `og:image:height`, `og:image:secure_url`, and
`og:image:alt`. When `og:image` exists, the protocol says it should have
`og:image:alt`. If multiple images are declared, the first has preference during
conflicts. ([Open Graph protocol; accessed 2026-08-04](https://ogp.me/))

For each shareable Profile, Review, or Comment page, emit at least:

```html
<meta property="og:title" content="…">
<meta property="og:type" content="website">
<meta property="og:url" content="https://fuckmycofounder.com/…">
<meta property="og:description" content="…">
<meta property="og:image" content="https://fuckmycofounder.com/…/preview.png">
<meta property="og:image:secure_url" content="https://fuckmycofounder.com/…/preview.png">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="627">
<meta property="og:image:alt" content="…">
```

LinkedIn separately says `og:title`, `og:image`, `og:description`, and `og:url`
**must** exist for its sharing module, and that the preview image must be no larger than 5 MB,
at least 1200 × 627, and preferably 1.91:1. It warns that protected images or
sites that block its fetcher may not preview, and that metadata can remain cached
for up to 48 hours after a change. ([LinkedIn website-sharing requirements;
updated about 2024, accessed 2026-08-04](https://www.linkedin.com/help/linkedin/answer/a521928),
[LinkedIn URL troubleshooting; updated about 2023, accessed
2026-08-04](https://www.linkedin.com/help/linkedin/answer/a525063))

**Conclusion:** metadata and preview-image fetchability are part of the public
landing-page contract. A repository test can verify tags and dimensions, but
cannot prove crawler access, caching, or final rendering; perform live preview
acceptance after deployment.

## Launch image surfaces

| Surface | First-party guidance available on 2026-08-04 | Status and decision |
|---|---|---|
| X direct image | A single image between **2:1 and 3:4** displays in full. Photos may be up to **5 MB** and X accepts GIF, JPEG, and PNG. ([X Help, accessed 2026-08-04](https://help.x.com/en/using-x/posting-gifs-and-pictures)) | Platform rule. Use the 1:1 export for the launch X action; the 9:16 Story asset falls outside the documented full-display range. |
| X link card | The former first-party `developer.x.com/.../cards/...` pages redirect to the generic X API overview as of 2026-08-04; no current public X source establishing card image dimensions was found. | Evidence gap. Do not make old Twitter Card dimensions a normative requirement. Emit sound OG metadata and validate the deployed URL on X before launch. |
| LinkedIn link preview | **1200 × 627**, about **1.91:1**, max **5 MB**. ([LinkedIn Help, accessed 2026-08-04](https://www.linkedin.com/help/linkedin/answer/a521928)) | Platform requirement/recommendation. Use the link-preview export. |
| LinkedIn direct image | Minimum **552 × 276**, recommended width **1080**, max **5 MB**, accepted aspect ratios **3:1 through 4:5**; wider ratios are centered and cropped. ([LinkedIn Help; updated about 2025, accessed 2026-08-04](https://www.linkedin.com/help/linkedin/answer/a527229)) | Platform rule. The square export is valid. |
| Instagram Feed photo | Instagram preserves original resolution from **320–1080 px wide** when the ratio is **1.91:1 through 3:4**; other ratios are cropped, lower widths enlarged, and higher widths reduced to 1080. ([Instagram Help, accessed 2026-08-04](https://www.facebook.com/help/1631821640426723/)) | Platform rule. The 1080 × 1080 square export is valid. A 1080 × 1440 (3:4) variant could be added later, but is not needed for the three-format launch. |
| Instagram Story | Meta's current troubleshooting guidance identifies **9:16** as the Story ratio and also accepts ratios from **4:5 through 1.91:1** for boosted Stories. For Story ads with a CTA sticker, Meta advises leaving about **14% at the top and 20% at the bottom** free of key text/logos. ([Instagram Story troubleshooting](https://www.facebook.com/help/instagram/411192286082878/), [Instagram link-sticker guidance](https://www.facebook.com/help/instagram/192168966243613); accessed 2026-08-04) | Ratio and ad safe areas are first-party; the commonly used 1080 × 1920 resolution was not found as a current public organic-Story requirement. Use it as a crisp 9:16 product export, keep essential content out of those conservative overlay areas, and test in-app. The Help pages may redirect to login. |

The cited Instagram Help content was visible through first-party indexed results,
but direct opens intermittently redirected to Facebook login or a temporary-block
page. Treat those pages as access-constrained evidence and refresh them during
launch acceptance.

## Accessibility and QR/link provenance

- X, LinkedIn, and Instagram all expose author-supplied alternative text for
  uploaded images. Their first-party instructions establish the platform
  capability, not an API guarantee that a Web Share file receives alt text.
  ([X image descriptions, accessed 2026-08-04](https://help.x.com/en/using-x/add-image-descriptions),
  [LinkedIn alt text; updated about 2025, accessed
  2026-08-04](https://www.linkedin.com/help/linkedin/answer/a519856),
  [Instagram alt text, accessed 2026-08-04](https://www.facebook.com/help/instagram/503708446705527/))
- WCAG 2.2 requires a text alternative for non-text content that serves the
  equivalent purpose (SC 1.1.1), and requires a link's purpose to be determinable
  from its text or context (SC 2.4.4). These are conformance requirements when
  the product claims WCAG 2.2, not QR-specific sizing rules. ([WCAG 2.2 SC
  1.1.1](https://www.w3.org/TR/WCAG22/#non-text-content), [WCAG 2.2 SC
  2.4.4](https://www.w3.org/TR/WCAG22/#link-purpose-in-context); accessed
  2026-08-04)
- US Section 508 guidance treats a digital QR code as a functional image: give
  it purpose-based alt text, a descriptive label, and an adjacent accessible
  text link/URL for people who cannot scan it. It also recommends high contrast,
  user control, and cross-device/assistive-technology testing. This is federal
  implementation guidance, not a universal QR specification. ([Section508.gov,
  reviewed October 2024; accessed 2026-08-04](https://www.section508.gov/blog/accessibility-bytes/qr-codes/))
- The FTC warns that QR codes can conceal spoofed links and tells users to
  inspect the URL and look for misspellings before opening it. ([FTC Consumer
  Advice, 6 December 2023; accessed 2026-08-04](https://consumer.ftc.gov/consumer-alerts/2023/12/scammers-hide-harmful-links-qr-codes-steal-your-information))

**Conclusion:** if a clip includes a QR code, encode the same canonical HTTPS
URL used by `og:url`, print the recognizable first-party domain beside it, and
avoid opaque shorteners or mutable third-party dynamic-QR services. On the web,
the adjacent canonical link is the accessible control; the QR is redundant
convenience. Suggested alt text should identify the clip type, subject/context,
exact quoted text, attribution mode, and the canonical destination without
starting with “image of.”

## Acceptance boundary

Repository tests should prove deterministic dimensions, safe-area/crop fixtures,
exact excerpts, metadata presence, public-style non-expiring image URLs, and
Web Share/copy/download branches. Deployment tests should prove HTTPS and
anonymous crawler access. Live acceptance should separately verify one deployed
Profile, Review, and Comment on X, LinkedIn, Instagram Feed/Story, plus at least
one supported and one unsupported Web Share/file-share environment. Official
documentation does not substitute for that final provider behavior check.
