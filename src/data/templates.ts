import type { ManagementProfile } from "@/lib/types";
import type { TripleProfile } from "@/lib/url-compression";
import { DEFAULT_PROFILE } from "@/data/dimensions";

const makeProfile = (overrides: Partial<ManagementProfile>): ManagementProfile => ({
  ...DEFAULT_PROFILE,
  ...overrides,
});

export const TEMPLATES: Array<{
  id: string;
  name: string;
  description: string;
  profiles: TripleProfile;
}> = [
  {
    id: "coaching-leader",
    name: "Coaching Leader",
    description: "High care, moderate challenge. Best for growing teams.",
    profiles: {
      natural: makeProfile({ care: 85, challenge: 68, authority: 35, posture: 20, decisionStyle: 74 }),
      working: makeProfile({ care: 82, challenge: 72, authority: 30, posture: 18, decisionStyle: 78 }),
      recommended: makeProfile({ care: 78, challenge: 74, authority: 28, posture: 22, decisionStyle: 72 }),
    },
  },
  {
    id: "crisis-manager",
    name: "Crisis Manager",
    description: "High authority, fast decisions. Best for urgent situations.",
    profiles: {
      natural: makeProfile({ authority: 78, challenge: 76, focus: 80, posture: 74, decisionStyle: 24, risk: 80 }),
      working: makeProfile({ authority: 82, challenge: 80, focus: 84, posture: 78, decisionStyle: 20, risk: 84 }),
      recommended: makeProfile({ authority: 85, challenge: 84, focus: 86, posture: 80, decisionStyle: 18, risk: 86 }),
    },
  },
  {
    id: "balanced",
    name: "Balanced",
    description: "Moderate across all dimensions. Adaptable to any situation.",
    profiles: {
      natural: makeProfile({}),
      working: makeProfile({ care: 70, challenge: 68, authority: 40, posture: 30 }),
      recommended: makeProfile({ care: 68, challenge: 70, authority: 42, posture: 32 }),
    },
  },
  {
    id: "strategic-enabler",
    name: "Strategic Enabler",
    description: "Focuses on systems, change, and organizational impact.",
    profiles: {
      natural: makeProfile({ change: 78, operatingMode: 72, risk: 68, visibility: 74, challenge: 64 }),
      working: makeProfile({ change: 82, operatingMode: 76, risk: 72, visibility: 78, challenge: 68 }),
      recommended: makeProfile({ change: 84, operatingMode: 78, risk: 74, visibility: 80, challenge: 70 }),
    },
  },
  {
    id: "growth-accelerator",
    name: "Growth Accelerator",
    description: "Pushes for rapid improvement with high standards and support.",
    profiles: {
      natural: makeProfile({ challenge: 82, care: 76, authority: 50, change: 68, visibility: 72 }),
      working: makeProfile({ challenge: 84, care: 74, authority: 48, change: 72, visibility: 76 }),
      recommended: makeProfile({ challenge: 86, care: 72, authority: 46, change: 74, visibility: 78 }),
    },
  },
  {
    id: "steady-steward",
    name: "Steady Steward",
    description: "Reliable, people-first, builds sustainable high-trust teams.",
    profiles: {
      natural: makeProfile({ care: 88, authority: 22, decisionStyle: 78, posture: 18, risk: 64, change: 32 }),
      working: makeProfile({ care: 86, authority: 24, decisionStyle: 76, posture: 20, risk: 66, change: 34 }),
      recommended: makeProfile({ care: 82, authority: 28, decisionStyle: 74, posture: 24, risk: 68, change: 36 }),
    },
  },
  {
    id: "innovation-catalyst",
    name: "Innovation Catalyst",
    description: "Drives experimentation and new possibilities with high risk tolerance.",
    profiles: {
      natural: makeProfile({ operatingMode: 84, change: 80, risk: 82, visibility: 78, authority: 30, decisionStyle: 76 }),
      working: makeProfile({ operatingMode: 86, change: 82, risk: 84, visibility: 80, authority: 28, decisionStyle: 78 }),
      recommended: makeProfile({ operatingMode: 82, change: 78, risk: 80, visibility: 76, authority: 32, decisionStyle: 74 }),
    },
  },
  {
    id: "transformation-director",
    name: "Transformation Director",
    description: "Bold change, clear direction, high accountability for major resets.",
    profiles: {
      natural: makeProfile({ change: 86, authority: 76, challenge: 84, posture: 74, focus: 80, operatingMode: 40 }),
      working: makeProfile({ change: 88, authority: 78, challenge: 86, posture: 76, focus: 82, operatingMode: 38 }),
      recommended: makeProfile({ change: 90, authority: 80, challenge: 88, posture: 78, focus: 84, operatingMode: 36 }),
    },
  },
];
