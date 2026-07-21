import type { AssessmentScenario } from "@/lib/types";

export const ASSESSMENT_SCENARIOS: AssessmentScenario[] = [
  {
    id: "missed-deadlines",
    title: "Strong engineer, unreliable delivery",
    prompt: "A senior engineer repeatedly misses deadlines but produces excellent technical work. What do you do first?",
    options: [
      {
        id: "clarify",
        label: "Set a direct expectations conversation and agree on checkpoints.",
        rationale: "Combines accountability with enough structure to diagnose the pattern.",
        effects: { focus: 12, authority: 8, challenge: 16, visibility: 8, care: 4 },
      },
      {
        id: "delegate",
        label: "Ask them to propose a recovery plan and own the new commitment.",
        rationale: "Preserves autonomy and tests whether clearer ownership resolves the issue.",
        effects: { authority: -14, posture: -10, decisionStyle: 10, challenge: 8 },
      },
      {
        id: "support",
        label: "Start by exploring workload, motivation, and personal constraints.",
        rationale: "Prioritizes diagnosis and psychological safety before changing controls.",
        effects: { focus: -8, care: 18, challenge: -4, visibility: 8, decisionStyle: 8 },
      },
      {
        id: "takeover",
        label: "Break the work into tasks and personally monitor daily execution.",
        rationale: "Maximizes immediate control but may reduce ownership for a senior employee.",
        effects: { focus: 16, authority: 20, posture: 18, decisionStyle: -14 },
      },
    ],
  },
  {
    id: "incident",
    title: "Production incident",
    prompt: "A customer-facing outage is escalating and ownership is unclear. What is your first move?",
    options: [
      {
        id: "commander",
        label: "Name an incident lead, assign roles, and set a reporting cadence.",
        rationale: "Creates temporary command clarity while work remains distributed.",
        effects: { focus: 18, authority: 18, posture: 15, visibility: 12, decisionStyle: -10 },
      },
      {
        id: "facilitate",
        label: "Bring everyone together and decide the response collaboratively.",
        rationale: "Builds shared understanding but may trade response speed for participation.",
        effects: { decisionStyle: 18, visibility: 12, authority: -8, care: 6 },
      },
      {
        id: "expert",
        label: "Take technical control and direct the fix yourself.",
        rationale: "May help when you are the key expert, but centralizes execution around you.",
        effects: { authority: 22, posture: 22, focus: 16, decisionStyle: -18 },
      },
      {
        id: "observe",
        label: "Let the team self-organize and step in only if progress stalls.",
        rationale: "Protects autonomy but risks ambiguity during a time-critical event.",
        effects: { authority: -20, posture: -18, risk: 12, decisionStyle: 12 },
      },
    ],
  },
  {
    id: "conflict",
    title: "Team conflict",
    prompt: "Two respected employees are in recurring conflict and the rest of the team is withdrawing. What do you do?",
    options: [
      {
        id: "mediate",
        label: "Facilitate a direct conversation with clear behavioral boundaries.",
        rationale: "Balances care, candour, and managerial responsibility.",
        effects: { care: 12, challenge: 16, authority: 6, visibility: 10, decisionStyle: 8 },
      },
      {
        id: "private",
        label: "Coach each person privately and let them resolve it themselves.",
        rationale: "Preserves autonomy but may under-address the team-level impact.",
        effects: { authority: -10, care: 12, challenge: 4, posture: -8 },
      },
      {
        id: "rule",
        label: "Set a firm rule for acceptable conduct and enforce it immediately.",
        rationale: "Creates clarity quickly but may leave causes and repair unaddressed.",
        effects: { authority: 16, challenge: 18, posture: 14, decisionStyle: -12 },
      },
      {
        id: "wait",
        label: "Give the conflict more time unless delivery is affected.",
        rationale: "Avoids intervention, but silence may be experienced as permission.",
        effects: { authority: -12, challenge: -18, care: -4, posture: -10 },
      },
    ],
  },
  {
    id: "new-product",
    title: "Uncertain new product",
    prompt: "Your team has six weeks to test a promising but poorly understood product opportunity. How do you frame the work?",
    options: [
      {
        id: "experiments",
        label: "Define learning goals and fund several small reversible experiments.",
        rationale: "Optimizes discovery while containing risk.",
        effects: { operatingMode: 20, risk: 14, change: 8, authority: -8, decisionStyle: 10 },
      },
      {
        id: "vision",
        label: "Set a bold product vision and let the team determine the path.",
        rationale: "Creates ambition and ownership, with a greater need for guardrails.",
        effects: { change: 18, operatingMode: 18, authority: -14, posture: -10 },
      },
      {
        id: "plan",
        label: "Create a detailed delivery plan before allowing implementation.",
        rationale: "Improves coordination but can imply certainty that does not exist.",
        effects: { focus: 12, authority: 14, operatingMode: -12, risk: -10 },
      },
      {
        id: "prototype",
        label: "Build the most complete prototype possible and judge market reaction.",
        rationale: "Creates tangible output but concentrates learning into one larger bet.",
        effects: { focus: 14, change: 14, operatingMode: 10, risk: -8 },
      },
    ],
  },
  {
    id: "junior-growth",
    title: "Junior employee asks for ownership",
    prompt: "A motivated junior employee wants to lead an important project in an unfamiliar domain. What do you offer?",
    options: [
      {
        id: "bounded",
        label: "Give them ownership with explicit boundaries and frequent coaching.",
        rationale: "Pairs stretch with scaffolding and progressive independence.",
        effects: { authority: 6, care: 14, challenge: 10, visibility: 14, posture: -4 },
      },
      {
        id: "full",
        label: "Give them full ownership to show that you trust them.",
        rationale: "Signals trust strongly but may mistake aspiration for readiness.",
        effects: { authority: -20, posture: -14, risk: 12, decisionStyle: 10 },
      },
      {
        id: "observe",
        label: "Have them shadow a senior lead before taking responsibility.",
        rationale: "Reduces immediate risk but can delay meaningful learning.",
        effects: { authority: 14, risk: -12, operatingMode: -8, care: 6 },
      },
      {
        id: "decline",
        label: "Decline until they have more experience in the domain.",
        rationale: "Prioritizes proven competence and prevention.",
        effects: { authority: 18, risk: -18, operatingMode: -12, change: -8 },
      },
    ],
  },
  {
    id: "strategy-change",
    title: "Major strategy change",
    prompt: "Leadership has chosen a major strategic shift that your team did not propose. How do you introduce it?",
    options: [
      {
        id: "explain-consult",
        label: "Explain the non-negotiables, invite input on execution, and surface risks.",
        rationale: "Preserves decision clarity while sharing implementation ownership.",
        effects: { visibility: 18, decisionStyle: 12, authority: 4, care: 8, challenge: 8 },
      },
      {
        id: "announce",
        label: "Announce the decision and quickly assign the new work.",
        rationale: "Prioritizes speed and certainty but limits local sensemaking.",
        effects: { authority: 18, posture: 14, decisionStyle: -16, focus: 10 },
      },
      {
        id: "reopen",
        label: "Ask the team to debate whether the strategy is correct before acting.",
        rationale: "Maximizes participation but may create false decision authority.",
        effects: { decisionStyle: 20, authority: -16, visibility: 8, focus: -8 },
      },
      {
        id: "shield",
        label: "Translate it into local work without discussing organizational uncertainty.",
        rationale: "Filters disruption but reduces legibility and trust if context emerges later.",
        effects: { visibility: -20, care: 6, focus: 8, decisionStyle: -8 },
      },
    ],
  },
];
