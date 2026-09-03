"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ProfileSliders } from "@/components/ProfileSliders";
import { ProfileSummary } from "@/components/ProfileSummary";
import { ArchetypeSimulator } from "@/components/ArchetypeSimulator";
import { RadarChart, TrackEvolutionRadar } from "@/components/RadarChart";
import { STYLE_TRACKS, getMilestoneForDate, getDaysUntilNext } from "@/data/tracks";
import type { StyleMilestone } from "@/data/tracks";
import type { TrackProgress } from "@/lib/types";
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
import { OnboardingGate } from "@/components/Tutorial";
import { WizardFlow } from "@/components/WizardFlow";
import { WizardNaturalPhase } from "@/components/WizardNaturalPhase";
import { WizardWorkingPhase } from "@/components/WizardWorkingPhase";
import { WizardContextPhase } from "@/components/WizardContextPhase";
import { StylesPage } from "@/components/StylesPage";
import { ArchetypesPage } from "@/components/ArchetypesPage";
import { decodeTripleProfile, encodeTripleProfile } from "@/lib/url-compression";
import { TEMPLATES } from "@/data/templates";
import type { TripleProfile } from "@/lib/url-compression";
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
  ["practice", "Simulator"],
  ["style", "Profiles"],
  ["journey", "Growth"],
  ["archetypes", "Explore"],
  ["reflect", "Journal"],
] as const;

type TabId = (typeof TABS)[number][0];

type StoredWorkspace = {
  activeTab: TabId;
  naturalProfile: ManagementProfile;
  workingProfile: ManagementProfile;
  recommendedProfile: ManagementProfile;
  context: SituationContext;
  selectedSituationId: string;
  assessmentAnswers: Record<string, string>;
  assessmentStep: number;
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
  simReflection: string;
  simCommitment: string;
  trackProgress: TrackProgress | null;
};

const JOURNAL_SITUATIONS = [
  "Deadline missed", "Performance issue", "Team conflict",
  "Prioritization call", "Promotion decision", "1:1 conversation",
  "Team change", "Cross-team friction",
];

