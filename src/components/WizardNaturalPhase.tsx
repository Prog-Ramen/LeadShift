"use client";

import { useState } from "react";
import { RadarChart } from "@/components/RadarChart";
import { ARCHETYPES } from "@/data/archetypes";
import { QUIZ_STEPS, NEUTRAL_PROFILE, applyDelta } from "@/data/quiz";
import { getArchetypeCode } from "@/lib/engine";
import type { ManagementProfile } from "@/lib/types";

interface WizardNaturalPhaseProps {
  initialProfile: ManagementProfile;
  onComplete: (profile: ManagementProfile) => void;
  darkMode: boolean;
}

export function WizardNaturalPhase({ initialProfile, onComplete, darkMode }: WizardNaturalPhaseProps) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<ManagementProfile>({ ...initialProfile });
  const [allAnswered, setAllAnswered] = useState(false);

  const archetypeCode = getArchetypeCode(profile);
  const archetype = ARCHETYPES.find((a) => a.code === archetypeCode) ?? ARCHETYPES[0];

  const handleChoice = (choiceIndex: number) => {
    const delta = QUIZ_STEPS[step].choices[choiceIndex].delta;
    const next = applyDelta(profile, delta);
    setProfile(next);
    if (step < 3) {
      setStep(step + 1);
    } else {
      setAllAnswered(true);
    }
  };

  return (
    <div className="wizard-natural-phase" data-theme={darkMode ? "dark" : "light"}>
      <div className="wizard-natural__radar">
        <RadarChart profile={profile} compact />
        {allAnswered && (
          <div className="wizard-natural__result">
            <span className="wizard-natural__code">{archetypeCode}</span>
            <span className="wizard-natural__name">{archetype.name}</span>
          </div>
        )}
      </div>

      <div className="wizard-natural__content">
        {!allAnswered ? (
          <>
            <div className="wizard-progress-bar">
              {QUIZ_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={[
                    "wizard-step",
                    i < step ? "complete" : "",
                    i === step ? "active" : "",
                  ].filter(Boolean).join(" ")}
                >
                  <span className="wizard-step__icon">{i < step ? "\u2713" : i + 1}</span>
                  <span className="wizard-step__label">Step {i + 1}</span>
                </div>
              ))}
            </div>

            <div className="wizard-natural__scenario">
              <span className="section-kicker">Scenario {step + 1} of {QUIZ_STEPS.length}</span>
              <h2 className="wizard-natural__question">{QUIZ_STEPS[step].scenario}</h2>
            </div>

            <div className="wizard-natural__choices">
              {QUIZ_STEPS[step].choices.map((choice, i) => (
                <button
                  key={i}
                  className="wizard-natural-choice"
                  onClick={() => handleChoice(i)}
                >
                  <span className="wizard-natural-choice__label">{choice.label}</span>
                  <span className="wizard-natural-choice__text">{choice.text}</span>
                </button>
              ))}
            </div>

            <p className="wizard-natural__hint">
              Your graph updates only after you submit each choice.
            </p>
          </>
        ) : (
          <div className="wizard-natural__locked">
            <h2 className="wizard-natural__locked-title">Your natural default</h2>
            <p className="wizard-natural__locked-desc">{archetype.name} ({archetypeCode})</p>
            <p className="wizard-natural__locked-body">
              This is your instinctive management style — how you tend to lead when you're not consciously adapting.
            </p>
            <button
              className="button button--primary button--wide"
              onClick={() => onComplete(profile)}
            >
              Lock & Continue \u2192
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
