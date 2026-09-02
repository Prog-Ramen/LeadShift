"use client";

import { useState } from "react";
import { RadarChart } from "@/components/RadarChart";
import { ARCHETYPES } from "@/data/archetypes";
import { QUIZ_STEPS, NEUTRAL_PROFILE, applyDelta, type QuizChoice } from "@/data/quiz";
import type { Archetype, ManagementProfile } from "@/lib/types";

// ── Algorithm: pick which choice best aligns with archetype center ────────────

type CenterDim = "focus" | "authority" | "care" | "challenge" | "operatingMode" | "change";
const CENTER_DIMS: CenterDim[] = [
  "focus", "authority", "care", "challenge", "operatingMode", "change",
];

function pickNaturalChoice(
  currentProfile: ManagementProfile,
  archetype: Archetype,
  choices: QuizChoice[],
): number {
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < choices.length; i++) {
    const next = applyDelta(currentProfile, choices[i].delta);
    let dist = 0;
    for (const dim of CENTER_DIMS) {
      const centerVal = archetype.center[dim] ?? 50;
      const diff = next[dim] - centerVal;
      dist += diff * diff;
    }
    if (dist < bestDist) { bestDist = dist; bestIdx = i; }
  }
  return bestIdx;
}

// ── Build archetype's full profile from its center ────────────────────────────

function archetypeFullProfile(archetype: Archetype): ManagementProfile {
  return {
    ...NEUTRAL_PROFILE,
    ...archetype.center,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ArchetypeSimulator() {
  const [selectedCode, setSelectedCode] = useState<string>(ARCHETYPES[0].code);

  const archetype = ARCHETYPES.find((a) => a.code === selectedCode) ?? ARCHETYPES[0];
  const archetypeProfile = archetypeFullProfile(archetype);

  // Compute natural choices step by step (greedy from neutral)
  const naturalChoices: number[] = [];
  let runningProfile = { ...NEUTRAL_PROFILE };
  for (const step of QUIZ_STEPS) {
    const best = pickNaturalChoice(runningProfile, archetype, step.choices);
    naturalChoices.push(best);
    runningProfile = applyDelta(runningProfile, step.choices[best].delta);
  }

  return (
    <article className="archetype-sim">
      <div className="archetype-sim__head">
        <div>
          <span className="section-kicker">Simulate archetype</span>
          <h2>How would another archetype lead?</h2>
          <p className="archetype-sim__sub">Pick any management archetype to see which choices they would naturally make across four leadership scenarios.</p>
        </div>
      </div>

      <div className="archetype-sim__layout">
        {/* Left: Archetype picker + profile card */}
        <div className="archetype-sim__left">
          <div className="archetype-sim__picker">
            {ARCHETYPES.map((a) => (
              <button
                key={a.code}
                className={["archetype-pill", selectedCode === a.code ? "archetype-pill--active" : ""].filter(Boolean).join(" ")}
                onClick={() => setSelectedCode(a.code)}
              >
                <span className="archetype-pill__code">{a.code}</span>
                <span className="archetype-pill__name">{a.name}</span>
              </button>
            ))}
          </div>

          <div className="archetype-sim__card">
            <div className="archetype-sim__card-head">
              <span className="archetype-code-badge">{archetype.code}</span>
              <strong>{archetype.name}</strong>
            </div>
            <p className="archetype-sim__desc">{archetype.description}</p>
            <RadarChart profile={archetypeProfile} compact />
            <div className="archetype-sim__traits">
              <div>
                <span className="archetype-sim__trait-label">Strengths</span>
                <ul>{archetype.strengths.map((s) => <li key={s}>{s}</li>)}</ul>
              </div>
              <div>
                <span className="archetype-sim__trait-label">Watch out for</span>
                <ul>{archetype.watchouts.map((w) => <li key={w}>{w}</li>)}</ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Scenario walk-through */}
        <div className="archetype-sim__scenarios">
          {QUIZ_STEPS.map((step, stepIndex) => {
            const nat = naturalChoices[stepIndex];
            return (
              <div key={stepIndex} className="archetype-sim__step">
                <div className="archetype-sim__step-q">
                  <span className="archetype-sim__step-num">Q{stepIndex + 1}</span>
                  <span>{step.scenario}</span>
                </div>
                <div className="archetype-sim__choices">
                  {step.choices.map((choice, choiceIndex) => {
                    const isNatural = choiceIndex === nat;
                    return (
                      <div
                        key={choiceIndex}
                        className={["archetype-sim__choice", isNatural ? "archetype-sim__choice--natural" : ""].filter(Boolean).join(" ")}
                      >
                        <span className="archetype-sim__choice-label">{choice.label}</span>
                        <span className="archetype-sim__choice-text">{choice.text}</span>
                        {isNatural && (
                          <span className="archetype-sim__natural-tag">{archetype.code}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}