const COMMITMENT_CHIPS = [
  "Delegate more decisions",
  "Set clearer checkpoints",
  "Name the pattern earlier",
  "Ask before acting",
  "Hold the performance bar",
  "Schedule a direct 1:1",
];

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
  const [activeTab, setActiveTab] = useState<TabId>("practice");
  const [naturalProfile, setNaturalProfile] = useState<ManagementProfile>(DEFAULT_PROFILE);
  const [workingProfile, setWorkingProfile] = useState<ManagementProfile>(DEFAULT_PROFILE);
  const [activeDimension, setActiveDimension] = useState<DimensionKey>("authority");
  const [selectedSituationId, setSelectedSituationId] = useState("senior-team");
  const [context, setContext] = useState<SituationContext>(DEFAULT_CONTEXT);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({});
  const [assessmentStep, setAssessmentStep] = useState(0);
  const [conversationTone, setConversationTone] = useState<ConversationTone>("collaborative");
  const [snapshots, setSnapshots] = useState<StyleSnapshot[]>([]);
  const [snapshotLabel, setSnapshotLabel] = useState("After 30 days");
  const [perceptions, setPerceptions] = useState<TeamPerceptionResponse[]>([]);
  const [perceptionDraft, setPerceptionDraft] = useState<ManagementProfile>(DEFAULT_PROFILE);
  const [relationship, setRelationship] = useState("Team member");
  const [contextProfiles, setContextProfiles] = useState<ContextProfile[]>([]);
  const [contextProfileName, setContextProfileName] = useState("");
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [journalForm, setJournalForm] = useState({
    situation: "",
    outcome: "",
    reflection: "",
  });
  const [simulatorId, setSimulatorId] = useState(SIMULATOR_SCENARIOS[0].id);
  const [simulatorNodeId, setSimulatorNodeId] = useState(SIMULATOR_SCENARIOS[0].startNodeId);
  const [simulatorScores, setSimulatorScores] = useState({ trust: 50, clarity: 50, accountability: 50, delivery: 50 });
  const [simulatorResponse, setSimulatorResponse] = useState("");
  const [simulatorComplete, setSimulatorComplete] = useState(false);
  const [simReflection, setSimReflection] = useState("");
  const [simCommitment, setSimCommitment] = useState("");
  const [trackProgress, setTrackProgress] = useState<TrackProgress | null>(null);
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState<number | null>(null);
  const [shareStatus, setShareStatus] = useState("Share");
  const [analyticsPreference, setAnalyticsPreferenceState] = useState<AnalyticsPreference>("unset");
  const [hydrated, setHydrated] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [visitState, setVisitState] = useState<"gate" | "wizard" | "app">("gate");
  const [wizardRecommended, setWizardRecommended] = useState<ManagementProfile>(DEFAULT_PROFILE);
  const [experiencedCode, setExperiencedCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [showTemplateSelection, setShowTemplateSelection] = useState(false);
  const [editingPhase, setEditingPhase] = useState<"natural" | "working" | "recommended" | null>(null);
  const sliderAnalyticsTimer = useRef<number | null>(null);
  const sessionStartedTracked = useRef(false);
  const assessmentStartedTracked = useRef(false);

  useEffect(() => {
    removeLegacyPersistentWorkspace();
    const stored = loadSessionWorkspace<StoredWorkspace>();
    const preference = getAnalyticsPreference();
    let sharedProfile: ManagementProfile | null = null;
    let tripleProfile: TripleProfile | null = null;
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
      const codeParam = new URLSearchParams(window.location.search).get("code");
      if (codeParam) {
        tripleProfile = decodeTripleProfile(codeParam);
      }
    } catch {
      // Local persistence and shared URLs are optional.
    }

    queueMicrotask(() => {
      const savedDark = window.localStorage.getItem("leadshift:darkMode");
      if (savedDark !== null) setDarkMode(savedDark !== "false");
      if (stored.activeTab) setActiveTab(stored.activeTab);
      if (stored.naturalProfile) setNaturalProfile(stored.naturalProfile);
      if (sharedProfile) setWorkingProfile(sharedProfile);
      else if (stored.workingProfile) setWorkingProfile(stored.workingProfile);
      if (stored.context) setContext(stored.context);
      if (stored.selectedSituationId) setSelectedSituationId(stored.selectedSituationId);
      if (stored.assessmentAnswers) setAssessmentAnswers(stored.assessmentAnswers);
      if (stored.assessmentStep !== undefined) setAssessmentStep(stored.assessmentStep);
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
      if (stored.simReflection !== undefined) setSimReflection(stored.simReflection);
      if (stored.simCommitment !== undefined) setSimCommitment(stored.simCommitment);
      if (stored.trackProgress !== undefined) setTrackProgress(stored.trackProgress);
      if (stored.recommendedProfile) setWizardRecommended(stored.recommendedProfile);
      setAnalyticsPreferenceState(preference);
      setHydrated(true);

      // Handle URL code param first
      if (tripleProfile) {
        setNaturalProfile(tripleProfile.natural);
        setWorkingProfile(tripleProfile.working);
        setWizardRecommended(tripleProfile.recommended);
        window.localStorage.setItem("leadshift:visited", "1");
        setVisitState("app");
        return;
      }

      const visited = window.localStorage.getItem("leadshift:visited");
      if (!visited) {
        setVisitState("gate");
      } else {
        setVisitState("app");
      }
    });
  }, []);

  useEffect(() => {
    setSelectedMilestoneIndex(null);
  }, [trackProgress?.trackId]);

  useEffect(() => {
    if (!hydrated) return;
    const workspace: StoredWorkspace = {
      activeTab,
      naturalProfile,
      workingProfile,
      recommendedProfile: wizardRecommended,
      context,
      selectedSituationId,
      assessmentAnswers,
      assessmentStep,
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
      simReflection,
      simCommitment,
      trackProgress,
    };
    saveSessionWorkspace(workspace);
  }, [
    hydrated,
    activeTab,
    naturalProfile,
    workingProfile,
    wizardRecommended,
    context,
    selectedSituationId,
    assessmentAnswers,
    assessmentStep,
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
    simReflection,
    simCommitment,
    trackProgress,
  ]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("leadshift:darkMode", String(darkMode));
  }, [hydrated, darkMode]);

  useEffect(() => {
    if (!hydrated || analyticsPreference !== "accepted" || sessionStartedTracked.current) return;
    sessionStartedTracked.current = true;
    void trackEvent("session_started", { entryTab: activeTab });
  }, [activeTab, analyticsPreference, hydrated]);

  useEffect(() => {
    if (activeTab !== "style" || assessmentStartedTracked.current) return;
    if (assessmentStep > 0) {
      assessmentStartedTracked.current = true;
      void trackEvent("assessment_started");
    }
  }, [activeTab, assessmentStep]);

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
    window.localStorage.removeItem("leadshift:visited");
    const url = new URL(window.location.href);
    url.searchParams.delete("style");
    url.searchParams.delete("code");
    window.location.replace(`${url.pathname}${url.search}${url.hash}`);
  };

  const handleExperienced = (code: string) => {
    if (!code.trim()) {
      setShowTemplateSelection(true);
      setCodeError("");
      return;
    }
    const triple = decodeTripleProfile(code.trim());
    if (triple) {
      setNaturalProfile(triple.natural);
      setWorkingProfile(triple.working);
      setWizardRecommended(triple.recommended);
      window.localStorage.setItem("leadshift:visited", "1");
      setVisitState("app");
    } else {
      setCodeError("Invalid code. Try a template or the guided wizard.");
      setShowTemplateSelection(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setNaturalProfile(template.profiles.natural);
      setWorkingProfile(template.profiles.working);
      setWizardRecommended(template.profiles.recommended);
      window.localStorage.setItem("leadshift:visited", "1");
      setShowTemplateSelection(false);
      setVisitState("app");
    }
  };

  const handleWizardComplete = (triple: TripleProfile) => {
    setNaturalProfile(triple.natural);
    setWorkingProfile(triple.working);
    setWizardRecommended(triple.recommended);
    window.localStorage.setItem("leadshift:visited", "1");
    setVisitState("app");
  };

  const closeEditWizard = () => setEditingPhase(null);

  const handleEditNaturalComplete = (profile: ManagementProfile) => {
    setNaturalProfile(profile);
    closeEditWizard();
  };

  const handleEditWorkingComplete = (profile: ManagementProfile) => {
    setWorkingProfile(profile);
    closeEditWizard();
  };

  const handleEditRecommendedComplete = (profile: ManagementProfile) => {
    setWizardRecommended(profile);
    closeEditWizard();
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
    const code = encodeTripleProfile({ natural: naturalProfile, working: workingProfile, recommended: wizardRecommended });
    const url = new URL(window.location.href);
    url.searchParams.set("code", code);
    try {
      await navigator.clipboard.writeText(url.toString());
      setShareStatus("Copied!");
    } catch {
      window.history.replaceState({}, "", url);
      setShareStatus("In URL");
    }
    window.setTimeout(() => setShareStatus("Share"), 1800);
  };

  const saveSnapshot = () => {
    const label = snapshotLabel.trim();
    if (!label) return;
    setSnapshots((current) => [
      ...current,
      {
        id: uid(),
        label,
        profile: { ...workingProfile },
        createdAt: new Date().toISOString(),
      },
    ]);
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
    if (!journalForm.situation.trim()) return;
    const outcomeLabel =
      journalForm.outcome === "worked" ? "Worked well"
      : journalForm.outcome === "mixed" ? "Mixed result"
      : journalForm.outcome === "didnt-work" ? "Didn't work"
      : "";
    setJournal((current) => [
      {
        id: uid(),
        createdAt: new Date().toISOString(),
        situation: journalForm.situation.trim(),
        chosenStyle: outcomeLabel,
        intendedOutcome: "",
        actualOutcome: "",
        reflection: journalForm.reflection.trim(),
        profile: { ...workingProfile },
      },
      ...current,
    ]);
    setJournalForm({ situation: "", outcome: "", reflection: "" });
    void trackEvent("journal_entry_saved", {
      hasChosenStyle: Boolean(outcomeLabel),
      hasActualOutcome: false,
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
    setSimReflection("");
    setSimCommitment("");
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

  const getSimDebriefInsight = (scores: typeof simulatorScores): string => {
    if (scores.trust > 65 && scores.accountability > 65)
      return "Your choices balanced accountability with psychological safety — a sustainable pattern.";
    if (scores.clarity > 70 && scores.trust < 50)
      return "You prioritized clarity, but at some cost to trust. Common in directive styles — watch the long-term impact.";
    if (scores.delivery > 65 && scores.accountability < 50)
      return "You drove results but with limited ownership transfer. The team may depend on you more than intended.";
    if (scores.trust > 70 && scores.delivery < 50)
      return "You protected the relationship but may have under-indexed on output. Check whether the team feels accountable.";
    return "Your choices show a mixed pattern — the trade-offs above reveal where you prioritized.";
  };

  const saveSimToJournal = () => {
    if (!simCommitment.trim() && !simReflection.trim()) return;
    setJournal((current) => [
      {
        id: uid(),
        createdAt: new Date().toISOString(),
        situation: `Simulation: ${simulator.title}`,
        chosenStyle: getSimDebriefInsight(simulatorScores),
        intendedOutcome: simCommitment.trim() || "—",
        actualOutcome: "",
        reflection: simReflection.trim(),
        profile: { ...workingProfile },
      },
      ...current,
    ]);
    void trackEvent("sim_debrief_saved", { scenarioId: simulator.id });
    changeTab("reflect");
  };

  // Find next scenario id for "Try another" button
  const nextScenarioId = (() => {
    const idx = SIMULATOR_SCENARIOS.findIndex((s) => s.id === simulatorId);
    return SIMULATOR_SCENARIOS[(idx + 1) % SIMULATOR_SCENARIOS.length].id;
  })();

  const baselineDone = answeredAssessmentCount >= 3;
  const practiceDone = simulatorComplete;
  const reflectDone = journal.length > 0;

  if (!hydrated) return null;
  if (visitState === "gate") {
    const isExperiencedFlow = showTemplateSelection || experiencedCode || codeError;
    if (showTemplateSelection) {
      return (
        <OnboardingGate
          onNew={() => setVisitState("wizard")}
          onExperienced={handleExperienced}
          onWizard={() => { setShowTemplateSelection(false); setExperiencedCode(""); setCodeError(""); }}
          onExplore={() => { window.localStorage.setItem("leadshift:visited", "1"); setVisitState("app"); }}
          showTemplateSelection
          templates={TEMPLATES.map((t) => ({ id: t.id, name: t.name, description: t.description }))}
          onTemplateSelect={handleTemplateSelect}
          darkMode={darkMode}
        />
      );
    }
    return (
      <OnboardingGate
        onNew={() => setVisitState("wizard")}
        onExperienced={handleExperienced}
        onWizard={() => { setShowTemplateSelection(false); setExperiencedCode(""); setCodeError(""); }}
        onExplore={() => { window.localStorage.setItem("leadshift:visited", "1"); setVisitState("app"); }}
        showCodeInput
        codeValue={experiencedCode}
        onCodeChange={setExperiencedCode}
        codeError={codeError}
        darkMode={darkMode}
      />
    );
  }
  if (visitState === "wizard") {
    return <WizardFlow onComplete={handleWizardComplete} darkMode={darkMode} />;
  }

  return (
    <div className="app-shell" data-theme={darkMode ? "dark" : "light"}>
      <header className="topbar">
        <a href="#top" className="brand" aria-label="LeadShift home">
          <span className="brand__mark">LS</span>
          <span><strong>LeadShift</strong><small>Adaptive management laboratory</small></span>
        </a>
        <div className="topbar__actions">
          <button className="button button--ghost theme-toggle" onClick={() => setDarkMode((d) => !d)} aria-label="Toggle dark mode">
            {darkMode ? "☀ Light" : "☾ Dark"}
          </button>
          <button className="button button--ghost" onClick={resetSession}>Reset</button>
          <button className="button button--primary" onClick={shareProfile}>{shareStatus}</button>
        </div>
      </header>

      <a href="#main-content" className="skip-link" onClick={(e) => { e.preventDefault(); document.getElementById("main-content")?.focus(); }}>Skip to main content</a>

      <main id="main-content" tabIndex={-1} className="product-main">
        <nav className="product-tabs" role="tablist" aria-label="LeadShift sections">
          {TABS.map(([id, label], index) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeTab === id}
              aria-controls={`panel-${id}`}
              aria-current={activeTab === id ? "page" : undefined}
              id={`tab-${id}`}
              className={activeTab === id ? "product-tab product-tab--active" : "product-tab"}
              onClick={() => changeTab(id)}
              tabIndex={activeTab === id ? 0 : -1}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="journey-bar">
          {[
            { label: "Baseline", done: baselineDone, tab: "practice" as TabId },
            { label: "Practice", done: practiceDone, tab: "practice" as TabId },
            { label: "Reflect", done: reflectDone, tab: "reflect" as TabId },
          ].map((step, i) => (
            <div key={step.label} className={`journey-step${step.done ? " journey-step--done" : ""}`}>
              <span className="journey-dot">{step.done ? "✓" : i + 1}</span>
              <span>{step.label}</span>
            </div>
          ))}
        </div>

        {/* ── PRACTICE TAB ── */}
        {activeTab === "practice" && (
          <section id="panel-practice" role="tabpanel" aria-labelledby="tab-practice" className="tab-stack">
            <div className="simulator-layout">
              <article className="panel">
                <label className="full-field"><span>Scenario</span>
                  <select value={simulatorId} onChange={(event) => resetSimulator(event.target.value)}>
                    {SIMULATOR_SCENARIOS.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.title}</option>)}
                  </select>
                </label>
                <div className="situation-intro"><strong>{simulator.title}</strong><p>{simulator.description}</p></div>

                {simulatorComplete ? (
                  <div className="debrief-panel">
                    <h2>Debrief</h2>

                    <div className="debrief-scores">
                      {Object.entries(simulatorScores).map(([key, value]) => (
                        <div className={`debrief-score debrief-score--${value >= 65 ? "good" : value >= 45 ? "mid" : "low"}`} key={key}>
                          <strong>{value}</strong>
                          <span>{key}</span>
                        </div>
                      ))}
                    </div>

                    <div className="debrief-insight">{getSimDebriefInsight(simulatorScores)}</div>

                    <div className="debrief-fields">
                      <label className="full-field">
                        <span>What would you do differently?</span>
                        <textarea
                          value={simReflection}
                          onChange={(e) => setSimReflection(e.target.value)}
                          placeholder="The moments where the metrics moved most..."
                          rows={2}
                        />
                      </label>
                      <div>
                        <span className="full-field" style={{ display: "block", marginBottom: 8, color: "rgba(255,255,255,0.55)", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.03em", textTransform: "uppercase" }}>This week I'll...</span>
                        <div className="commitment-chips">
                          {COMMITMENT_CHIPS.map((chip) => (
                            <button
                              key={chip}
                              className={`commitment-chip${simCommitment === chip ? " commitment-chip--active" : ""}`}
                              onClick={() => setSimCommitment((prev) => prev === chip ? "" : chip)}
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="debrief-actions">
                      <button
                        className="button button--primary"
                        onClick={saveSimToJournal}
                        disabled={!simCommitment.trim() && !simReflection.trim()}
                      >
                        Save to journal
                      </button>
                      <button className="button button--ghost" onClick={() => resetSimulator()}>Replay</button>
                      <button className="button button--ghost" onClick={() => resetSimulator(nextScenarioId)}>Next scenario</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {simulatorResponse && (
                      <div className="simulator-response"><span>What happened</span><p>{simulatorResponse}</p></div>
                    )}
                    {simulatorNode && (
                      <>
                        <h3 className="simulator-prompt">{simulatorNode.prompt}</h3>
                        <div className="simulator-choices">
                          {simulatorNode.choices.map((choice) => (
                            <button key={choice.id} onClick={() => chooseSimulatorOption(choice)}>{choice.label}</button>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </article>

              <aside className="panel outcome-panel">
                <div className="panel__heading"><div><span className="section-kicker">Simulated effects</span><h2>Team system</h2></div></div>
                {Object.entries(simulatorScores).map(([key, value]) => (
                  <div className="outcome-meter" key={key}>
                    <div><span>{key}</span><strong>{value}</strong></div>
                    <div><i className={value >= 65 ? "" : value >= 45 ? "mid" : "low"} style={{ width: `${value}%` }} /></div>
                  </div>
                ))}
                <div className="insight-card"><strong>Interpretation</strong><p>Clarity and delivery can rise while trust and accountability fall. The simulator makes those trade-offs visible instead of rewarding only immediate output.</p></div>
              </aside>
            </div>

            {/* Assessment-first gateway: show wizard hero if baseline not done */}
            {!baselineDone && (
              <div className="journey-gateway">
                <div className="journey-gateway__text">
                  <span className="section-kicker">Step 1 of 3</span>
                  <h2>Discover your baseline style</h2>
                  <p>Six scenarios. Choose what you'd genuinely do first — not the theoretically correct answer. Takes about 2 minutes.</p>
                </div>
                <button className="button button--primary button--wide" onClick={() => setVisitState("wizard")}>
                  Start baseline assessment
                </button>
              </div>
            )}

            {baselineDone && (
              <div className="baseline-set-banner">
                <span>✓ Baseline set</span>
                <button className="text-button" onClick={() => setVisitState("wizard")}>Redo assessment</button>
              </div>
            )}

            {simulatorComplete && (
              <div className="next-step-card">
                <div>
                  <strong>Scenario complete</strong>
                  <p>Save your reflection above, then log how you apply this in a real situation.</p>
                </div>
                <button className="button button--ghost" onClick={() => changeTab("reflect")}>
                  Go to Reflect →
                </button>
              </div>
            )}
          </section>
        )}

        {/* ── MY STYLE TAB ── */}
        {activeTab === "style" && (
          <section id="panel-style" role="tabpanel" aria-labelledby="tab-style" className="tab-stack">
            <StylesPage
              natural={naturalProfile}
              working={workingProfile}
              recommended={wizardRecommended}
              onEditNatural={() => setEditingPhase("natural")}
              onEditWorking={() => setEditingPhase("working")}
              onEditRecommended={() => setEditingPhase("recommended")}
              onGoToPractice={() => changeTab("practice")}
              onGoToJourney={() => changeTab("journey")}
              onGoToReflect={() => changeTab("reflect")}
              onShare={() => shareProfile()}
              darkMode={darkMode}
            />
          </section>
        )}

        {/* ── JOURNEY TAB ── */}
        {activeTab === "journey" && (
          <section id="panel-journey" role="tabpanel" aria-labelledby="tab-journey" className="tab-stack tab-stack--compact journey-tab">

            {/* Track picker */}
            {!trackProgress && (
              <>
                <div className="reflect-hero">
                  <span className="section-kicker">Plan your arc</span>
                  <h2>Choose a track</h2>
                  <p>Each track is a proven management progression. Pick the one that fits your current situation.</p>
                </div>
                <div className="track-grid">
                  {STYLE_TRACKS.map((track) => (
                    <button
                      key={track.id}
                      className="track-card"
                      style={{ "--track-color": track.color } as React.CSSProperties}
                      onClick={() => setTrackProgress({ trackId: track.id, startDate: new Date().toISOString().slice(0, 10) })}
                    >
                      <span className="track-card__label">Track</span>
                      <strong>{track.name}</strong>
                      <p>{track.description}</p>
                      <span className="track-card__outcome">↗ {track.outcome}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Active track view */}
            {trackProgress && (() => {
              const track = STYLE_TRACKS.find((t) => t.id === trackProgress.trackId) ?? STYLE_TRACKS[0];
              const startDate = new Date(trackProgress.startDate);
              const now = new Date();
              const { milestone: currentMilestone, index: currentIndex } = getMilestoneForDate(track, startDate, now);
              const displayIndex = selectedMilestoneIndex ?? currentIndex;
              const displayMilestone = track.milestones[displayIndex];
              const nextMilestone = track.milestones[displayIndex + 1] ?? null;
              const daysUntilNext = getDaysUntilNext(track, startDate, now);
              const daysElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
              const isViewingCurrent = displayIndex === currentIndex;

              return (
                <>
                  {/* Track header */}
                  <div className="track-header" style={{ "--track-color": track.color } as React.CSSProperties}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                        <span className="section-kicker" style={{ color: track.color }}>{track.name}</span>
                        <button className="track-switch-btn" onClick={() => setTrackProgress(null)}>Change track</button>
                      </div>
                      <h2>{currentMilestone.focus}</h2>
                      <p>{currentMilestone.summary}</p>
                    </div>
                    <div className="track-header__meta">
                      <div className="track-meta-stat">
                        <strong>{daysElapsed}</strong>
                        <span>days in</span>
                      </div>
                      {daysUntilNext !== null && (
                        <div className="track-meta-stat">
                          <strong>{daysUntilNext}</strong>
                          <span>days to next phase</span>
                        </div>
                      )}
                      <div>
                        <label className="full-field" style={{ margin: 0 }}>
                          <span>Start date</span>
                          <input
                            type="date"
                            value={trackProgress.startDate}
                            onChange={(e) => setTrackProgress({ ...trackProgress, startDate: e.target.value })}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Interactive timeline */}
                  <div className="track-timeline">
                    {track.milestones.map((milestone, index) => {
                      const isPast = index < currentIndex;
                      const isCurrent = index === currentIndex;
                      const isFuture = index > currentIndex;
                      const isSelected = index === displayIndex;
                      return (
                        <button
                          key={milestone.label}
                          className={[
                            "track-node",
                            isCurrent ? "track-node--current" : "",
                            isPast ? "track-node--past" : "",
                            isFuture ? "track-node--future" : "",
                            isSelected ? "track-node--selected" : "",
                          ].filter(Boolean).join(" ")}
                          style={{ "--track-color": track.color } as React.CSSProperties}
                          onClick={() => setSelectedMilestoneIndex(index)}
                          aria-pressed={isSelected}
                        >
                          <div className="track-node__dot" />
                          <span className="track-node__label">{milestone.label}</span>
                          <span className="track-node__focus">{milestone.focus}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Evolution radar */}
                  <TrackEvolutionRadar
                    milestones={track.milestones}
                    selectedIndex={displayIndex}
                    currentIndex={currentIndex}
                    color={track.color}
                  />

                  {/* Selected phase detail */}
                  <div className="two-column-layout">
                    <article className="panel">
                      <div className="panel__heading">
                        <div>
                          <span className="section-kicker" style={{ color: track.color }}>
                            {isViewingCurrent ? `Now — ${displayMilestone.label}` : displayMilestone.label}
                          </span>
                          <h2>{displayMilestone.focus}</h2>
                        </div>
                      </div>
                      <div className="track-transitions">
                        {displayMilestone.transitions.map((t) => (
                          <div className="track-transition-item" key={t.head}>
                            <span>→</span>
                            <div>
                              <strong className="track-transition-item__head">{t.head}</strong>
                              <p className="track-transition-item__detail">{t.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {nextMilestone && displayMilestone.phaseShift && (
                        <div className="phase-shift">
                          <span className="section-kicker">Preparing to shift — {displayMilestone.phaseShift.headline}</span>
                          <div className="phase-shift__signals">
                            {displayMilestone.phaseShift.readyWhen.map((s) => (
                              <div className="phase-shift__signal" key={s}>
                                <span>✓</span>
                                <p>{s}</p>
                              </div>
                            ))}
                          </div>
                          <div className="phase-shift__watchout">
                            <span>⚠</span>
                            <p>{displayMilestone.phaseShift.watchOut}</p>
                          </div>
                        </div>
                      )}
                      <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button
                          className="button button--primary"
                          onClick={() => applyWorkingProfile(displayMilestone.profile, `track:${track.id}:${displayMilestone.label}`)}
                        >
                          Apply phase profile
                        </button>
                        {!isViewingCurrent && (
                          <button className="button button--ghost" onClick={() => setSelectedMilestoneIndex(currentIndex)}>
                            Back to now
                          </button>
                        )}
                      </div>
                    </article>

                    <div className="stacked-column">
                      <article className="panel">
                        <div className="panel__heading">
                          <div>
                            <span className="section-kicker">Your style vs. {displayMilestone.label} target</span>
                            <h2>Style gap</h2>
                          </div>
                        </div>
                        <RadarChart
                          profile={workingProfile}
                          comparison={displayMilestone.profile}
                          activeDimension={activeDimension}
                        />
                        <div className="radar__legend" style={{ marginTop: 8 }} aria-hidden="true">
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.66rem", color: "var(--ink-faint)" }}>
                            <i className="legend-dot legend-dot--current" />Your current style
                          </span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.66rem", color: "var(--ink-faint)" }}>
                            <i className="legend-dot legend-dot--ideal" />{displayMilestone.label} target
                          </span>
                        </div>
                      </article>
                    </div>
                  </div>

                  {/* All milestones overview */}
                  <div className="section-heading-slim"><h2>Full arc</h2></div>
                  <div className="milestone-grid">
                    {track.milestones.map((milestone, index) => {
                      const isCurrent = index === currentIndex;
                      const isPast = index < currentIndex;
                      return (
                        <article
                          key={milestone.label}
                          className={`milestone-card${isCurrent ? " milestone-card--current" : ""}${isPast ? " milestone-card--past" : ""}`}
                          style={{ "--track-color": track.color } as React.CSSProperties}
                        >
                          <div className="milestone-card__head">
                            <span className="milestone-card__label">{milestone.label}</span>
                            {isCurrent && <span className="milestone-card__now">Now</span>}
                            {isPast && <span className="milestone-card__done">✓</span>}
                          </div>
                          <strong>{milestone.focus}</strong>
                          <p>{milestone.summary}</p>
                          <button
                            className="text-button"
                            onClick={() => applyWorkingProfile(milestone.profile, `track:${track.id}:${milestone.label}`)}
                          >
                            Apply profile
                          </button>
                        </article>
                      );
                    })}
                  </div>

                  {/* Track successors */}
                  {track.successors.length > 0 && (
                    <>
                      <div className="section-heading-slim"><h2>Where next?</h2></div>
                      <div className="successor-grid">
                        {track.successors.map((succ) => {
                          const succTrack = STYLE_TRACKS.find((t) => t.id === succ.trackId);
                          if (!succTrack) return null;
                          return (
                            <article
                              key={succ.trackId}
                              className="successor-card"
                              style={{ "--track-color": succTrack.color } as React.CSSProperties}
                            >
                              <span className="successor-card__trigger">{succ.trigger}</span>
                              <strong className="successor-card__headline">{succ.headline}</strong>
                              <p className="successor-card__bridge">{succ.bridge}</p>
                              <button
                                className="button button--ghost"
                                onClick={() => setTrackProgress({ trackId: succ.trackId, startDate: new Date().toISOString().slice(0, 10) })}
                              >
                                Start {succTrack.name} track →
                              </button>
                            </article>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              );
            })()}
          </section>
        )}

        {/* ── ARCHETYPES TAB ── */}
        {activeTab === "archetypes" && (
          <section id="panel-archetypes" role="tabpanel" aria-labelledby="tab-archetypes" className="tab-stack tab-stack--compact">
            <ArchetypesPage darkMode={darkMode} />
          </section>
        )}

        {/* ── REFLECT TAB ── */}
        {activeTab === "reflect" && (
          <section id="panel-reflect" role="tabpanel" aria-labelledby="tab-reflect" className="tab-stack">

            {/* Decision Journal — primary action */}
            <div className="reflect-section">
              <div className="reflect-hero">
                <span className="section-kicker">Step 3 of 3</span>
                <h2>Log a real decision</h2>
                <p>Close the loop: what did you try, and what happened?</p>
              </div>
              <div className="section-heading-slim">
                <h2 className="reflect-section-heading">Decision Journal</h2>
                <span className="count-badge">{journal.length} decisions</span>
              </div>
              <div className="two-column-layout">
                <article className="panel journal-form">
                  <div className="journal-quick-form">
                    <div>
                      <span style={{ display: "block", marginBottom: 8, color: "var(--ink-soft)", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.03em", textTransform: "uppercase" }}>What happened?</span>
                      <div className="situation-chips">
                        {JOURNAL_SITUATIONS.map((s) => (
                          <button
                            key={s}
                            className={`situation-chip${journalForm.situation === s ? " situation-chip--active" : ""}`}
                            onClick={() => setJournalForm((f) => ({ ...f, situation: f.situation === s ? "" : s }))}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span style={{ display: "block", marginBottom: 8, color: "var(--ink-soft)", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.03em", textTransform: "uppercase" }}>How did it go?</span>
                      <div className="outcome-selector">
                        {[
                          { id: "worked", icon: "↑", label: "Worked" },
                          { id: "mixed", icon: "→", label: "Mixed" },
                          { id: "didnt-work", icon: "↓", label: "Didn't work" },
                        ].map(({ id, icon, label }) => (
                          <button
                            key={id}
                            className={`outcome-btn outcome-btn--${id}${journalForm.outcome === id ? " outcome-btn--selected" : ""}`}
                            onClick={() => setJournalForm((f) => ({ ...f, outcome: f.outcome === id ? "" : id }))}
                          >
                            <span>{icon}</span>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <label className="full-field" style={{ margin: 0 }}>
                      <span>What would you change? (optional)</span>
                      <textarea
                        value={journalForm.reflection}
                        onChange={(e) => setJournalForm((f) => ({ ...f, reflection: e.target.value }))}
                        placeholder="One thing to try differently next time."
                        rows={2}
                      />
                    </label>
                    <button className="button button--primary" onClick={addJournalEntry} disabled={!journalForm.situation.trim()}>Log it</button>
                  </div>
                </article>
                <div className="journal-list">
                  {journal.length ? journal.map((entry) => (
                    <article className="panel journal-entry" key={entry.id}>
                      <div className="timeline-item__head">
                        <div><span>{formatDate(entry.createdAt)}</span><h3>{entry.situation}</h3></div>
                        <button className="text-button text-button--danger" onClick={() => setJournal((current) => current.filter((item) => item.id !== entry.id))}>Delete</button>
                      </div>
                      {entry.chosenStyle && <p><strong>{entry.chosenStyle}</strong></p>}
                      {entry.reflection && <p style={{ color: "var(--ink-soft)" }}>{entry.reflection}</p>}
                    </article>
                  )) : <EmptyState title="No decisions recorded" body="Tap a situation above and log what happened." />}
                </div>
              </div>
            </div>

            {journal.length > 0 && (
              <div className="next-step-card next-step-card--complete">
                <span>✓ Loop complete</span>
                <p>Practice another scenario to keep building.</p>
                <button className="button button--ghost" onClick={() => changeTab("practice")}>Back to Practice →</button>
              </div>
            )}

            <div className="reflect-divider" />

            {/* History */}
            <div className="reflect-section">
              <h2 className="reflect-section-heading">History</h2>
              <div className="two-column-layout">
                <article className="panel">
                  <div className="quick-labels">
                    {["Before joining the team", "After 30 days", "During a crisis", "After team feedback"].map((label) => (
                      <button className="preset-chip" key={label} onClick={() => setSnapshotLabel(label)}>{label}</button>
                    ))}
                  </div>
                  <label className="full-field"><span>Snapshot label</span><input value={snapshotLabel} onChange={(event) => setSnapshotLabel(event.target.value)} /></label>
                  <button className="button button--primary" onClick={saveSnapshot}>Record snapshot</button>
                  <ProfileSummary label="Will be recorded" title={snapshotLabel || "Current style"} profile={workingProfile} />
                </article>
                <div className="timeline">
                  {snapshots.length ? [...snapshots].reverse().map((snapshot, index) => (
                    <article className="timeline-item" key={snapshot.id}>
                      <span className="timeline-dot" />
                      <div className="panel">
                        <div className="timeline-item__head">
                          <div><span>{formatDate(snapshot.createdAt)}</span><h3>{snapshot.label}</h3></div>
                          <button className="text-button text-button--danger" onClick={() => setSnapshots((current) => current.filter((item) => item.id !== snapshot.id))}>Delete</button>
                        </div>
                        {snapshot.note && <p>{snapshot.note}</p>}
                        {index < snapshots.length - 1 && (
                          <small>Compared with the previous recorded point, review the largest movements in the radar shape rather than treating any direction as universally better.</small>
                        )}
                      </div>
                    </article>
                  )) : <EmptyState title="No snapshots yet" body="Record your style at meaningful moments to track how it evolves." />}
                </div>
              </div>
            </div>

            <div className="reflect-divider" />

            {/* Team Perception */}
            <div className="reflect-section">
              <details className="team-disclosure">
                <summary>
                  <span>Team Perception <span className="count-badge" style={{ marginLeft: 8 }}>{perceptions.length} responses</span></span>
                  <span style={{ fontSize: "0.75rem", color: "var(--ink-soft)" }}>▼</span>
                </summary>
                <div className="team-disclosure-body">
                  <div className="two-column-layout">
                    <article className="panel">
                      <div className="panel__heading"><div><h2>How does this manager feel in practice?</h2></div></div>
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
                            <div className="panel__heading"><div><h2>Where intent and experience differ</h2></div></div>
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
                      ) : <EmptyState title="No team responses yet" body="Add at least one response to compare." />}
                    </div>
                  </div>
                </div>
              </details>
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
        <button className="text-button" onClick={reopenAnalyticsChoice}>Analytics {analyticsPreference === "accepted" ? "on" : "off"}</button>
      </footer>

      {/* ── Edit wizard overlay ── */}
      {editingPhase && (
        <div className="wizard-overlay" data-theme={darkMode ? "dark" : "light"}>
          <div className="wizard-overlay__header">
            <h3 className="wizard-overlay__title">
              {editingPhase === "natural" ? "Edit Natural Default" : editingPhase === "working" ? "Edit Working Mode" : "Edit Recommended"}
            </h3>
            <button className="wizard-overlay__close" onClick={closeEditWizard}>Close</button>
          </div>
          <div className="wizard-overlay__body">
            {editingPhase === "natural" && (
              <WizardNaturalPhase
                initialProfile={{ ...naturalProfile }}
                onComplete={handleEditNaturalComplete}
                darkMode={darkMode}
              />
            )}
            {editingPhase === "working" && (
              <WizardWorkingPhase
                naturalProfile={naturalProfile}
                initialWorking={workingProfile}
                onComplete={handleEditWorkingComplete}
                darkMode={darkMode}
              />
            )}
            {editingPhase === "recommended" && (
              <WizardContextPhase
                naturalProfile={naturalProfile}
                workingProfile={workingProfile}
                onComplete={handleEditRecommendedComplete}
                darkMode={darkMode}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
