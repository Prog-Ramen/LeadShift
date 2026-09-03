"use client";

import { useState } from "react";
import { RadarChart } from "@/components/RadarChart";
import { ARCHETYPES } from "@/data/archetypes";
import { QUIZ_STEPS, NEUTRAL_PROFILE, applyDelta, type ProfileDelta } from "@/data/quiz";
import { getArchetypeCode } from "@/lib/engine";
import type { ManagementProfile } from "@/lib/types";

// ── OnboardingGate ────────────────────────────────────────────────────────────

interface OnboardingGateProps {
  onNew: () => void;
  onExperienced: (code: string) => void;
  onWizard: () => void;
  onExplore?: () => void;
  showCodeInput?: boolean;
  codeValue?: string;
  onCodeChange?: (code: string) => void;
  codeError?: string;
  showTemplateSelection?: boolean;
  templates?: Array<{ id: string; name: string; description: string }>;
  onTemplateSelect?: (id: string) => void;
  darkMode: boolean;
}

export function OnboardingGate({
  onNew,
  onExperienced,
  onWizard,
  onExplore,
  showCodeInput,
  codeValue,
  onCodeChange,
  codeError,
  showTemplateSelection,
  templates,
  onTemplateSelect,
  darkMode,
}: OnboardingGateProps) {
  if (showTemplateSelection && templates) {
    return (
      <div className="onboarding-gate" data-theme={darkMode ? "dark" : "light"}>
        <div className="onboarding-gate__inner">
          <div className="onboarding-gate__brand">
            <div className="brand__mark" style={{ width: 52, height: 52, borderRadius: 15, fontSize: "0.9rem" }}>LS</div>
            <span className="onboarding-gate__wordmark">LeadShift</span>
          </div>
          <h1 className="onboarding-gate__headline">Choose a starting point</h1>
          <p className="onboarding-gate__subheadline">Each template gives you a complete set of three profiles to explore.</p>
          <div className="gate-cards gate-cards--templates">
            {templates.map((t) => (
              <button
                key={t.id}
                className="gate-card gate-card--template"
                onClick={() => onTemplateSelect?.(t.id)}
              >
                <strong className="gate-card__title">{t.name}</strong>
                <p className="gate-card__sub">{t.description}</p>
              </button>
            ))}
          </div>
          <button className="gate-back-link" onClick={onWizard}>
            ← Take the guided wizard instead
          </button>
        </div>
      </div>
    );
  }

  if (showCodeInput) {
    return (
      <div className="onboarding-gate" data-theme={darkMode ? "dark" : "light"}>
        <div className="onboarding-gate__inner">
          <div className="onboarding-gate__brand">
            <div className="brand__mark" style={{ width: 52, height: 52, borderRadius: 15, fontSize: "0.9rem" }}>LS</div>
            <span className="onboarding-gate__wordmark">LeadShift</span>
          </div>
          <h1 className="onboarding-gate__headline">Load your profiles</h1>
          <p className="onboarding-gate__subheadline">Paste your share code to restore your Natural, Working, and Recommended profiles.</p>
          <div className="gate-code-input-shell">
            <input
              type="text"
              className="gate-code-input"
              placeholder="Paste code here…"
              value={codeValue ?? ""}
              onChange={(e) => onCodeChange?.(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onExperienced(codeValue ?? ""); }}
              autoFocus
            />
            {codeError && <span className="gate-code-error">{codeError}</span>}
            <div className="gate-code-actions">
              <button className="button button--primary" onClick={() => onExperienced(codeValue ?? "")}>Load</button>
              <button className="button button--ghost" onClick={onWizard}>Take guided wizard</button>
              <button className="button button--ghost" onClick={() => onExperienced("")}>Show templates</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-gate" data-theme={darkMode ? "dark" : "light"}>
      <div className="onboarding-gate__inner">
        <div className="onboarding-gate__brand">
          <div className="brand__mark" style={{ width: 52, height: 52, borderRadius: 15, fontSize: "0.9rem" }}>LS</div>
          <div className="onboarding-gate__wordmark-col">
            <span className="onboarding-gate__wordmark">LeadShift</span>
            <span className="onboarding-gate__subtitle">Find your leadership style. Practice adapting it. See what changes.</span>
          </div>
        </div>
        <h1 className="onboarding-gate__headline">What brings you to LeadShift?</h1>
        <p className="onboarding-gate__tagline">Discover your natural style, practice adapting, or load profiles you already have.</p>
        <div className="gate-cards gate-cards--three">
          <button className="gate-card" onClick={onNew}>
            <span className="gate-card__icon">✦</span>
            <strong className="gate-card__title">Guided wizard</strong>
            <p className="gate-card__sub">Build all three profiles step by step with a short assessment</p>
          </button>
          <button className="gate-card" onClick={() => onExperienced("")}>
            <span className="gate-card__icon">{">"}</span>
            <strong className="gate-card__title">Load profiles</strong>
            <p className="gate-card__sub">Paste a share code, pick a template, or jump in</p>
          </button>
          <button className="gate-card gate-card--explore" onClick={onWizard}>
            <span className="gate-card__icon">◉</span>
            <strong className="gate-card__title">Just explore</strong>
            <p className="gate-card__sub">Dive into the simulator and archetype explorer — no assessment needed</p>
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
