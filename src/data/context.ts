import type { ContextDefinition, SituationContext } from "@/lib/types";

export const DEFAULT_CONTEXT: SituationContext = {
  experience: 65,
  confidence: 65,
  trust: 70,
  urgency: 40,
  failureConsequence: 45,
  uncertainty: 50,
  reversibility: 65,
  innovation: 55,
};

export const CONTEXT_DEFINITIONS: ContextDefinition[] = [
  {
    key: "experience",
    name: "Team experience",
    lowLabel: "New to the work",
    highLabel: "Deeply experienced",
    description: "How much task-relevant judgment and domain context the team already has.",
  },
  {
    key: "confidence",
    name: "Team confidence",
    lowLabel: "Hesitant",
    highLabel: "Self-assured",
    description: "How ready the team feels to act without frequent reassurance or approval.",
  },
  {
    key: "trust",
    name: "Trust level",
    lowLabel: "Damaged or new",
    highLabel: "Established",
    description: "How safe and credible the relationship currently feels in both directions.",
  },
  {
    key: "urgency",
    name: "Urgency",
    lowLabel: "Time to learn",
    highLabel: "Immediate response",
    description: "How much delay changes the cost or outcome of the situation.",
  },
  {
    key: "failureConsequence",
    name: "Consequence of failure",
    lowLabel: "Low impact",
    highLabel: "Severe or irreversible",
    description: "How damaging a poor decision would be to people, customers, compliance, or the business.",
  },
  {
    key: "uncertainty",
    name: "Degree of uncertainty",
    lowLabel: "Well understood",
    highLabel: "Ambiguous",
    description: "How much of the problem, solution, or environment is still unknown.",
  },
  {
    key: "reversibility",
    name: "Decision reversibility",
    lowLabel: "Hard to undo",
    highLabel: "Easy to reverse",
    description: "How safely the team can learn by trying something and changing course.",
  },
  {
    key: "innovation",
    name: "Need for innovation",
    lowLabel: "Execute the known",
    highLabel: "Discover something new",
    description: "Whether the work rewards consistency or novel approaches.",
  },
];
