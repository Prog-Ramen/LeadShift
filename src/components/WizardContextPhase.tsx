"use client";

import { useMemo, useState } from "react";
import { RadarChart } from "@/components/RadarChart";
import { ARCHETYPES } from "@/data/archetypes";
import { DEFAULT_CONTEXT, CONTEXT_DEFINITIONS } from "@/data/context";
import { getContextRecommendedProfile, getArchetypeCode } from "@/lib/engine";
import type { SituationContext } from "@/lib/types";

interface WizardContextPhaseProps {
  naturalProfile: any;
  workingProfile: any;
  onComplete: (recommendedProfile: any) => void;
  darkMode: boolean;
}

export function WizardContextPhase({ naturalProfile, workingProfile, onComplete, darkMode }: WizardContextPhaseProps) {
  const [context, setContext] = useState<SituationContext>({ ...DEFAULT_CONTEXT });

  const recommendedProfile = useMemo(
    () => getContextRecommendedProfile(context, undefined),
    [context],
  );

  const recommendedCode = getArchetypeCode(recommendedProfile);
  const recommendedArch = ARCHETYPES.find((a) => a.code === recommendedCode) ?? ARCHETYPES[0];

  return (
    <div className="wizard-context-phase" data-theme={darkMode ? "dark" : "light"}>
      <div className="wizard-context__row">
        {/* Left: Natural */}
        <div className="wizard-context__anchor">
          <RadarChart profile={naturalProfile} compact />
          <span className="wizard-context__label">Natural</span>
        </div>

        {/* Center: Context sliders */}
        <div className="wizard-context__controls">
          <div className="wizard-context__controls-title">
            <span className="section-kicker">What's the situation?</span>
            <h3>Context</h3>
            <p className="wizard-context__controls-sub">Context matters. Adjust these sliders to reflect your current team and situation.</p>
          </div>
          {CONTEXT_DEFINITIONS.map((definition) => {
            const value = context[definition.key];
            return (
              <div className="wizard-context-slider" key={definition.key}>
                <div className="wizard-context-slider__header">
                  <label htmlFor={`wizard-context-${definition.key}`}>{definition.name}</label>
                  <span>{value}</span>
                </div>
                <input
                  id={`wizard-context-${definition.key}`}
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  style={{ "--slider-value": `${value}%` } as React.CSSProperties}
                  onChange={(event) =>
                    setContext((current) => ({ ...current, [definition.key]: Number(event.target.value) }))
                  }
                />
                <div className="range-labels">
                  <span>{definition.lowLabel}</span>
                  <span>{definition.highLabel}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Recommended with live code */}
        <div className="wizard-context__recommended">
          <RadarChart profile={recommendedProfile} compact comparison={workingProfile} />
          <span className="wizard-context__label">Recommended</span>
          <div className="wizard-context__live-badge">
            <span className="wizard-context__code-badge">{recommendedCode}</span>
            <span className="wizard-context__code-name">{recommendedArch.name}</span>
          </div>
        </div>
      </div>

      {/* Lock button */}
      <div className="wizard-context__action">
        <button
          className="button button--primary button--wide"
          onClick={() => onComplete(recommendedProfile)}
        >
          Lock & Continue \u2192
        </button>
      </div>
    </div>
  );
}
