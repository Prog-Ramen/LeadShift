"use client";

import { useState } from "react";
import { RadarChart } from "@/components/RadarChart";
import { ARCHETYPES } from "@/data/archetypes";
import { QUIZ_STEPS, NEUTRAL_PROFILE, applyDelta } from "@/data/quiz";
import type { ManagementProfile } from "@/lib/types";

function pickNaturalChoice(
  currentProfile: ManagementProfile,
  archetype: any,
  choices: any[],
): number {
  let bestIdx = 0;
  let bestDist = Infinity;
  const centerDims = ["focus", "authority", "care", "challenge", "operatingMode", "change"] as const;
  for (let i = 0; i < choices.length; i++) {
    const next = applyDelta(currentProfile, choices[i].delta);
    let dist = 0;
    for (const dim of centerDims) {
      const centerVal = (archetype.center as any)[dim] ?? 50;
      const diff = next[dim] - centerVal;
      dist += diff * diff;
    }
    if (dist < bestDist) { bestDist = dist; bestIdx = i; }
  }
  return bestIdx;
}

export function ArchetypesPage({ darkMode }: { darkMode: boolean }) {
  const [selectedCode, setSelectedCode] = useState(ARCHETYPES[0].code);

  const selectedArchetype = ARCHETYPES.find((a) => a.code === selectedCode) ?? ARCHETYPES[0];

  // Compute simulator-style walkthrough for selected archetype
  const naturalChoices: number[] = [];
  let runningProfile: ManagementProfile = { ...NEUTRAL_PROFILE };
  for (const step of QUIZ_STEPS) {
    const best = pickNaturalChoice(runningProfile, selectedArchetype, step.choices);
    naturalChoices.push(best);
    runningProfile = applyDelta(runningProfile, step.choices[best].delta);
  }

  const archetypeProfile: ManagementProfile = {
    ...NEUTRAL_PROFILE,
    ...selectedArchetype.center,
  };

  return (
    <div className="archetypes-page-shell" data-theme={darkMode ? "dark" : "light"}>
      {/* Archetype grid */}
      <div className="archetypes-grid">
        {ARCHETYPES.map((archetype) => (
          <button
            key={archetype.code}
            className={["archetype-grid-card", selectedCode === archetype.code ? "selected" : ""].filter(Boolean).join(" ")}
            onClick={() => setSelectedCode(archetype.code)}
          >
            <span className="archetype-grid-code">{archetype.code}</span>
            <strong>{archetype.name}</strong>
            <p>{archetype.description}</p>
          </button>
        ))}
      </div>

      {/* Detail panel */}
      <div className="archetypes-detail">
        <div className="archetypes-detail__left">
          <div className="archetypes-detail__head">
            <span className="archetype-code-badge">{selectedArchetype.code}</span>
            <h2>{selectedArchetype.name}</h2>
          </div>
          <p>{selectedArchetype.description}</p>

          {/* Radar */}
          <RadarChart profile={archetypeProfile} />

          {/* Traits */}
          <div className="archetypes-traits">
            <div>
              <span className="archetypes-traits__label">Strengths</span>
              <ul>{selectedArchetype.strengths.map((s: string) => <li key={s}>{s}</li>)}</ul>
            </div>
            <div>
              <span className="archetypes-traits__label">Watch out for</span>
              <ul>{selectedArchetype.watchouts.map((w: string) => <li key={w}>{w}</li>)}</ul>
            </div>
          </div>
        </div>

        <div className="archetypes-detail__right">
          <h3 className="archetypes-detail__subheading">How {selectedArchetype.name} would answer</h3>
          {QUIZ_STEPS.map((step, si) => {
            const nat = naturalChoices[si];
            return (
              <div key={si} className="archetypes-sim-step">
                <span className="archetypes-sim-q">{step.scenario}</span>
                {step.choices.map((choice: any, ci: number) => {
                  const isNatural = ci === nat;
                  return (
                    <div
                      key={ci}
                      className={["archetypes-sim-choice", isNatural ? "natural" : ""].filter(Boolean).join(" ")}
                    >
                      <span className="archetypes-sim-choice__label">{choice.label}</span>
                      <span className="archetypes-sim-choice__text">{choice.text}</span>
                      {isNatural && (
                        <span className="archetypes-sim-natural-tag">{selectedArchetype.code}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
