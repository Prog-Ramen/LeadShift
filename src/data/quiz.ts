import type { ManagementProfile } from "@/lib/types";

export type ProfileDelta = Partial<Record<keyof ManagementProfile, number>>;

export const NEUTRAL_PROFILE: ManagementProfile = {
  focus: 50,
  authority: 50,
  care: 50,
  challenge: 50,
  visibility: 50,
  posture: 50,
  change: 50,
  risk: 50,
  operatingMode: 50,
  decisionStyle: 50,
};

export interface QuizChoice {
  label: string;
  text: string;
  delta: ProfileDelta;
}

export interface QuizStep {
  scenario: string;
  choices: QuizChoice[];
}

export const QUIZ_STEPS: QuizStep[] = [
  {
    scenario: "A team member is struggling to keep up. What's your first move?",
    choices: [
      {
        label: "A",
        text: "Have a direct conversation about the gap",
        delta: { authority: 22, challenge: 18, posture: 15, care: 5 },
      },
      {
        label: "B",
        text: "Check in frequently and offer support",
        delta: { care: 28, authority: -15, challenge: -8, decisionStyle: 10 },
      },
      {
        label: "C",
        text: "Give them space to find their footing",
        delta: { decisionStyle: 22, authority: -18, care: 8, challenge: -5 },
      },
    ],
  },
  {
    scenario: "A major opportunity appears. Your team's plate is full.",
    choices: [
      {
        label: "A",
        text: "We pivot — this matters more than the plan",
        delta: { change: 28, risk: 18, authority: 10 },
      },
      {
        label: "B",
        text: "We evaluate carefully before deciding",
        delta: { change: -22, risk: -18, focus: 15 },
      },
      {
        label: "C",
        text: "We explore it in parallel with current work",
        delta: { operatingMode: 22, change: 14, challenge: 14 },
      },
    ],
  },
  {
    scenario: "What does a good 1:1 look like for you?",
    choices: [
      {
        label: "A",
        text: "I set direction, give feedback, we align",
        delta: { posture: 22, authority: 14, challenge: 18 },
      },
      {
        label: "B",
        text: "I ask questions and mostly listen",
        delta: { decisionStyle: 22, care: 18, posture: -18 },
      },
      {
        label: "C",
        text: "We go deep on their development",
        delta: { care: 22, challenge: 12, visibility: 14 },
      },
    ],
  },
  {
    scenario: "Your team is performing well. Where's your energy?",
    choices: [
      {
        label: "A",
        text: "Push harder — comfort is dangerous",
        delta: { challenge: 28, change: 14, focus: 10 },
      },
      {
        label: "B",
        text: "Protect what's working — don't break it",
        delta: { change: -22, risk: -18, care: 14 },
      },
      {
        label: "C",
        text: "Plan the next chapter",
        delta: { operatingMode: 22, visibility: 18, change: 18 },
      },
    ],
  },
];

export function applyDelta(profile: ManagementProfile, delta: ProfileDelta): ManagementProfile {
  const next = { ...profile };
  for (const key of Object.keys(delta) as (keyof ManagementProfile)[]) {
    const d = delta[key];
    if (d !== undefined) {
      next[key] = Math.min(100, Math.max(0, next[key] + d));
    }
  }
  return next;
}
