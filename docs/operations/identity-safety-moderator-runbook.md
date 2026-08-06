# Identity and safety moderator runbook

Status: repository workflow. Production staffing, service levels, emergency
contacts, and provider access are not authorized or selected.

## Intake and triage

1. Open only the assigned Moderation Case. Confirm the target snapshot and
   report grouping; report count is not proof.
2. For `threat-or-imminent-harm`, show the standard emergency-services guidance
   and move the case to the urgent queue. Ordinary moderation is not emergency
   response.
3. Move `received` to `triaged`, then `investigating` when review starts. A
   deleted target stays deleted; use the restricted snapshot without restoring
   it.
4. Request a restricted reveal only when the case cannot be decided without it.
   Record the case reason and approver, reveal the minimum field, and never copy
   it into ordinary notes or logs.

## Decisions and notices

Choose only one justified outcome: no action, changes required, visibility
limitation, removal, Account limitation, Account suspension, or Profile Claim
revocation. Case state, object visibility, Account enforcement, and claim state
remain separate. The notice states target, policy reason, action, effective
time, scope/duration, and appeal route, withholding only a detail whose release
would create a recorded safety or integrity risk. Never name a reporter or
anonymous author.

Changes-required material returns to review; an edit is not auto-published.
Blocking is not a takedown. Claim revocation removes owner controls and claimed
markers without deleting the independent Profile.

## Appeals and closure

Eligible appeals arrive within 30 days. Preserve the original decision and
evidence snapshot, keep the action effective by default, and assign a qualified
reviewer who did not issue the original decision. Record a new decision rather
than editing the old one. Close only after notices, appeal handling, and
retention triggers are recorded.

## Retention and incident handling

Claim evidence normally expires 90 days after final decision; safety/audit
records normally expire 24 months after final resolution. An active appeal or
authorized legal hold pauses only its affected category. A retention receipt
must not repeat deleted content. If policy, intake, attribution, persistence, or
audit is unavailable, stop the sensitive action, preserve a safe retry, and do
not issue a false receipt.

Escalate suspected credential compromise, unauthorized restricted reveal,
audit mutation, evidence exfiltration, coordinated evasion, or a failed
retention job through the approved incident channel once operations authority
defines it. Preserve only proportionate evidence and do not broaden ordinary
logging.
