"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ProfileSliders } from "@/components/ProfileSliders";
import { ProfileSummary } from "@/components/ProfileSummary";
import { ASSESSMENT_SCENARIOS } from "@/data/assessment";
import { CONTEXT_DEFINITIONS, DEFAULT_CONTEXT } from "@/data/context";
import { DEFAULT_PROFILE, DIMENSIONS, PRESET_PROFILES } from "@/data/dimensions";
import { SIMULATOR_SCENARIOS } from "@/data/simulator";
import { SITUATIONS } from "@/data/situations";
import {
  clamp,
  getArchetypeCode,
  getAssessmentProfile,
  getBehaviorRecommendations,
  getContextRecommendedProfile,
  getConversationExample,
  getHistoryInsight,
  getJournalInsight,
  getMarginalImpacts,
  getOvercorrectionWarnings,
  getPerceptionGaps,
  getProfileWarnings,
  getStyleShiftInsight,
  rankSituations,
  getTeamPerceptionAverage,
  scoreSituation,
  type ConversationTone,
} from "@/lib/engine";
import {
  clearAnalyticsPreference,
  getAnalyticsPreference,
  setAnalyticsPreference,
  trackEvent,
  valueBand,
  type AnalyticsPreference,
} from "@/lib/analytics";
import {
  clearSessionWorkspace,
  loadSessionWorkspace,
  removeLegacyPersistentWorkspace,
  saveSessionWorkspace,
} from "@/lib/session-storage";
import type {
  ContextProfile,
  DimensionKey,
  JournalEntry,
  ManagementProfile,
  SimulatorChoice,
  StyleSnapshot,
  SituationContext,
  TeamPerceptionResponse,
} from "@/lib/types";

const TABS = [
  ["styles", "Style lab"],
  ["assessment", "Assessment"],
  ["context", "Situation builder"],
  ["history", "History"],
  ["team", "Team view"],
  ["journal", "Decision journal"],
  ["simulator", "Simulator"],
] as const;

type TabId = (typeof TABS)[number][0];

type StoredWorkspace = {
  activeTab: TabId;
  naturalProfile: ManagementProfile;
  workingProfile: ManagementProfile;
  context: SituationContext;
  selectedSituationId: string;
  assessmentAnswers: Record<string, string>;
  conversationTone: ConversationTone;
  snapshots: StyleSnapshot[];
  perceptions: TeamPerceptionResponse[];
  contextProfiles: ContextProfile[];
  journal: JournalEntry[];
  simulatorId: string;
  simulatorNodeId: string;
  simulatorScores: { trust: number; clarity: number; accountability: number; delivery: number };
  simulatorResponse: string;
  simulatorComplete: boolean;
};

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));

const fitLabel = (score: number) => {
  if (score >= 86) return "Excellent fit";
  if (score >= 72) return "Strong fit";
  if (score >= 58) return "Workable fit";
  if (score >= 44) return "Needs adaptation";
  return "High-friction fit";
};

const scoreClass = (score: number) =>
  score >= 72 ? "good" : score >= 52 ? "mid" : "low";

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );
}

