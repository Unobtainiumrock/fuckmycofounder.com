# Share Cards — Spec Delta

## ADDED Requirements

### Requirement: Result cards render client-side in two ratios
The quiz result SHALL be renderable as downloadable PNG cards in 9:16
(Stories/TikTok/Reels) and 1.91:1 (attach-to-post) using the case-file visual
language, generated entirely in the browser via canvas.

#### Scenario: Card download
- **WHEN** the taker requests a card in either ratio
- **THEN** a PNG at the correct dimensions downloads, showing the Cooked
  Score and condition label

### Requirement: One share button, platform-appropriate behavior
The result page SHALL present a single primary share action: where the Web
Share API with file support is available, it SHALL open the native share
sheet with the result card image and result link attached; otherwise it SHALL
offer card download and copy-link.

#### Scenario: Mobile share
- **WHEN** share is tapped on a browser supporting navigator.share with files
- **THEN** the native share sheet opens pre-loaded with the card and the link

#### Scenario: Desktop share
- **WHEN** share is clicked where the Web Share API is unavailable
- **THEN** the card downloads and the result link is offered for copying

### Requirement: Per-page static OG images
The quiz landing page and every toolkit page SHALL declare page-specific
1200x630 OG/Twitter card images, pre-rendered as static assets, so pasted
links unfurl with distinctive page-matched cards.

#### Scenario: Link pasted into an unfurling platform
- **WHEN** /cooked/ or a toolkit URL is pasted where OG unfurls render
- **THEN** the platform displays that page's own card, not the site-generic one
