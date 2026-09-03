"use client";

import { useState, useCallback } from "react";
import { WizardNaturalPhase } from "@/components/WizardNaturalPhase";
import { WizardWorkingPhase } from "@/components/WizardWorkingPhase";
import { WizardContextPhase } from "@/components/WizardContextPhase";
import { ARCHETYPES } from "@/data/archetypes";
import { NEUTRAL_PROFILE } from "@/data/quiz";
import { getArchetypeCode } from "@/lib/engine";
import type { ManagementProfile } from "@/lib/types";
import type { TripleProfile } from "@/lib/url-compression";

type WizardPhase = "natural" | "working" | "context" | "results";

interface WizardFlowProps {
  onComplete: (triples: TripleProfile) => void;
  darkMode: boolean;
}

const PHASES: WizardPhase[] = ["natural", "working", "context", "results"];
const PHASE_LABELS = ["Natural Style", "Working Mode", "Context", "Results"];

function ProgressIndicator({ phase }: { phase: WizardPhase }) {
  const currentIdx = PHASES.indexOf(phase);
  return (
    <div className="wizard-progress-bar">
      {PHASES.map((p, i) => {
        const isComplete = i < currentIdx;
        const isActive = i === currentIdx;
        return (
          <div
            key={p}
            className={[
              "wizard-step",
              isActive ? "active" : "",
              isComplete ? "complete" : "",
            ].filter(Boolean).join(" ")}
          >
            <span className="wizard-step__icon">{isComplete ? "\u2713" : i + 1}</span>
            <span className="wizard-step__label">{PHASE_LABELS[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

export function WizardFlow({ onComplete, darkMode }: WizardFlowProps) {
  const [phase, setPhase] = useState<WizardPhase>("natural");
  const [naturalProfile, setNaturalProfile] = useState<ManagementProfile>({ ...NEUTRAL_PROFILE });
  const [workingProfile, setWorkingProfile] = useState<ManagementProfile>({ ...NEUTRAL_PROFILE });
  const [recommendedProfile, setRecommendedProfile] = useState<ManagementProfile>({ ...NEUTRAL_PROFILE });

  const handleNaturalComplete = useCallback((profile: ManagementProfile) => {
    setNaturalProfile(profile);
    setPhase("working");
  }, []);

  const handleWorkingComplete = useCallback((profile: ManagementProfile) => {
    setWorkingProfile(profile);
    setPhase("context");
  }, []);

  const handleContextComplete = useCallback((profile: ManagementProfile) => {
    setRecommendedProfile(profile);
    setPhase("results");
  }, []);

  const handleResultsEnter = useCallback(() => {
    onComplete({
      natural: naturalProfile,
      working: workingProfile,
      recommended: recommendedProfile,
    });
  }, [naturalProfile, workingProfile, recommendedProfile, onComplete]);

  const naturalCode = getArchetypeCode(naturalProfile);
  const workingCode = getArchetypeCode(workingProfile);
  const recommendedCode = getArchetypeCode(recommendedProfile);
  const naturalArch = ARCHETYPES.find((a) => a.code === naturalCode) ?? ARCHETYPES[0];
  const workingArch = ARCHETYPES.find((a) => a.code === workingCode) ?? ARCHETYPES[0];
  const recommendedArch = ARCHETYPES.find((a) => a.code === recommendedCode) ?? ARCHETYPES[0];

  return (
    <div className="wizard-shell" data-theme={darkMode ? "dark" : "light"}>
      <ProgressIndicator phase={phase} />

      {phase === "natural" && (
        <WizardNaturalPhase
          initialProfile={{ ...naturalProfile }}
          onComplete={handleNaturalComplete}
          darkMode={darkMode}
        />
      )}
      {phase === "working" && (
        <WizardWorkingPhase
          naturalProfile={naturalProfile}
          initialWorking={workingProfile}
          onComplete={handleWorkingComplete}
          darkMode={darkMode}
        />
      )}
      {phase === "context" && (
        <WizardContextPhase
          naturalProfile={naturalProfile}
          workingProfile={workingProfile}
          onComplete={handleContextComplete}
          darkMode={darkMode}
        />
      )}
      {phase === "results" && (
        <div className="wizard-results">
          <div className="wizard-results__inner fade-in">
            <span className="section-kicker">Your three profiles</span>
            <h2 className="wizard-results__title">You've discovered three views of your leadership</h2>
            <p className="wizard-results__subtitle">
              This is your instinctive style — how you lead when you're not consciously adapting.
            </p>

            <div className="wizard-results__cards">
              <div className="wizard-result-card wizard-result-card--natural">
                <span className="wizard-result-card__label">Instinctive Style</span>
                <span className="wizard-result-card__code">{naturalCode}</span>
                <strong className="wizard-result-card__name">{naturalArch.name}</strong>
                <p className="wizard-result-card__desc">{naturalArch.description}</p>
              </div>
              <div className="wizard-result-card wizard-result-card--working">
                <span className="wizard-result-card__label">Working Mode</span>
                <span className="wizard-result-card__code">{workingCode}</span>
                <strong className="wizard-result-card__name">{workingArch.name}</strong>
                <p className="wizard-result-card__desc">{workingArch.description}</p>
              </div>
              <div className="wizard-result-card wizard-result-card--recommended">
                <span className="wizard-result-card__label">Recommended Style</span>
                <span className="wizard-result-card__code">{recommendedCode}</span>
                <strong className="wizard-result-card__name">{recommendedArch.name}</strong>
                <p className="wizard-result-card__desc">{recommendedArch.description}</p>
              </div>
            </div>

            <button className="button button--primary button--wide wizard-results__enter" onClick={handleResultsEnter}>
              Explore your profiles →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
