# Social graph and messaging: primary-source findings

Research was time-boxed to current first-party product and safety documentation.
The sources describe patterns, not requirements to copy another product.

## Follow and Connection

- LinkedIn distinguishes one-way **Follow**, which subscribes to public content,
  from a mutual **Connection**, which represents a known two-way relationship and
  enables direct messaging. It recommends Follow when the people do not know one
  another. [LinkedIn: Follow and connect](https://www.linkedin.com/help/linkedin/answer/a6264256)
- LinkedIn limits connection invitations, may restrict Accounts whose invitations
  are unwanted, and recommends fewer, contextual invitations. This supports keeping
  content subscription separate from relationship claims and message consent.
  [LinkedIn: Alternatives to inviting](https://www.linkedin.com/help/linkedin/answer/a551295)

## Message requests and recipient control

- LinkedIn puts first contact from some non-connections in a request inbox, lets
  recipients accept or privately decline, prevents attachments before acceptance,
  and may limit outbound requests. [LinkedIn: Message requests](https://www.linkedin.com/help/linkedin/answer/a552485/send-receive-and-manage-message-requests)
- X keeps requests separate until acceptance, hides media, withholds request read
  receipts, filters low-quality requests without notifications, and provides accept,
  delete, report, and block controls. [X: Direct Messages](https://help.x.com/en/using-x/direct-messages)
- Instagram and Discord similarly separate unknown-sender requests and suspicious or
  spam requests from the main inbox, requiring acceptance before ordinary chat.
  [Instagram: Hidden requests](https://www.facebook.com/help/instagram/194599462478093?locale=en_GB)
  [Discord: Message Requests](https://support.discord.com/hc/en-us/articles/7924992471191-Message-Requests)

## Safety and conversation behavior

- LinkedIn detects suspicious attempts to move a conversation off-platform, displays
  warnings, and keeps report available even for edited or deleted messages.
  [LinkedIn: Detect and avoid scams](https://www.linkedin.com/help/linkedin/answer/a1355851/detect-and-avoid-scams-in-your-messages?lang=en)
- LinkedIn treats repetitive messages, suspicious links, requests for money or
  personal information, spam, scams, and harassment as reportable behavior; reporting
  does not reveal the reporter. [LinkedIn: Report abusive content](https://www.linkedin.com/help/linkedin/answer/a1344213/recognize-and-report-spam-inappropriate-and-abusive-content?lang=en)
- X lets participants mute conversation notifications and toggle read receipts, but a
  request sender cannot see that a request was read before acceptance. X also warns
  that deleting a message is local and does not remove the other participant's copy.
  [X: Direct Messages](https://help.x.com/en/using-x/direct-messages)

## Product implications

The launch model should use one-way Follow for content interest and omit Connection
until mutuality unlocks a distinct capability. First contact should be one bounded,
text-only request with contextual identity, recipient opt-in, private decline,
pair-level replay protection, Account quotas, filtering, block, and report. Accepted
conversations should keep local archive/mute controls distinct from shared state,
label edits, avoid recall promises, and expose no read receipts at launch.
