"use client";

import { useEffect, useMemo, useState } from "react";
import { ARCHETYPES } from "@/data/archetypes";
import {
  DEFAULT_PROFILE,
  DIMENSIONS,
  PRESET_PROFILES,
} from "@/data/dimensions";
import {
  SITUATIONS,
  SITUATION_CATEGORIES,
} from "@/data/situations";
import {
  clamp,
  describeBand,
  getAdjustmentRecommendations,
  getArchetypeMatches,
  getMarginalImpacts,
  getProfileWarnings,
  rankSituations,
  scoreSituation,
} from "@/lib/engine";
import type {
  DimensionKey,
  ManagementProfile,
  SavedMode,
  SituationCategory,
} from "@/lib/types";
import { DIMENSION_KEYS } from "@/lib/types";
import { RadarChart } from "@/components/RadarChart";

const STORAGE_KEY = "manager-flex:saved-modes:v1";
const PROFILE_QUERY_KEY = "style";

const Icon = ({ name }: { name: "reset" | "share" | "save" | "trash" | "spark" | "arrow" }) => {
  const paths = {
    reset: <><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 3v6h6"/></>,
    share: <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/></>,
    save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8M7 3v5h8"/></>,
    trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6"/></>,
    spark: <><path d="m12 3-1.4 3.6L7 8l3.6 1.4L12 13l1.4-3.6L17 8l-3.6-1.4L12 3Z"/><path d="m5 14-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8L5 14ZM19 13l-.8 2.2L16 16l2.2.8L19 19l.8-2.2L22 16l-2.2-.8L19 13Z"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
  };

  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

const encodeProfile = (profile: ManagementProfile) =>
  DIMENSION_KEYS.map((key) => Math.round(profile[key])).join(".");

const decodeProfile = (encoded: string | null): ManagementProfile | null => {
  if (!encoded) return null;
  const values = encoded.split(".").map(Number);
  if (values.length !== DIMENSION_KEYS.length || values.some((value) => !Number.isFinite(value))) {
    return null;
  }

  return DIMENSION_KEYS.reduce((result, key, index) => {
    result[key] = clamp(values[index]);
    return result;
  }, {} as ManagementProfile);
};

const fitLabel = (score: number) => {
  if (score >= 86) return "Excellent fit";
  if (score >= 72) return "Strong fit";
  if (score >= 58) return "Workable fit";
  if (score >= 44) return "Needs adaptation";
  return "High-friction fit";
};

const impactText = (impact: number) => {
  if (impact > 0) return `+${impact}`;
  return `${impact}`;
};

export default function ManagementLab() {
  const [profile, setProfile] = useState<ManagementProfile>(DEFAULT_PROFILE);
  const [activeDimension, setActiveDimension] = useState<DimensionKey>("authority");
  const [selectedSituationId, setSelectedSituationId] = useState("senior-team");
  const [category, setCategory] = useState<"All" | SituationCategory>("All");
  const [savedModes, setSavedModes] = useState<SavedMode[]>([]);
  const [modeName, setModeName] = useState("");
  const [shareStatus, setShareStatus] = useState("Share profile");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedProfile = decodeProfile(params.get(PROFILE_QUERY_KEY));
    let storedModes: SavedMode[] = [];

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) storedModes = JSON.parse(stored) as SavedMode[];
    } catch {
      // A private browsing policy may block storage. The app still works without it.
    }

    queueMicrotask(() => {
      if (sharedProfile) setProfile(sharedProfile);
      setSavedModes(storedModes);
      setHydrated(true);
    });
  }, []);

  const archetypeMatches = useMemo(() => getArchetypeMatches(profile), [profile]);
  const primaryMatch = archetypeMatches[0];
  const secondaryMatch = archetypeMatches[1];
  const selectedSituation =
    SITUATIONS.find((item) => item.id === selectedSituationId) ?? SITUATIONS[0];
  const selectedScore = useMemo(
    () => scoreSituation(profile, selectedSituation),
    [profile, selectedSituation],
  );
  const recommendations = useMemo(
    () => getAdjustmentRecommendations(profile, selectedSituation, 4),
    [profile, selectedSituation],
  );
  const marginalImpacts = useMemo(
    () => getMarginalImpacts(profile, selectedSituation),
    [profile, selectedSituation],
  );
  const activeImpact = marginalImpacts.find((impact) => impact.key === activeDimension) ?? marginalImpacts[0];
  const rankedSituations = useMemo(() => rankSituations(profile, SITUATIONS), [profile]);
  const warnings = useMemo(() => getProfileWarnings(profile), [profile]);
  const activeDefinition = DIMENSIONS.find((item) => item.key === activeDimension) ?? DIMENSIONS[0];
  const filteredSituations = category === "All"
    ? SITUATIONS
    : SITUATIONS.filter((item) => item.category === category);

  const updateProfile = (key: DimensionKey, value: number) => {
    setProfile((current) => ({ ...current, [key]: clamp(value) }));
    setActiveDimension(key);
  };

  const applyStep = (key: DimensionKey, delta: number) => {
    updateProfile(key, profile[key] + delta);
  };

  const selectCategory = (nextCategory: "All" | SituationCategory) => {
    setCategory(nextCategory);
    const first = nextCategory === "All"
      ? SITUATIONS[0]
      : SITUATIONS.find((item) => item.category === nextCategory);
    if (first) setSelectedSituationId(first.id);
  };

  const shareProfile = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set(PROFILE_QUERY_KEY, encodeProfile(profile));
    try {
      await navigator.clipboard.writeText(url.toString());
      setShareStatus("Link copied");
    } catch {
      window.history.replaceState({}, "", url);
      setShareStatus("Link added to URL");
    }
    window.setTimeout(() => setShareStatus("Share profile"), 1800);
  };

  const saveMode = () => {
    const trimmedName = modeName.trim();
    if (!trimmedName) return;

    const mode: SavedMode = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`,
      name: trimmedName,
      profile: { ...profile },
      createdAt: new Date().toISOString(),
    };
    const nextModes = [mode, ...savedModes].slice(0, 12);
    setSavedModes(nextModes);
    setModeName("");
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextModes));
    } catch {
      // Storage is optional.
    }
  };

  const deleteMode = (id: string) => {
    const nextModes = savedModes.filter((mode) => mode.id !== id);
    setSavedModes(nextModes);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextModes));
    } catch {
      // Storage is optional.
    }
  };

  const codeMeanings = [
    { letter: primaryMatch.archetype.code[0], label: profile.focus < 50 ? "Human-centred" : "Results-centred" },
    { letter: primaryMatch.archetype.code[1], label: profile.authority < 50 ? "Autonomy" : "Direction" },
    { letter: primaryMatch.archetype.code[2], label: profile.operatingMode < 50 ? "Stability" : "Exploration" },
    { letter: primaryMatch.archetype.code[3], label: profile.change < 50 ? "Incremental" : "Transformational" },
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <a href="#top" className="brand" aria-label="Manager Flex home">
          <span className="brand__mark">MF</span>
          <span>
            <strong>LeadShift</strong>
            <small>Situational leadership laboratory</small>
          </span>
        </a>
        <div className="topbar__actions">
          <button className="button button--ghost" onClick={() => setProfile(DEFAULT_PROFILE)}>
            <Icon name="reset" /> Reset
          </button>
          <button className="button button--primary" onClick={shareProfile}>
            <Icon name="share" /> {shareStatus}
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div>
            <span className="eyebrow"><Icon name="spark" /> Management as a set of movable dials</span>
            <h1>Explore how your style changes with the situation.</h1>
            <p>
              Adjust ten independent leadership dimensions. See the archetype they form,
              where that configuration helps, and which single change creates the greatest situational benefit.
            </p>
          </div>
          <div className="hero__principle">
            <span>Current principle</span>
            <strong>Known default + deliberate flexibility</strong>
            <p>No configuration is universally ideal. The goal is to understand when and why to move.</p>
          </div>
        </section>

        <section className="workspace">
          <aside className="panel controls-panel">
            <div className="panel__heading">
              <div>
                <span className="section-kicker">Style laboratory</span>
                <h2>Management dials</h2>
              </div>
              <span className="count-badge">10 dimensions</span>
            </div>

            <div className="preset-row" aria-label="Management style presets">
              {PRESET_PROFILES.map((preset) => (
                <button
                  key={preset.name}
                  className="preset-chip"
                  title={preset.description}
                  onClick={() => setProfile({ ...preset.profile })}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            <div className="slider-list">
              {DIMENSIONS.map((dimension) => {
                const value = profile[dimension.key];
                const isActive = dimension.key === activeDimension;
                return (
                  <div
                    className={`slider-card ${isActive ? "slider-card--active" : ""}`}
                    key={dimension.key}
                    onClick={() => setActiveDimension(dimension.key)}
                  >
                    <div className="slider-card__header">
                      <label htmlFor={`slider-${dimension.key}`}>{dimension.name}</label>
                      <span>{value}</span>
                    </div>
                    <input
                      id={`slider-${dimension.key}`}
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={value}
                      style={{ "--slider-value": `${value}%` } as React.CSSProperties}
                      onChange={(event) => updateProfile(dimension.key, Number(event.target.value))}
                      aria-valuetext={`${value}; ${dimension.lowLabel} to ${dimension.highLabel}`}
                    />
                    <div className="slider-card__labels">
                      <span>{dimension.lowLabel}</span>
                      <strong>{describeBand(value)}</strong>
                      <span>{dimension.highLabel}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          <section className="panel identity-panel">
            <div className="panel__heading">
              <div>
                <span className="section-kicker">Current configuration</span>
                <h2>Your archetype</h2>
              </div>
              <span className="confidence-badge">{primaryMatch.confidence}% match</span>
            </div>

            <div className="archetype-hero">
              <div className="archetype-code" aria-label={`Archetype code ${primaryMatch.archetype.code}`}>
                {codeMeanings.map((meaning) => (
                  <div key={`${meaning.letter}-${meaning.label}`}>
                    <strong>{meaning.letter}</strong>
                    <span>{meaning.label}</span>
                  </div>
                ))}
              </div>
              <h3>{primaryMatch.archetype.name}</h3>
              <p>{primaryMatch.archetype.description}</p>
              <div className="secondary-match">
                Secondary match: <strong>{secondaryMatch.archetype.name}</strong>
                <span>{secondaryMatch.confidence}%</span>
              </div>
            </div>

            <RadarChart profile={profile} />

            <div className="traits-grid">
              <div>
                <span className="mini-heading">Likely strengths</span>
                <ul className="trait-list trait-list--positive">
                  {primaryMatch.archetype.strengths.map((strength) => <li key={strength}>{strength}</li>)}
                </ul>
              </div>
              <div>
                <span className="mini-heading">Watch closely</span>
                <ul className="trait-list">
                  {primaryMatch.archetype.watchouts.map((watchout) => <li key={watchout}>{watchout}</li>)}
                </ul>
              </div>
            </div>

            <div className="warning-stack">
              {warnings.map((warning) => (
                <article className={`warning-card warning-card--${warning.severity}`} key={warning.id}>
                  <span>{warning.severity === "watch" ? "Watch" : "Note"}</span>
                  <div>
                    <strong>{warning.title}</strong>
                    <p>{warning.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="panel situation-panel">
            <div className="panel__heading">
              <div>
                <span className="section-kicker">Situation explorer</span>
                <h2>Test this configuration</h2>
              </div>
              <span className={`fit-badge fit-badge--${selectedScore.score >= 72 ? "good" : selectedScore.score >= 52 ? "mid" : "low"}`}>
                {fitLabel(selectedScore.score)}
              </span>
            </div>

            <div className="field-grid">
              <label>
                <span>Category</span>
                <select value={category} onChange={(event) => selectCategory(event.target.value as "All" | SituationCategory)}>
                  <option value="All">All situations</option>
                  {SITUATION_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label>
                <span>Situation</span>
                <select value={selectedSituation.id} onChange={(event) => setSelectedSituationId(event.target.value)}>
                  {filteredSituations.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                </select>
              </label>
            </div>

            <div className="fit-overview">
              <div
                className="fit-ring"
                style={{ "--fit-score": `${selectedScore.score * 3.6}deg` } as React.CSSProperties}
                aria-label={`Fit score ${selectedScore.score} out of 100`}
              >
                <div><strong>{selectedScore.score}</strong><span>fit score</span></div>
              </div>
              <div>
                <span className="category-pill">{selectedSituation.category}</span>
                <h3>{selectedSituation.title}</h3>
                <p>{selectedSituation.summary}</p>
              </div>
            </div>

            <RadarChart profile={profile} comparison={selectedSituation.ideal} compact />

            <div className="recommendation-block">
              <span className="mini-heading">Highest-value adaptations</span>
              {recommendations.length ? (
                <div className="recommendation-list">
                  {recommendations.map((recommendation, index) => (
                    <button
                      key={recommendation.key}
                      onClick={() => setActiveDimension(recommendation.key)}
                      className={activeDimension === recommendation.key ? "recommendation recommendation--active" : "recommendation"}
                    >
                      <span>{index + 1}</span>
                      <div>
                        <strong>{recommendation.dimensionName}</strong>
                        <small>Move {recommendation.text}</small>
                      </div>
                      <Icon name="arrow" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="empty-note">This configuration is already close to the situation profile.</p>
              )}
            </div>

            <div className="marginal-card">
              <div className="marginal-card__header">
                <div>
                  <span className="mini-heading">Hold everything else constant</span>
                  <h3>{activeDefinition.name}</h3>
                </div>
                <span className="value-pill">{profile[activeDimension]}</span>
              </div>
              <p>{activeDefinition.description}</p>
              <div className="impact-options">
                <button onClick={() => applyStep(activeDimension, -10)} disabled={profile[activeDimension] === 0}>
                  <span>−10 toward {activeDefinition.lowLabel}</span>
                  <strong className={activeImpact.lowerImpact > 0 ? "impact-positive" : activeImpact.lowerImpact < 0 ? "impact-negative" : ""}>
                    {impactText(activeImpact.lowerImpact)} fit
                  </strong>
                </button>
                <div>
                  <span>Hold at {profile[activeDimension]}</span>
                  <strong>Current {selectedScore.score}</strong>
                </div>
                <button onClick={() => applyStep(activeDimension, 10)} disabled={profile[activeDimension] === 100}>
                  <span>+10 toward {activeDefinition.highLabel}</span>
                  <strong className={activeImpact.higherImpact > 0 ? "impact-positive" : activeImpact.higherImpact < 0 ? "impact-negative" : ""}>
                    {impactText(activeImpact.higherImpact)} fit
                  </strong>
                </button>
              </div>
              <small className="model-note">This comparison changes one slider only; all other values remain fixed.</small>
            </div>

            <div className="action-box">
              <span className="mini-heading">Management moves</span>
              <ul>
                {selectedSituation.recommendedActions.map((action) => <li key={action}>{action}</li>)}
              </ul>
              <p><strong>Risk:</strong> {selectedSituation.warning}</p>
            </div>
          </section>
        </section>

        <section className="insights-grid">
          <article className="panel rankings-panel">
            <div className="panel__heading">
              <div>
                <span className="section-kicker">Configuration map</span>
                <h2>Where this style helps most</h2>
              </div>
            </div>
            <div className="ranking-columns">
              <div>
                <span className="mini-heading">Strongest matches</span>
                {rankedSituations.slice(0, 5).map((item, index) => (
                  <button className="ranking-row" key={item.situation.id} onClick={() => setSelectedSituationId(item.situation.id)}>
                    <span className="rank-number">{index + 1}</span>
                    <div><strong>{item.situation.title}</strong><small>{item.situation.category}</small></div>
                    <span className="ranking-score">{item.score}</span>
                  </button>
                ))}
              </div>
              <div>
                <span className="mini-heading">Largest adaptations</span>
                {rankedSituations.slice(-5).reverse().map((item) => (
                  <button className="ranking-row" key={item.situation.id} onClick={() => setSelectedSituationId(item.situation.id)}>
                    <span className="rank-number rank-number--stretch">↗</span>
                    <div><strong>{item.situation.title}</strong><small>{item.situation.category}</small></div>
                    <span className="ranking-score ranking-score--stretch">{item.score}</span>
                  </button>
                ))}
              </div>
            </div>
          </article>

          <article className="panel saved-panel">
            <div className="panel__heading">
              <div>
                <span className="section-kicker">Style switching</span>
                <h2>Saved management modes</h2>
              </div>
              <span className="count-badge">{hydrated ? savedModes.length : "–"} saved</span>
            </div>
            <p className="panel-intro">Save deliberate modes for recurring contexts, then load them before a conversation, project, or incident.</p>
            <div className="save-form">
              <input
                value={modeName}
                maxLength={36}
                onChange={(event) => setModeName(event.target.value)}
                onKeyDown={(event) => { if (event.key === "Enter") saveMode(); }}
                placeholder="e.g. First-month coaching"
                aria-label="Saved mode name"
              />
              <button className="button button--primary" onClick={saveMode} disabled={!modeName.trim()}><Icon name="save" /> Save</button>
            </div>
            <div className="saved-list">
              {savedModes.length ? savedModes.map((mode) => {
                const match = getArchetypeMatches(mode.profile)[0];
                return (
                  <div className="saved-mode" key={mode.id}>
                    <button className="saved-mode__load" onClick={() => setProfile({ ...mode.profile })}>
                      <span className="saved-mode__code">{match.archetype.code}</span>
                      <div><strong>{mode.name}</strong><small>{match.archetype.name}</small></div>
                    </button>
                    <button className="icon-button" onClick={() => deleteMode(mode.id)} aria-label={`Delete ${mode.name}`}><Icon name="trash" /></button>
                  </div>
                );
              }) : (
                <div className="empty-state">
                  <strong>No modes saved yet</strong>
                  <p>Adjust the dials, name the configuration, and save it locally in this browser.</p>
                </div>
              )}
            </div>
          </article>
        </section>

        <section className="methodology">
          <div>
            <span className="section-kicker">How to interpret the result</span>
            <h2>A simulator, not a psychological diagnosis.</h2>
          </div>
          <div className="methodology__grid">
            <p><strong>Independent dimensions.</strong> Care and challenge, people and task, or autonomy and transparency can move separately. The app avoids collapsing them into one “good manager” number.</p>
            <p><strong>Situational ideals.</strong> Every scenario has a transparent reference configuration and weighted dimensions. Fit is a weighted distance, adjusted by a small set of visible combination rules.</p>
            <p><strong>Conversation starter.</strong> The scores are hypotheses for reflection, coaching, and team discussion—not validated clinical or employment-selection measurements.</p>
          </div>
        </section>
      </main>

      <footer>
        <span>LeadShift MVP</span>
        <span>{ARCHETYPES.length} archetypes · {SITUATIONS.length} situations · deterministic scoring</span>
      </footer>
    </div>
  );
}
