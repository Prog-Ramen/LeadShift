"use client";

import { useMemo, useState } from "react";
import { ProfileSliders } from "@/components/ProfileSliders";
import { RadarChart } from "@/components/RadarChart";
import { ARCHETYPES } from "@/data/archetypes";
import { DIMENSIONS } from "@/data/dimensions";
import { clamp, getArchetypeCode } from "@/lib/engine";
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

  const workingCode = getArchetypeCode(workingProfile);
  const workingArch = ARCHETYPES.find((a) => a.code === workingCode) ?? ARCHETYPES[0];

  const deltas = useMemo(() => {
    return DIMENSIONS.map((d) => ({
      key: d.key,
      name: d.name,
      value: workingProfile[d.key],
      delta: workingProfile[d.key] - naturalProfile[d.key],
    }));
  }, [workingProfile, naturalProfile]);

  return (
    <div className="wizard-working-phase" data-theme={darkMode ? "dark" : "light"}>
      <div className="wizard-working__row">
        {/* Left: Natural profile (locked) */}
        <div className="wizard-working__anchor">
          <RadarChart profile={naturalProfile} compact />
          <span className="wizard-working__label">Your Natural Default</span>
          <span className="wizard-working__anchor-code">{naturalProfile === initialWorking ? getArchetypeCode(naturalProfile) : "—"}</span>
        </div>

        {/* Center: Sliders */}
        <div className="wizard-working__controls">
          <div className="wizard-working__controls-title">
            <span className="section-kicker">Adjust dimensions</span>
            <h3>How you actually work</h3>
            <p className="wizard-working__controls-sub">Now adjust for how you work on a typical day — not your instinctive default.</p>
          </div>
          <ProfileSliders
            profile={workingProfile}
            onChange={setWorkingProfile}
            activeDimension={activeDimension}
            onActiveDimensionChange={setActiveDimension}
          />
        </div>

        {/* Right: Working mode radar with live code */}
        <div className="wizard-working__working">
          <RadarChart profile={workingProfile} compact comparison={naturalProfile} />
          <span className="wizard-working__label">Working Mode</span>
          <div className="wizard-working__live-badge">
            <span className="wizard-working__code-badge">{workingCode}</span>
            <span className="wizard-working__code-name">{workingArch.name}</span>
          </div>
        </div>
      </div>

      {/* Delta indicators */}
      <div className="wizard-working__deltas">
        {deltas.map((d) => (
          <div key={d.key} className={`wizard-delta${d.delta > 0 ? " wizard-delta--up" : d.delta < 0 ? " wizard-delta--down" : ""}`}>
            <span className="wizard-delta__dim">{d.name}</span>
            <span className="wizard-delta__value">{d.delta > 0 ? "+" : ""}{d.delta}</span>
          </div>
        ))}
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