export default function ManagementLab() {
  const [activeTab, setActiveTab] = useState<TabId>("styles");
  const [naturalProfile, setNaturalProfile] = useState<ManagementProfile>(DEFAULT_PROFILE);
  const [workingProfile, setWorkingProfile] = useState<ManagementProfile>(DEFAULT_PROFILE);
  const [activeDimension, setActiveDimension] = useState<DimensionKey>("authority");
  const [selectedSituationId, setSelectedSituationId] = useState("senior-team");
  const [context, setContext] = useState<SituationContext>(DEFAULT_CONTEXT);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({});
  const [conversationTone, setConversationTone] = useState<ConversationTone>("collaborative");
  const [snapshots, setSnapshots] = useState<StyleSnapshot[]>([]);
  const [snapshotLabel, setSnapshotLabel] = useState("After 30 days");
  const [snapshotNote, setSnapshotNote] = useState("");
  const [perceptions, setPerceptions] = useState<TeamPerceptionResponse[]>([]);
  const [perceptionDraft, setPerceptionDraft] = useState<ManagementProfile>(DEFAULT_PROFILE);
  const [relationship, setRelationship] = useState("Team member");
  const [contextProfiles, setContextProfiles] = useState<ContextProfile[]>([]);
  const [contextProfileName, setContextProfileName] = useState("");
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [journalForm, setJournalForm] = useState({
    situation: "",
    chosenStyle: "",
    intendedOutcome: "",
    actualOutcome: "",
    reflection: "",
  });
  const [simulatorId, setSimulatorId] = useState(SIMULATOR_SCENARIOS[0].id);
  const [simulatorNodeId, setSimulatorNodeId] = useState(SIMULATOR_SCENARIOS[0].startNodeId);
  const [simulatorScores, setSimulatorScores] = useState({ trust: 50, clarity: 50, accountability: 50, delivery: 50 });
  const [simulatorResponse, setSimulatorResponse] = useState("");
  const [simulatorComplete, setSimulatorComplete] = useState(false);
  const [shareStatus, setShareStatus] = useState("Share working style");
  const [analyticsPreference, setAnalyticsPreferenceState] = useState<AnalyticsPreference>("unset");
  const [hydrated, setHydrated] = useState(false);
  const sliderAnalyticsTimer = useRef<number | null>(null);
  const sessionStartedTracked = useRef(false);
  const assessmentStartedTracked = useRef(false);

  useEffect(() => {
    removeLegacyPersistentWorkspace();
    const stored = loadSessionWorkspace<StoredWorkspace>();
    const preference = getAnalyticsPreference();
    let sharedProfile: ManagementProfile | null = null;
    try {
      const encoded = new URLSearchParams(window.location.search).get("style");
      if (encoded) {
        const values = encoded.split(".").map(Number);
        if (values.length === DIMENSIONS.length && values.every(Number.isFinite)) {
          sharedProfile = DIMENSIONS.reduce((profile, dimension, index) => {
            profile[dimension.key] = clamp(values[index]);
            return profile;
          }, {} as ManagementProfile);
        }
      }
    } catch {
      // Local persistence and shared URLs are optional.
    }

    queueMicrotask(() => {
      if (stored.activeTab) setActiveTab(stored.activeTab);
      if (stored.naturalProfile) setNaturalProfile(stored.naturalProfile);
      if (sharedProfile) setWorkingProfile(sharedProfile);
      else if (stored.workingProfile) setWorkingProfile(stored.workingProfile);
      if (stored.context) setContext(stored.context);
      if (stored.selectedSituationId) setSelectedSituationId(stored.selectedSituationId);
      if (stored.assessmentAnswers) setAssessmentAnswers(stored.assessmentAnswers);
      if (stored.conversationTone) setConversationTone(stored.conversationTone);
      if (stored.snapshots) setSnapshots(stored.snapshots);
      if (stored.perceptions) setPerceptions(stored.perceptions);
      if (stored.contextProfiles) setContextProfiles(stored.contextProfiles);
      if (stored.journal) setJournal(stored.journal);
      if (stored.simulatorId) setSimulatorId(stored.simulatorId);
      if (stored.simulatorNodeId) setSimulatorNodeId(stored.simulatorNodeId);
      if (stored.simulatorScores) setSimulatorScores(stored.simulatorScores);
      if (stored.simulatorResponse !== undefined) setSimulatorResponse(stored.simulatorResponse);
      if (stored.simulatorComplete !== undefined) setSimulatorComplete(stored.simulatorComplete);
      setAnalyticsPreferenceState(preference);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const workspace: StoredWorkspace = {
      activeTab,
      naturalProfile,
      workingProfile,
      context,
      selectedSituationId,
      assessmentAnswers,
      conversationTone,
      snapshots,
      perceptions,
      contextProfiles,
      journal,
      simulatorId,
      simulatorNodeId,
      simulatorScores,
      simulatorResponse,
      simulatorComplete,
    };
    saveSessionWorkspace(workspace);
  }, [
    hydrated,
    activeTab,
    naturalProfile,
    workingProfile,
    context,
    selectedSituationId,
    assessmentAnswers,
    conversationTone,
    snapshots,
    perceptions,
    contextProfiles,
    journal,
    simulatorId,
    simulatorNodeId,
    simulatorScores,
    simulatorResponse,
    simulatorComplete,
  ]);

  useEffect(() => {
    if (!hydrated || analyticsPreference !== "accepted" || sessionStartedTracked.current) return;
    sessionStartedTracked.current = true;
    void trackEvent("session_started", { entryTab: activeTab });
  }, [activeTab, analyticsPreference, hydrated]);

  useEffect(() => {
    if (activeTab !== "assessment" || assessmentStartedTracked.current) return;
    assessmentStartedTracked.current = true;
    void trackEvent("assessment_started");
  }, [activeTab]);

  const changeTab = (tab: TabId) => {
    setActiveTab(tab);
    void trackEvent("tab_viewed", { tab });
  };

  const selectSituation = (situationId: string) => {
    setSelectedSituationId(situationId);
    void trackEvent("situation_selected", { situationId });
  };

  const applyWorkingProfile = (profile: ManagementProfile, source: string) => {
    setWorkingProfile({ ...profile });
    void trackEvent("profile_applied", { source, archetype: getArchetypeCode(profile) });
  };

  const changeWorkingProfile = (profile: ManagementProfile) => {
    const changed = DIMENSIONS.find((dimension) => workingProfile[dimension.key] !== profile[dimension.key]);
    if (changed) {
      const previousValue = workingProfile[changed.key];
      const nextValue = profile[changed.key];
      if (sliderAnalyticsTimer.current) window.clearTimeout(sliderAnalyticsTimer.current);
      sliderAnalyticsTimer.current = window.setTimeout(() => {
        void trackEvent("slider_adjusted", {
          dimension: changed.key,
          previousBand: valueBand(previousValue),
          nextBand: valueBand(nextValue),
          changeMagnitude: Math.abs(nextValue - previousValue),
        });
      }, 700);
    }
    setWorkingProfile(profile);
  };

  const chooseAnalytics = (preference: Exclude<AnalyticsPreference, "unset">) => {
    setAnalyticsPreference(preference);
    setAnalyticsPreferenceState(preference);
    if (preference === "accepted") {
      sessionStartedTracked.current = true;
      void trackEvent("session_started", { entryTab: activeTab, consentJustGranted: true });
    }
  };

  const reopenAnalyticsChoice = () => {
    clearAnalyticsPreference();
    setAnalyticsPreferenceState("unset");
    sessionStartedTracked.current = false;
  };

  const resetSession = () => {
    void trackEvent("session_reset");
    clearSessionWorkspace();
    const url = new URL(window.location.href);
    url.searchParams.delete("style");
    window.location.replace(`${url.pathname}${url.search}${url.hash}`);
  };

  const selectedSituation =
    SITUATIONS.find((situation) => situation.id === selectedSituationId) ?? SITUATIONS[0];
  const recommendedProfile = useMemo(
    () => getContextRecommendedProfile(context, selectedSituation),
    [context, selectedSituation],
  );
  const currentFit = useMemo(
    () => scoreSituation(workingProfile, { ...selectedSituation, ideal: recommendedProfile }),
    [workingProfile, selectedSituation, recommendedProfile],
  );
  const behaviorRecommendations = useMemo(
    () => getBehaviorRecommendations(workingProfile, recommendedProfile, 4),
    [workingProfile, recommendedProfile],
  );
  const overcorrectionWarnings = useMemo(
    () => getOvercorrectionWarnings(naturalProfile, workingProfile, recommendedProfile),
    [naturalProfile, workingProfile, recommendedProfile],
  );
  const profileWarnings = useMemo(() => getProfileWarnings(workingProfile), [workingProfile]);
  const rankedSituations = useMemo(() => rankSituations(workingProfile, SITUATIONS), [workingProfile]);
  const marginalImpacts = useMemo(
    () => getMarginalImpacts(workingProfile, { ...selectedSituation, ideal: recommendedProfile }),
    [workingProfile, selectedSituation, recommendedProfile],
  );
  const activeImpact = marginalImpacts.find((impact) => impact.key === activeDimension) ?? marginalImpacts[0];
  const activeDefinition = DIMENSIONS.find((dimension) => dimension.key === activeDimension) ?? DIMENSIONS[0];
  const teamAverage = useMemo(() => getTeamPerceptionAverage(perceptions), [perceptions]);
  const perceptionGaps = useMemo(
    () => (teamAverage ? getPerceptionGaps(workingProfile, teamAverage) : []),
    [workingProfile, teamAverage],
  );
  const assessmentProfile = useMemo(
    () => getAssessmentProfile(ASSESSMENT_SCENARIOS, assessmentAnswers, DEFAULT_PROFILE),
    [assessmentAnswers],
  );
  const answeredAssessmentCount = Object.keys(assessmentAnswers).length;
  const simulator =
    SIMULATOR_SCENARIOS.find((scenario) => scenario.id === simulatorId) ?? SIMULATOR_SCENARIOS[0];
  const simulatorNode = simulator.nodes.find((node) => node.id === simulatorNodeId);

  const shareProfile = async () => {
    const encoded = DIMENSIONS.map((dimension) => Math.round(workingProfile[dimension.key])).join(".");
    const url = new URL(window.location.href);
    url.searchParams.set("style", encoded);
    try {
      await navigator.clipboard.writeText(url.toString());
      setShareStatus("Link copied");
    } catch {
      window.history.replaceState({}, "", url);
      setShareStatus("Added to URL");
    }
    window.setTimeout(() => setShareStatus("Share working style"), 1800);
  };

  const saveSnapshot = () => {
    const label = snapshotLabel.trim();
    if (!label) return;
    setSnapshots((current) => [
      ...current,
      {
        id: uid(),
        label,
        note: snapshotNote.trim() || undefined,
        profile: { ...workingProfile },
        createdAt: new Date().toISOString(),
      },
    ]);
    setSnapshotNote("");
    void trackEvent("snapshot_saved", { snapshotNumber: snapshots.length + 1 });
  };

  const addPerception = () => {
    setPerceptions((current) => [
      ...current,
      {
        id: uid(),
        relationship,
        profile: { ...perceptionDraft },
        createdAt: new Date().toISOString(),
      },
    ]);
    setPerceptionDraft(DEFAULT_PROFILE);
    void trackEvent("team_perception_added", { responseNumber: perceptions.length + 1 });
  };

  const saveContextProfile = () => {
    const name = contextProfileName.trim();
    if (!name) return;
    setContextProfiles((current) => [
      {
        id: uid(),
        name,
        description: selectedSituation.title,
        profile: { ...workingProfile },
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setContextProfileName("");
    void trackEvent("context_profile_saved", { situationId: selectedSituationId, profileNumber: contextProfiles.length + 1 });
  };

  const addJournalEntry = () => {
    if (!journalForm.situation.trim() || !journalForm.intendedOutcome.trim()) return;
    setJournal((current) => [
      {
        id: uid(),
        createdAt: new Date().toISOString(),
        ...journalForm,
        profile: { ...workingProfile },
      },
      ...current,
    ]);
    setJournalForm({ situation: "", chosenStyle: "", intendedOutcome: "", actualOutcome: "", reflection: "" });
    void trackEvent("journal_entry_saved", {
      hasChosenStyle: Boolean(journalForm.chosenStyle.trim()),
      hasActualOutcome: Boolean(journalForm.actualOutcome.trim()),
      hasReflection: Boolean(journalForm.reflection.trim()),
      entryNumber: journal.length + 1,
    });
  };

  const resetSimulator = (nextId = simulatorId) => {
    const next = SIMULATOR_SCENARIOS.find((scenario) => scenario.id === nextId) ?? SIMULATOR_SCENARIOS[0];
    setSimulatorId(next.id);
    setSimulatorNodeId(next.startNodeId);
    setSimulatorScores({ trust: 50, clarity: 50, accountability: 50, delivery: 50 });
    setSimulatorResponse("");
    setSimulatorComplete(false);
    void trackEvent("simulation_started", { scenarioId: next.id });
  };

  const chooseSimulatorOption = (choice: SimulatorChoice) => {
    const nextScores = {
      trust: clamp(simulatorScores.trust + choice.effects.trust),
      clarity: clamp(simulatorScores.clarity + choice.effects.clarity),
      accountability: clamp(simulatorScores.accountability + choice.effects.accountability),
      delivery: clamp(simulatorScores.delivery + choice.effects.delivery),
    };
    setSimulatorScores(nextScores);
    setSimulatorResponse(choice.response);
    if (choice.nextNodeId) {
      setSimulatorNodeId(choice.nextNodeId);
    } else {
      setSimulatorComplete(true);
      void trackEvent("simulation_completed", {
        scenarioId: simulator.id,
        trustBand: valueBand(nextScores.trust),
        clarityBand: valueBand(nextScores.clarity),
        accountabilityBand: valueBand(nextScores.accountability),
        deliveryBand: valueBand(nextScores.delivery),
      });
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a href="#top" className="brand" aria-label="LeadShift home">
          <span className="brand__mark">LS</span>
          <span><strong>LeadShift</strong><small>Adaptive management laboratory</small></span>
        </a>
        <div className="topbar__actions">
          <button className="button button--ghost" onClick={reopenAnalyticsChoice}>Analytics {analyticsPreference === "accepted" ? "on" : analyticsPreference === "declined" ? "off" : "choice"}</button>
          <button className="button button--ghost" onClick={resetSession}>Reset session</button>
          <button className="button button--ghost" onClick={() => applyWorkingProfile(naturalProfile, "reset_to_natural")}>Reset to natural</button>
          <button className="button button--primary" onClick={shareProfile}>{shareStatus}</button>
        </div>
      </header>

      <main id="top" className="product-main">
        <section className="hero hero--product">
          <div>
            <span className="eyebrow">Know your default. Adapt with intent.</span>
            <h1>Practice the judgment behind flexible management.</h1>
            <p>
              Separate instinct from deliberate behavior, build a situation-specific recommendation,
              compare team perception, and learn through recorded decisions and branching simulations.
            </p>
          </div>
          <div className="hero__principle">
            <span>Current insight</span>
            <strong>{getStyleShiftInsight(naturalProfile, workingProfile)}</strong>
            <p>{selectedSituation.title}: {fitLabel(currentFit.score)} at {currentFit.score}%.</p>
          </div>
        </section>

        <nav className="product-tabs" aria-label="LeadShift sections">
          {TABS.map(([id, label]) => (
            <button key={id} className={activeTab === id ? "product-tab product-tab--active" : "product-tab"} onClick={() => changeTab(id)}>
              {label}
            </button>
          ))}
        </nav>

        {activeTab === "styles" && (
          <section className="tab-stack">
            <div className="section-heading-row">
              <div><span className="section-kicker">Three distinct profiles</span><h2>Instinct, deliberate style, and situational recommendation</h2></div>
              <span className={`fit-badge fit-badge--${scoreClass(currentFit.score)}`}>{currentFit.score}% situation fit</span>
            </div>

            <div className="profile-comparison-grid">
              <ProfileSummary
                label="Instinctive style"
                title="Natural default"
                profile={naturalProfile}
                action={<button className="text-button" onClick={() => applyWorkingProfile(naturalProfile, "natural_profile")}>Use now</button>}
              />
              <ProfileSummary
                label="Deliberate style"
                title="Current working mode"
                profile={workingProfile}
                comparison={naturalProfile}
                action={<button className="text-button" onClick={() => setNaturalProfile({ ...workingProfile })}>Make natural</button>}
              />
              <ProfileSummary
                label="Situation model"
                title="Recommended mode"
                profile={recommendedProfile}
                comparison={workingProfile}
                action={<button className="text-button" onClick={() => applyWorkingProfile(recommendedProfile, "recommended_profile")}>Adopt</button>}
              />
            </div>

            <div className="two-column-layout">
              <article className="panel">
                <div className="panel__heading">
                  <div><span className="section-kicker">Current working mode</span><h2>Adjust your chosen style</h2></div>
                  <span className="count-badge">10 dimensions</span>
                </div>
                <div className="preset-row">
                  {PRESET_PROFILES.map((preset) => (
                    <button key={preset.name} className="preset-chip" title={preset.description} onClick={() => applyWorkingProfile(preset.profile, `preset:${preset.name}`)}>{preset.name}</button>
                  ))}
                </div>
                <ProfileSliders profile={workingProfile} onChange={changeWorkingProfile} activeDimension={activeDimension} onActiveDimensionChange={setActiveDimension} />
              </article>

              <div className="stacked-column">
                <article className="panel">
                  <div className="panel__heading">
                    <div><span className="section-kicker">From numbers to behavior</span><h2>Highest-value actions</h2></div>
                  </div>
                  <div className="action-list">
                    {behaviorRecommendations.map((item) => (
                      <article key={item.key} className="action-card">
                        <span>{item.delta > 0 ? `+${Math.round(item.delta)}` : Math.round(item.delta)}</span>
                        <div><strong>{item.dimensionName}: toward {item.targetLabel}</strong><p>{item.action}</p></div>
                      </article>
                    ))}
                  </div>
                  <div className="conversation-card">
                    <div className="conversation-card__head">
                      <strong>Conversation example</strong>
                      <select value={conversationTone} onChange={(event) => setConversationTone(event.target.value as ConversationTone)}>
                        <option value="direct">More direct</option>
                        <option value="supportive">More supportive</option>
                        <option value="concise">More concise</option>
                        <option value="collaborative">More collaborative</option>
                      </select>
                    </div>
                    <blockquote>“{getConversationExample(workingProfile, recommendedProfile, conversationTone)}”</blockquote>
                  </div>
                </article>

                <article className="panel">
                  <div className="panel__heading"><div><span className="section-kicker">Guardrails</span><h2>Overcorrection and combination warnings</h2></div></div>
                  <div className="warning-stack">
                    {[...overcorrectionWarnings, ...profileWarnings].slice(0, 5).map((warning) => (
                      <article className={`warning-card warning-card--${warning.severity}`} key={warning.id}>
                        <span>{warning.severity === "watch" ? "Watch" : "Note"}</span>
                        <div><strong>{warning.title}</strong><p>{warning.body}</p></div>
                      </article>
                    ))}
                  </div>
                </article>
              </div>
            </div>

            <div className="two-column-layout">
              <article className="panel">
                <div className="panel__heading"><div><span className="section-kicker">Where this style helps</span><h2>Best-fit situations</h2></div><span className="count-badge">Top 6</span></div>
                <div className="ranked-situation-list">
                  {rankedSituations.slice(0, 6).map((item, index) => (
                    <button key={item.situation.id} onClick={() => { selectSituation(item.situation.id); changeTab("context"); }}>
                      <span>{index + 1}</span>
                      <div><strong>{item.situation.title}</strong><small>{item.situation.category}</small></div>
                      <b>{item.score}%</b>
                    </button>
                  ))}
                </div>
              </article>

              <article className="panel">
                <div className="panel__heading"><div><span className="section-kicker">Hold all other sliders constant</span><h2>{activeDefinition.name}</h2></div><span className="value-pill">{workingProfile[activeDimension]}</span></div>
                <label className="full-field"><span>Analyze against situation</span>
                  <select value={selectedSituationId} onChange={(event) => selectSituation(event.target.value)}>
                    {SITUATIONS.map((situation) => <option key={situation.id} value={situation.id}>{situation.title}</option>)}
                  </select>
                </label>
                <p className="helper-copy">{activeDefinition.description}</p>
                <div className="impact-options">
                  <button onClick={() => changeWorkingProfile({ ...workingProfile, [activeDimension]: clamp(workingProfile[activeDimension] - 10) })} disabled={workingProfile[activeDimension] === 0}>
                    <span>−10 toward {activeDefinition.lowLabel}</span><strong className={activeImpact.lowerImpact > 0 ? "impact-positive" : activeImpact.lowerImpact < 0 ? "impact-negative" : ""}>{activeImpact.lowerImpact > 0 ? "+" : ""}{activeImpact.lowerImpact} fit</strong>
                  </button>
                  <div><span>Hold current position</span><strong>{currentFit.score}% fit</strong></div>
                  <button onClick={() => changeWorkingProfile({ ...workingProfile, [activeDimension]: clamp(workingProfile[activeDimension] + 10) })} disabled={workingProfile[activeDimension] === 100}>
                    <span>+10 toward {activeDefinition.highLabel}</span><strong className={activeImpact.higherImpact > 0 ? "impact-positive" : activeImpact.higherImpact < 0 ? "impact-negative" : ""}>{activeImpact.higherImpact > 0 ? "+" : ""}{activeImpact.higherImpact} fit</strong>
                  </button>
                </div>
              </article>
            </div>
          </section>
        )}

        {activeTab === "assessment" && (
          <section className="tab-stack">
            <div className="section-heading-row">
              <div><span className="section-kicker">Scenario-based onboarding</span><h2>Estimate your instinctive style from choices</h2><p>Choose what you would genuinely do first, not what sounds theoretically ideal.</p></div>
              <span className="count-badge">{answeredAssessmentCount}/{ASSESSMENT_SCENARIOS.length} answered</span>
            </div>
            <div className="assessment-layout">
              <div className="assessment-list">
                {ASSESSMENT_SCENARIOS.map((scenario, index) => (
                  <article className="panel assessment-card" key={scenario.id}>
                    <span className="assessment-number">{index + 1}</span>
                    <div><span className="section-kicker">{scenario.title}</span><h3>{scenario.prompt}</h3></div>
                    <div className="option-list">
                      {scenario.options.map((option) => (
                        <label className={assessmentAnswers[scenario.id] === option.id ? "choice-card choice-card--selected" : "choice-card"} key={option.id}>
                          <input
                            type="radio"
                            name={scenario.id}
                            checked={assessmentAnswers[scenario.id] === option.id}
                            onChange={() => setAssessmentAnswers((current) => ({ ...current, [scenario.id]: option.id }))}
                          />
                          <span><strong>{option.label}</strong><small>{option.rationale}</small></span>
                        </label>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
              <aside className="sticky-column">
                <ProfileSummary label="Assessment estimate" title="Emerging natural style" profile={assessmentProfile} />
                <button className="button button--primary button--wide" disabled={answeredAssessmentCount < 3} onClick={() => {
                  setNaturalProfile({ ...assessmentProfile });
                  applyWorkingProfile(assessmentProfile, "assessment_result");
                  void trackEvent("assessment_completed", {
                    answeredCount: answeredAssessmentCount,
                    archetype: getArchetypeCode(assessmentProfile),
                  });
                  changeTab("styles");
                }}>
                  Apply as my natural style
                </button>
                <p className="helper-text">Answer at least three scenarios. Completing all six produces a more stable estimate.</p>
              </aside>
            </div>
          </section>
        )}

        {activeTab === "context" && (
          <section className="tab-stack">
            <div className="section-heading-row">
              <div><span className="section-kicker">Situational leadership engine</span><h2>Describe the team and the stakes</h2><p>The recommendation combines a curated situation with eight independent context signals.</p></div>
              <span className={`fit-badge fit-badge--${scoreClass(currentFit.score)}`}>{fitLabel(currentFit.score)}</span>
            </div>
            <div className="two-column-layout">
              <article className="panel">
                <label className="full-field"><span>Starting situation</span>
                  <select value={selectedSituationId} onChange={(event) => selectSituation(event.target.value)}>
                    {SITUATIONS.map((situation) => <option key={situation.id} value={situation.id}>{situation.title}</option>)}
                  </select>
                </label>
                <div className="situation-intro"><strong>{selectedSituation.title}</strong><p>{selectedSituation.summary}</p></div>
                <div className="context-control-list">
                  {CONTEXT_DEFINITIONS.map((definition) => {
                    const value = context[definition.key];
                    return (
                      <div className="context-control" key={definition.key}>
                        <div><label htmlFor={`context-${definition.key}`}>{definition.name}</label><span>{value}</span></div>
                        <p>{definition.description}</p>
                        <input
                          id={`context-${definition.key}`}
                          type="range"
                          min="0"
                          max="100"
                          value={value}
                          style={{ "--slider-value": `${value}%` } as React.CSSProperties}
                          onChange={(event) => setContext((current) => ({ ...current, [definition.key]: Number(event.target.value) } as SituationContext))}
                        />
                        <div className="range-labels"><span>{definition.lowLabel}</span><span>{definition.highLabel}</span></div>
                      </div>
                    );
                  })}
                </div>
              </article>

              <div className="stacked-column">
                <div className="profile-comparison-grid profile-comparison-grid--two">
                  <ProfileSummary label="Current" title="Working style" profile={workingProfile} />
                  <ProfileSummary label="Calculated" title="Recommended style" profile={recommendedProfile} comparison={workingProfile} action={<button className="text-button" onClick={() => applyWorkingProfile(recommendedProfile, "recommended_profile")}>Adopt</button>} />
                </div>
                <article className="panel">
                  <div className="panel__heading"><div><span className="section-kicker">Context-specific profiles</span><h2>Save how you lead different groups</h2></div></div>
                  <div className="inline-form">
                    <input value={contextProfileName} onChange={(event) => setContextProfileName(event.target.value)} placeholder="e.g. Senior engineers" />
                    <button className="button button--primary" onClick={saveContextProfile} disabled={!contextProfileName.trim()}>Save profile</button>
                  </div>
                  <div className="saved-card-list">
                    {contextProfiles.length ? contextProfiles.map((item) => (
                      <article className="saved-card" key={item.id}>
                        <div><strong>{item.name}</strong><small>{item.description} · {formatDate(item.createdAt)}</small></div>
                        <div className="saved-card__actions">
                          <button className="text-button" onClick={() => applyWorkingProfile(item.profile, "context_profile")}>Load</button>
                          <button className="text-button text-button--danger" onClick={() => setContextProfiles((current) => current.filter((profile) => profile.id !== item.id))}>Delete</button>
                        </div>
                      </article>
                    )) : <EmptyState title="No context profiles yet" body="Save separate working styles for senior engineers, junior employees, cross-functional partners, or other recurring contexts." />}
                  </div>
                </article>
              </div>
            </div>
          </section>
        )}

        {activeTab === "history" && (
          <section className="tab-stack">
            <div className="section-heading-row"><div><span className="section-kicker">Style history</span><h2>Record how your management mode changes</h2><p>{getHistoryInsight(snapshots)}</p></div><span className="count-badge">{snapshots.length} snapshots</span></div>
            <div className="two-column-layout">
              <article className="panel">
                <div className="panel__heading"><div><span className="section-kicker">New snapshot</span><h2>Capture the current working style</h2></div></div>
                <div className="quick-labels">
                  {["Before joining the team", "After 30 days", "During a crisis", "After team feedback"].map((label) => <button className="preset-chip" key={label} onClick={() => setSnapshotLabel(label)}>{label}</button>)}
                </div>
                <label className="full-field"><span>Snapshot label</span><input value={snapshotLabel} onChange={(event) => setSnapshotLabel(event.target.value)} /></label>
                <label className="full-field"><span>Optional note</span><textarea value={snapshotNote} onChange={(event) => setSnapshotNote(event.target.value)} placeholder="What changed in the team or situation?" /></label>
                <button className="button button--primary" onClick={saveSnapshot}>Record snapshot</button>
                <ProfileSummary label="Will be recorded" title={snapshotLabel || "Current style"} profile={workingProfile} />
              </article>
              <div className="timeline">
                {snapshots.length ? [...snapshots].reverse().map((snapshot, index) => (
                  <article className="timeline-item" key={snapshot.id}>
                    <span className="timeline-dot" />
                    <div className="panel">
                      <div className="timeline-item__head"><div><span>{formatDate(snapshot.createdAt)}</span><h3>{snapshot.label}</h3></div><button className="text-button text-button--danger" onClick={() => setSnapshots((current) => current.filter((item) => item.id !== snapshot.id))}>Delete</button></div>
                      {snapshot.note && <p>{snapshot.note}</p>}
                      {index < snapshots.length - 1 && (
                        <small>Compared with the previous recorded point, review the largest movements in the radar shape rather than treating any direction as universally better.</small>
                      )}
                    </div>
                  </article>
                )) : <EmptyState title="Your timeline is empty" body="Record the same team at meaningful moments to see whether urgency, feedback, or organizational pressure is changing how you lead." />}
              </div>
            </div>
          </section>
        )}

        {activeTab === "team" && (
          <section className="tab-stack">
            <div className="section-heading-row"><div><span className="section-kicker">Team perception comparison</span><h2>Compare intent with experienced behavior</h2><p>This MVP stores responses only in this browser. A production anonymous survey would require authentication, secure aggregation, minimum response thresholds, and a backend.</p></div><span className="count-badge">{perceptions.length} responses</span></div>
            <div className="two-column-layout">
              <article className="panel">
                <div className="panel__heading"><div><span className="section-kicker">Anonymous response preview</span><h2>How does this manager feel in practice?</h2></div></div>
                <label className="full-field"><span>Relationship context</span>
                  <select value={relationship} onChange={(event) => setRelationship(event.target.value)}>
                    <option>Team member</option><option>Peer</option><option>Direct manager</option><option>Cross-functional partner</option>
                  </select>
                </label>
                <ProfileSliders profile={perceptionDraft} onChange={setPerceptionDraft} compact />
                <button className="button button--primary" onClick={addPerception}>Add anonymous response</button>
              </article>
              <div className="stacked-column">
                {teamAverage ? (
                  <>
                    <div className="profile-comparison-grid profile-comparison-grid--two">
                      <ProfileSummary label="Self view" title="Current working style" profile={workingProfile} />
                      <ProfileSummary label={`${perceptions.length} response average`} title="Team experience" profile={teamAverage} comparison={workingProfile} />
                    </div>
                    <article className="panel">
                      <div className="panel__heading"><div><span className="section-kicker">Largest perception gaps</span><h2>Where intent and experience differ</h2></div></div>
                      <div className="gap-list">
                        {perceptionGaps.map((gap) => (
                          <div className="gap-row" key={gap.key}>
                            <div><strong>{gap.name}</strong><small>Experienced as more {gap.experiencedAs.toLowerCase()}</small></div>
                            <span>Self {gap.self}</span><b>{gap.gap > 0 ? `+${gap.gap}` : gap.gap}</b><span>Team {gap.team}</span>
                          </div>
                        ))}
                      </div>
                      <button className="text-button text-button--danger" onClick={() => setPerceptions([])}>Clear local responses</button>
                    </article>
                  </>
                ) : <EmptyState title="No team responses yet" body="Add at least one response to compare how your current working style is experienced by others." />}
              </div>
            </div>
          </section>
        )}

        {activeTab === "journal" && (
          <section className="tab-stack">
            <div className="section-heading-row"><div><span className="section-kicker">Decision journal</span><h2>Connect chosen style to actual outcomes</h2><p>{getJournalInsight(journal)}</p></div><span className="count-badge">{journal.length} decisions</span></div>
            <div className="two-column-layout">
              <article className="panel journal-form">
                <label className="full-field"><span>Situation</span><input value={journalForm.situation} onChange={(event) => setJournalForm((current) => ({ ...current, situation: event.target.value }))} placeholder="What management decision did you face?" /></label>
                <label className="full-field"><span>Chosen style</span><input value={journalForm.chosenStyle} onChange={(event) => setJournalForm((current) => ({ ...current, chosenStyle: event.target.value }))} placeholder="e.g. Participative planning with firm deadline" /></label>
                <label className="full-field"><span>Intended outcome</span><textarea value={journalForm.intendedOutcome} onChange={(event) => setJournalForm((current) => ({ ...current, intendedOutcome: event.target.value }))} /></label>
                <label className="full-field"><span>What happened</span><textarea value={journalForm.actualOutcome} onChange={(event) => setJournalForm((current) => ({ ...current, actualOutcome: event.target.value }))} /></label>
                <label className="full-field"><span>What would you change?</span><textarea value={journalForm.reflection} onChange={(event) => setJournalForm((current) => ({ ...current, reflection: event.target.value }))} /></label>
                <button className="button button--primary" onClick={addJournalEntry} disabled={!journalForm.situation.trim() || !journalForm.intendedOutcome.trim()}>Record decision</button>
              </article>
              <div className="journal-list">
                {journal.length ? journal.map((entry) => (
                  <article className="panel journal-entry" key={entry.id}>
                    <div className="timeline-item__head"><div><span>{formatDate(entry.createdAt)}</span><h3>{entry.situation}</h3></div><button className="text-button text-button--danger" onClick={() => setJournal((current) => current.filter((item) => item.id !== entry.id))}>Delete</button></div>
                    {entry.chosenStyle && <p><strong>Chosen style:</strong> {entry.chosenStyle}</p>}
                    <p><strong>Intended:</strong> {entry.intendedOutcome}</p>
                    {entry.actualOutcome && <p><strong>Outcome:</strong> {entry.actualOutcome}</p>}
                    {entry.reflection && <p><strong>Next time:</strong> {entry.reflection}</p>}
                  </article>
                )) : <EmptyState title="No decisions recorded" body="The journal becomes useful when you revisit outcomes instead of evaluating a choice only by how reasonable it felt at the time." />}
              </div>
            </div>
          </section>
        )}

        {activeTab === "simulator" && (
          <section className="tab-stack">
            <div className="section-heading-row"><div><span className="section-kicker">Branching practice</span><h2>See how management choices change the system</h2><p>These are learning simulations, not predictions about a specific person.</p></div><button className="button button--ghost" onClick={() => resetSimulator()}>Restart scenario</button></div>
            <div className="simulator-layout">
              <article className="panel simulator-panel">
                <label className="full-field"><span>Scenario</span>
                  <select value={simulatorId} onChange={(event) => resetSimulator(event.target.value)}>
                    {SIMULATOR_SCENARIOS.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.title}</option>)}
                  </select>
                </label>
                <div className="situation-intro"><strong>{simulator.title}</strong><p>{simulator.description}</p></div>
                {simulatorResponse && <div className="simulator-response"><span>What happened</span><p>{simulatorResponse}</p></div>}
                {!simulatorComplete && simulatorNode ? (
                  <>
                    <h3 className="simulator-prompt">{simulatorNode.prompt}</h3>
                    <div className="simulator-choices">
                      {simulatorNode.choices.map((choice) => <button key={choice.id} onClick={() => chooseSimulatorOption(choice)}>{choice.label}</button>)}
                    </div>
                  </>
                ) : (
                  <div className="simulator-finish"><strong>Scenario complete</strong><p>Review the system effects, then replay with a different first move. The strongest answer often combines temporary situational adaptation with an explicit return to normal ownership.</p></div>
                )}
              </article>
              <aside className="panel outcome-panel">
                <div className="panel__heading"><div><span className="section-kicker">Simulated effects</span><h2>Team system</h2></div></div>
                {Object.entries(simulatorScores).map(([key, value]) => (
                  <div className="outcome-meter" key={key}>
                    <div><span>{key}</span><strong>{value}</strong></div>
                    <div><i style={{ width: `${value}%` }} /></div>
                  </div>
                ))}
                <div className="insight-card"><strong>Interpretation</strong><p>Clarity and delivery can rise while trust and accountability fall. The simulator makes those trade-offs visible instead of rewarding only immediate output.</p></div>
              </aside>
            </div>
          </section>
        )}
      </main>

      {analyticsPreference === "unset" && (
        <aside className="analytics-consent" role="dialog" aria-label="Anonymous analytics preference">
          <div>
            <strong>Help improve LeadShift?</strong>
            <p>Management answers stay in this browser tab. With permission, LeadShift records anonymous feature-use events and broad value bands—not journal text, team comments, names, employers, or exact slider profiles.</p>
          </div>
          <div className="analytics-consent__actions">
            <button className="button button--ghost" onClick={() => chooseAnalytics("declined")}>No thanks</button>
            <button className="button button--primary" onClick={() => chooseAnalytics("accepted")}>Allow anonymous analytics</button>
          </div>
        </aside>
      )}

      <footer className="footer">
        <strong>LeadShift</strong>
        <span>A reflective learning tool—not a clinical assessment or a substitute for team feedback.</span>
      </footer>
    </div>
  );
}
