"use client";

import { useState } from "react";
import { RadarChart } from "@/components/RadarChart";
import { ARCHETYPES } from "@/data/archetypes";
import { getArchetypeCode } from "@/lib/engine";
import type { ManagementProfile } from "@/lib/types";

// ── helpers ──────────────────────────────────────────────────────────────────

type ProfileDelta = Partial<Record<keyof ManagementProfile, number>>;

const NEUTRAL_PROFILE: ManagementProfile = {
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

function applyDelta(profile: ManagementProfile, delta: ProfileDelta): ManagementProfile {
  const next = { ...profile };
  for (const key of Object.keys(delta) as (keyof ManagementProfile)[]) {
    const d = delta[key];
    if (d !== undefined) {
      next[key] = Math.min(100, Math.max(0, next[key] + d));
    }
  }
  return next;
}

// ── Quiz data ─────────────────────────────────────────────────────────────────

interface QuizChoice {
  label: string;
  text: string;
  delta: ProfileDelta;
}

interface QuizStep {
  scenario: string;
  choices: QuizChoice[];
}

const QUIZ_STEPS: QuizStep[] = [
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

// ── OnboardingGate ────────────────────────────────────────────────────────────

interface OnboardingGateProps {
  onNew: () => void;
  onExperienced: () => void;
  darkMode: boolean;
}

export function OnboardingGate({ onNew, onExperienced, darkMode }: OnboardingGateProps) {
  return (
    <div className="onboarding-gate" data-theme={darkMode ? "dark" : "light"}>
      <div className="onboarding-gate__inner">
        <div className="onboarding-gate__brand">
          <div className="brand__mark" style={{ width: 52, height: 52, borderRadius: 15, fontSize: "0.9rem" }}>LS</div>
          <span className="onboarding-gate__wordmark">LeadShift</span>
        </div>
        <h1 className="onboarding-gate__headline">How do you want to start?</h1>
        <div className="gate-cards">
          <button className="gate-card" onClick={onNew}>
            <span className="gate-card__icon">✦</span>
            <strong className="gate-card__title">New to LeadShift</strong>
            <p className="gate-card__sub">Take a 2-minute guided tour — see how your style shows up in real situations</p>
          </button>
          <button className="gate-card" onClick={onExperienced}>
            <span className="gate-card__icon">→</span>
            <strong className="gate-card__title">I know my way around</strong>
            <p className="gate-card__sub">Jump straight to the tools</p>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tutorial ─────────────────────────────────────────────────────────────────

interface TutorialProps {
  onComplete: (profile: ManagementProfile) => void;
  darkMode: boolean;
}

export function Tutorial({ onComplete, darkMode }: TutorialProps) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<ManagementProfile>(NEUTRAL_PROFILE);
  const [previewProfile, setPreviewProfile] = useState<ManagementProfile | null>(null);
  const [lockedChoice, setLockedChoice] = useState<number | null>(null);

  const displayProfile = previewProfile ?? profile;
  const archetypeCode = getArchetypeCode(displayProfile);
  const archetype = ARCHETYPES.find((a) => a.code === archetypeCode) ?? ARCHETYPES[0];

  const handleChoiceClick = (choiceIndex: number, delta: ProfileDelta) => {
    const next = applyDelta(profile, delta);
    setProfile(next);
    setPreviewProfile(null);
    setLockedChoice(choiceIndex);
    setTimeout(() => {
      setStep((s) => s + 1);
      setLockedChoice(null);
    }, 500);
  };

  return (
    <div className="tutorial-shell" data-theme={darkMode ? "dark" : "light"}>
      {/* Left: Radar pane */}
      <div className="tutorial-radar-pane">
        <div className="tutorial-radar-inner">
          <RadarChart profile={displayProfile} compact />
          <div className="tutorial-archetype-badge">
            <div className="tutorial-code-letters">
              {[
                { letter: archetypeCode[0], a: "H", b: "R", labelA: "Human-first", labelB: "Results-first" },
                { letter: archetypeCode[1], a: "A", b: "D", labelA: "Autonomous", labelB: "Directive" },
                { letter: archetypeCode[2], a: "N", b: "C", labelA: "Nurturing", labelB: "Challenging" },
                { letter: archetypeCode[3], a: "S", b: "X", labelA: "Steady", labelB: "eXplorative" },
              ].map(({ letter, a, b, labelA, labelB }) => (
                <div key={a} className="tutorial-code-letter">
                  <span className="tutorial-code-char">{letter}</span>
                  <span className="tutorial-code-label">{letter === a ? labelA : labelB}</span>
                </div>
              ))}
            </div>
            {step === 4 && (
              <span className="tutorial-archetype-name">{archetype.name}</span>
            )}
          </div>
          {step === 4 && (
            <p className="tutorial-archetype-desc">{archetype.description}</p>
          )}
        </div>
      </div>

      {/* Right: Content pane */}
      <div className="tutorial-content-pane">
        {step < 4 && (
          <>
            <div className="tutorial-progress">
              {QUIZ_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={[
                    "tutorial-progress__dot",
                    i < step ? "tutorial-progress__dot--done" : "",
                    i === step ? "tutorial-progress__dot--current" : "",
                  ].filter(Boolean).join(" ")}
                />
              ))}
            </div>

            <div className="tutorial-step-quiz">
              <span className="section-kicker">Step {step + 1} of {QUIZ_STEPS.length}</span>
              <h2 className="tutorial-scenario">{QUIZ_STEPS[step].scenario}</h2>
              <div className="tutorial-choices">
                {QUIZ_STEPS[step].choices.map((choice, i) => (
                  <button
                    key={i}
                    className={[
                      "tutorial-choice",
                      lockedChoice === i ? "tutorial-choice--locked" : "",
                    ].filter(Boolean).join(" ")}
                    onMouseEnter={() => setPreviewProfile(applyDelta(profile, choice.delta))}
                    onMouseLeave={() => setPreviewProfile(null)}
                    onClick={() => handleChoiceClick(i, choice.delta)}
                    disabled={lockedChoice !== null}
                  >
                    <span className="tutorial-choice__label">{choice.label}</span>
                    <span className="tutorial-choice__text">{choice.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <div className="tutorial-step-reveal">
            <div className="tutorial-reveal-header">
              <span className="section-kicker">Your archetype</span>
              <h2 className="tutorial-reveal-code">{archetypeCode}</h2>
              <h3 className="tutorial-reveal-name">{archetype.name}</h3>
            </div>

            <div className="tutorial-reveal-columns">
              <div className="tutorial-reveal-col">
                <span className="tutorial-reveal-col__heading">Strengths</span>
                <ul className="tutorial-reveal-list">
                  {archetype.strengths.map((s) => (
                    <li key={s}><span className="tutorial-list-icon tutorial-list-icon--strength">✓</span>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="tutorial-reveal-col">
                <span className="tutorial-reveal-col__heading">Watch out for</span>
                <ul className="tutorial-reveal-list">
                  {archetype.watchouts.map((w) => (
                    <li key={w}><span className="tutorial-list-icon tutorial-list-icon--watchout">⚠</span>{w}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button className="button button--primary tutorial-enter-btn" onClick={() => onComplete(profile)}>
              Enter LeadShift →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
