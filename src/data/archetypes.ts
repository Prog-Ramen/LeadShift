import type { Archetype } from "@/lib/types";

const center = (
  focus: number,
  authority: number,
  operatingMode: number,
  change: number,
) => ({ focus, authority, operatingMode, change });

export const ARCHETYPES: Archetype[] = [
  {
    code: "HASI",
    name: "Trusted Cultivator",
    description:
      "Builds durable teams through trust, continuity, and small improvements that compound over time.",
    strengths: ["Psychological safety", "Sustainable growth", "Delegated ownership"],
    watchouts: ["Can tolerate drift too long", "May underreact to structural problems"],
    center: center(25, 25, 25, 25),
  },
  {
    code: "HAST",
    name: "Culture Architect",
    description:
      "Protects people and autonomy while reshaping the systems, norms, or structure around them.",
    strengths: ["Values-led change", "Distributed ownership", "Cultural renewal"],
    watchouts: ["Change can lack a single driver", "Consensus may slow the reset"],
    center: center(25, 25, 25, 75),
  },
  {
    code: "HAEI",
    name: "Experimental Coach",
    description:
      "Creates a safe learning environment where people improve through small, frequent experiments.",
    strengths: ["Learning velocity", "Creative confidence", "Low-risk experimentation"],
    watchouts: ["Can diffuse priorities", "May not force a decisive bet"],
    center: center(25, 25, 75, 25),
  },
  {
    code: "HAET",
    name: "Visionary Enabler",
    description:
      "Sets an ambitious destination, gives people ownership, and encourages discovery along the way.",
    strengths: ["Inspiration", "Innovation", "High ownership"],
    watchouts: ["Can create ambiguity", "Needs strong strategic guardrails"],
    center: center(25, 25, 75, 75),
  },
  {
    code: "HDSI",
    name: "Supportive Guide",
    description:
      "Provides close structure and personal support while helping a team build confidence and consistency.",
    strengths: ["Clear expectations", "Skill building", "Reliable support"],
    watchouts: ["Can foster dependence", "May retain decisions too long"],
    center: center(25, 75, 25, 25),
  },
  {
    code: "HDST",
    name: "Change Shepherd",
    description:
      "Leads people carefully through a major transition with clear direction and emotional steadiness.",
    strengths: ["Change clarity", "Reassurance", "Coordinated movement"],
    watchouts: ["Can become paternalistic", "May overmanage capable people"],
    center: center(25, 75, 25, 75),
  },
  {
    code: "HDEI",
    name: "Learning Director",
    description:
      "Creates a structured experimental environment with explicit coaching, cadence, and guardrails.",
    strengths: ["Guided discovery", "Fast feedback", "Developing newer teams"],
    watchouts: ["Experiments may feel prescribed", "Manager can become a bottleneck"],
    center: center(25, 75, 75, 25),
  },
  {
    code: "HDET",
    name: "Transformational Coach",
    description:
      "Combines personal investment with strong direction to carry people through an ambitious reset.",
    strengths: ["Mobilizing change", "High support", "Visible leadership"],
    watchouts: ["Emotionally intensive", "Can crowd out team ownership"],
    center: center(25, 75, 75, 75),
  },
  {
    code: "RASI",
    name: "Operational Delegator",
    description:
      "Defines outcomes and lets capable operators run stable systems with minimal interference.",
    strengths: ["Efficiency", "Clear accountability", "Scalable ownership"],
    watchouts: ["People needs can go unseen", "May optimize the status quo"],
    center: center(75, 25, 25, 25),
  },
  {
    code: "RAST",
    name: "Systems Reformer",
    description:
      "Delegates a major redesign to strong owners while keeping attention on measurable outcomes.",
    strengths: ["System-level change", "Executive leverage", "Ownership at scale"],
    watchouts: ["Change burden may be uneven", "Can underinvest in emotional transition"],
    center: center(75, 25, 25, 75),
  },
  {
    code: "RAEI",
    name: "Entrepreneurial Operator",
    description:
      "Uses autonomy and rapid iteration to pursue results in uncertain, fast-moving environments.",
    strengths: ["Speed", "Initiative", "Market learning"],
    watchouts: ["Coordination debt", "Can reward motion over reflection"],
    center: center(75, 25, 75, 25),
  },
  {
    code: "RAET",
    name: "Venture Builder",
    description:
      "Gives strong owners broad freedom to pursue a bold, discontinuous opportunity.",
    strengths: ["0-to-1 execution", "Bold bets", "Independent leadership"],
    watchouts: ["High variance", "Weak guardrails can create costly divergence"],
    center: center(75, 25, 75, 75),
  },
  {
    code: "RDSI",
    name: "Process Steward",
    description:
      "Creates dependable execution through standards, direction, and continuous process improvement.",
    strengths: ["Predictability", "Quality control", "Operational discipline"],
    watchouts: ["Can suppress initiative", "Rules may outlive their purpose"],
    center: center(75, 75, 25, 25),
  },
  {
    code: "RDST",
    name: "Transformation Director",
    description:
      "Centralizes decisions to redesign a stable but underperforming system around clear outcomes.",
    strengths: ["Decisive restructuring", "Coordinated execution", "Accountability"],
    watchouts: ["Low local ownership", "Change fatigue"],
    center: center(75, 75, 25, 75),
  },
  {
    code: "RDEI",
    name: "Delivery Driver",
    description:
      "Applies strong structure and pace to exploratory work so uncertainty still produces concrete results.",
    strengths: ["Momentum", "Focused experimentation", "Rapid decisions"],
    watchouts: ["Can overconstrain discovery", "Sustained pace may exhaust the team"],
    center: center(75, 75, 75, 25),
  },
  {
    code: "RDET",
    name: "Turnaround Commander",
    description:
      "Uses concentrated authority, urgency, and major change to restore a failing situation quickly.",
    strengths: ["Crisis clarity", "Fast reset", "Hard prioritization"],
    watchouts: ["Low sustainability", "Trust and ownership can erode"],
    center: center(75, 75, 75, 75),
  },
];
