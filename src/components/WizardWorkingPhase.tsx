"use client";

import { useState } from "react";
import { ProfileSliders } from "@/components/ProfileSliders";
import { RadarChart } from "@/components/RadarChart";
import { DIMENSIONS } from "@/data/dimensions";
import { clamp } from "@/lib/engine";
import type { DimensionKey, ManagementProfile } from "@/lib/types";

interface WizardWorkingPhaseProps {
  naturalProfile: ManagementProfile;
  initialWorking?: ManagementProfile;
  onComplete: (workingProfile: ManagementProfile) => void;
  darkMode: boolean;
}

export function WizardWorkingPhase({ naturalProfile, initialWorking, onComplete, darkMode }: WizardWorkingPhaseProps) {
  const [workingProfile, setWorkingProfile] = useState<ManagementProfile>(
    initialWorking ?? { focus: 50, authority: 50, care: 50, challenge: 50, visibility: 50, posture: 50, change: 50, risk: 50, operatingMode: 50, decisionStyle: 50 },
  );
  const [activeDimension, setActiveDimension] = useState<DimensionKey>("authority");

  return (
    <div className="wizard-working-phase" data-theme={darkMode ? "dark" : "light"}>
      <div className="wizard-working__row">
        {/* Left: Natural profile (locked) */}
        <div className="wizard-working__anchor">
          <RadarChart profile={naturalProfile} compact />
          <span className="wizard-working__label">Your Natural Default</span>
        </div>

        {/* Center: Sliders */}
        <div className="wizard-working__controls">
          <div className="wizard-working__controls-title">
            <span className="section-kicker">Adjust dimensions</span>
            <h3>Working Mode</h3>
          </div>
          <ProfileSliders
            profile={workingProfile}
            onChange={setWorkingProfile}
            activeDimension={activeDimension}
            onActiveDimensionChange={setActiveDimension}
          />
        </div>

        {/* Right: Working mode graph */}
        <div className="wizard-working__working">
          <RadarChart profile={workingProfile} compact comparison={naturalProfile} />
          <span className="wizard-working__label">Working Mode</span>
        </div>
      </div>

      {/* Lock button */}
      <div className="wizard-working__action">
        <button
          className="button button--primary button--wide"
          onClick={() => onComplete(workingProfile)}
        >
          Lock & Continue \u2192
        </button>
      </div>
    </div>
  );
}
