"use client";

import { useState, useCallback } from "react";
import { WizardNaturalPhase } from "@/components/WizardNaturalPhase";
import { WizardWorkingPhase } from "@/components/WizardWorkingPhase";
import { WizardContextPhase } from "@/components/WizardContextPhase";
import { NEUTRAL_PROFILE } from "@/data/quiz";
import type { ManagementProfile } from "@/lib/types";
import type { TripleProfile } from "@/lib/url-compression";

type WizardPhase = "natural" | "working" | "context" | "complete";

interface WizardFlowProps {
  onComplete: (triples: TripleProfile) => void;
  darkMode: boolean;
}

const PHASES: WizardPhase[] = ["natural", "working", "context", "complete"];
const PHASE_LABELS = ["Natural Style", "Working Mode", "Context", "Complete"];

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
    setPhase("complete");
  }, []);

  if (phase === "complete") {
    onComplete({
      natural: naturalProfile,
      working: workingProfile,
      recommended: recommendedProfile,
    });
    return null;
  }

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
    </div>
  );
}
