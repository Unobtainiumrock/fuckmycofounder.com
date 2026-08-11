export const charges = [
  { id: "quick-sync", emoji: "📅", label: "Weaponized ‘Quick Sync’" },
  { id: "equity-amnesia", emoji: "🧠", label: "Selective Equity Amnesia" },
  { id: "pivot-addiction", emoji: "🌀", label: "Chronic Pivot Addiction" },
  { id: "roadmap-ghosting", emoji: "👻", label: "Ghosting the Roadmap" },
  { id: "ceo-vibes", emoji: "👑", label: "CEO by Vibes Alone" },
  { id: "technical-quotes", emoji: "💻", label: "‘Technical’ in Air Quotes" },
  { id: "calendar-coup", emoji: "🗓️", label: "Attempted Calendar Coup" },
  { id: "runway-literal", emoji: "✈️", label: "Took ‘Runway’ Literally" },
] as const;

export const severities = [
  "Pre-Seed but Post-Trust",
  "Series A-nxiety",
  "Board-Meeting Orange",
  "Runway Critical",
  "Enterprise-Grade Yikes",
  "Unscheduled Offsite",
] as const;

export const dispositions = [
  "Circle back after one legally meaningful nap.",
  "Approved for immediate removal from the shared calendar.",
  "Tabled until somebody learns what ‘alignment’ means.",
  "Referred to the Department of Please Be Serious.",
  "One final warning, delivered via aggressively neutral Slack emoji.",
  "Motion carries. The vibes do not.",
] as const;
