import type { Archetype } from "@/lib/types";

// center values: focus, authority, care, challenge, operatingMode, change
// used for archetype matching — all other dimensions assumed neutral (50)
const center = (
  focus: number,
  authority: number,
  care: number,
  challenge: number,
  operatingMode: number,
  change: number,
) => ({ focus, authority, care, challenge, operatingMode, change });

export const ARCHETYPES: Archetype[] = [
  // ── H + A (people-focused, autonomous/enabling) ──────────────────────────
  {
    code: "HANS",
    name: "Trusted Cultivator",
    description:
      "Builds durable teams through trust, continuity, and small improvements that compound over time.",
    strengths: ["Psychological safety", "Sustainable growth", "Delegated ownership"],
    watchouts: ["Can tolerate drift too long", "May underreact to structural problems"],
    center: center(25, 25, 75, 35, 25, 25),
  },
  {
    code: "HANX",
    name: "Culture Architect",
    description:
      "Protects people and autonomy while reshaping the systems, norms, or structure around them.",
    strengths: ["Values-led change", "Distributed ownership", "Cultural renewal"],
    watchouts: ["Change can lack a single driver", "Consensus may slow the reset"],
    center: center(25, 25, 72, 38, 65, 72),
  },
  {
    code: "HACS",
    name: "Experimental Coach",
    description:
      "Raises the bar through frequent experiments, honest feedback, and a safe licence to fail fast.",
    strengths: ["Learning velocity", "Candid development", "Low-risk challenge"],
    watchouts: ["Can diffuse priorities", "May not force a decisive bet"],
    center: center(25, 25, 40, 70, 30, 28),
  },
  {
    code: "HACX",
    name: "Visionary Enabler",
    description:
      "Sets an ambitious destination, challenges people to own the journey, and encourages bold discovery.",
    strengths: ["Inspiration", "Innovation", "High ownership"],
    watchouts: ["Can create ambiguity", "Needs strong strategic guardrails"],
    center: center(25, 25, 42, 72, 74, 74),
  },

  // ── H + D (people-focused, directive) ────────────────────────────────────
  {
    code: "HDNS",
    name: "Supportive Guide",
    description:
      "Provides close structure and personal support while helping a team build confidence and consistency.",
    strengths: ["Clear expectations", "Skill building", "Reliable support"],
    watchouts: ["Can foster dependence", "May retain decisions too long"],
    center: center(25, 75, 78, 32, 25, 25),
  },
  {
    code: "HDNX",
    name: "Change Shepherd",
    description:
      "Leads people carefully through a major transition with clear direction and emotional steadiness.",
    strengths: ["Change clarity", "Reassurance", "Coordinated movement"],
    watchouts: ["Can become paternalistic", "May overmanage capable people"],
    center: center(25, 75, 74, 36, 60, 72),
  },
  {
    code: "HDCS",
    name: "Learning Director",
    description:
      "Creates a structured developmental environment with explicit coaching, high standards, and clear guardrails.",
    strengths: ["Guided growth", "Fast feedback loops", "Developing newer teams"],
    watchouts: ["Can feel prescriptive", "Manager can become a bottleneck"],
    center: center(25, 75, 42, 72, 28, 26),
  },
  {
    code: "HDCX",
    name: "Transformational Coach",
    description:
      "Combines personal investment with strong direction and high challenge to carry people through an ambitious reset.",
    strengths: ["Mobilizing change", "High accountability", "Visible leadership"],
    watchouts: ["Emotionally intensive", "Can crowd out team ownership"],
    center: center(25, 75, 44, 74, 74, 74),
  },

  // ── R + A (results-focused, autonomous/enabling) ──────────────────────────
  {
    code: "RANS",
    name: "Delivery Partner",
    description:
      "Gets strong results through talented people — holds them to outcomes while genuinely investing in their wellbeing.",
    strengths: ["Sustainable performance", "Talent retention", "Clear accountability with care"],
    watchouts: ["Can avoid necessary hard conversations", "Standards may slip to protect relationships"],
    center: center(75, 25, 72, 38, 26, 26),
  },
  {
    code: "RANX",
    name: "Systems Reformer",
    description:
      "Delegates a major redesign to strong owners, keeping people supported while driving measurable outcomes.",
    strengths: ["System-level change", "Executive leverage", "Ownership at scale"],
    watchouts: ["Change burden may be uneven", "Can underinvest in emotional transition"],
    center: center(75, 25, 68, 40, 64, 72),
  },
  {
    code: "RACS",
    name: "Entrepreneurial Operator",
    description:
      "Uses autonomy and rapid iteration to push for results in uncertain, fast-moving environments.",
    strengths: ["Speed", "Initiative", "Market learning"],
    watchouts: ["Coordination debt", "Can reward motion over reflection"],
    center: center(75, 25, 36, 72, 72, 26),
  },
  {
    code: "RACX",
    name: "Venture Builder",
    description:
      "Gives strong owners broad freedom to pursue a bold, discontinuous opportunity under high challenge.",
    strengths: ["0-to-1 execution", "Bold bets", "Independent leadership"],
    watchouts: ["High variance", "Weak guardrails can create costly divergence"],
    center: center(75, 25, 38, 74, 74, 74),
  },

  // ── R + D (results-focused, directive) ───────────────────────────────────
  {
    code: "RDNS",
    name: "Process Steward",
    description:
      "Creates dependable execution through clear standards and direction while maintaining genuine care for the team.",
    strengths: ["Predictability", "Quality control", "Operational discipline"],
    watchouts: ["Can suppress initiative", "Rules may outlive their purpose"],
    center: center(75, 75, 68, 36, 26, 26),
  },
  {
    code: "RDNX",
    name: "Transformation Director",
    description:
      "Centralizes decisions to redesign a system around clear outcomes while keeping people supported through the change.",
    strengths: ["Decisive restructuring", "Coordinated execution", "People-aware accountability"],
    watchouts: ["Low local ownership", "Change fatigue"],
    center: center(75, 75, 64, 40, 62, 72),
  },
  {
    code: "RDCS",
    name: "Delivery Driver",
    description:
      "Applies strong structure, high challenge, and relentless pace to produce concrete results under pressure.",
    strengths: ["Momentum", "Focused execution", "Rapid decisions"],
    watchouts: ["Can exhaust the team", "Low tolerance for ambiguity or slowness"],
    center: center(75, 75, 34, 74, 72, 26),
  },
  {
    code: "RDCX",
    name: "Turnaround Commander",
    description:
      "Uses concentrated authority, urgency, and major challenge to restore a failing situation quickly.",
    strengths: ["Crisis clarity", "Fast reset", "Hard prioritization"],
    watchouts: ["Low sustainability", "Trust and ownership can erode"],
    center: center(75, 75, 36, 76, 74, 74),
  },
];
