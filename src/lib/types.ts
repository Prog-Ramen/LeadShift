export const DIMENSION_KEYS = [
  "focus",
  "authority",
  "care",
  "challenge",
  "visibility",
  "posture",
  "change",
  "risk",
  "operatingMode",
  "decisionStyle",
] as const;

export type DimensionKey = (typeof DIMENSION_KEYS)[number];
export type ManagementProfile = Record<DimensionKey, number>;

export type SituationCategory =
  | "People development"
  | "Team health"
  | "Delivery"
  | "Crisis and risk"
  | "Innovation and change"
  | "Team context";

export interface DimensionDefinition {
  key: DimensionKey;
  name: string;
  shortName: string;
  lowLabel: string;
  highLabel: string;
  description: string;
  lowMeaning: string;
  highMeaning: string;
}

export interface Archetype {
  code: string;
  name: string;
  description: string;
  strengths: string[];
  watchouts: string[];
  center: Pick<ManagementProfile, "focus" | "authority" | "operatingMode" | "change">;
}

export interface Situation {
  id: string;
  title: string;
  category: SituationCategory;
  summary: string;
  ideal: ManagementProfile;
  weights: Partial<Record<DimensionKey, number>>;
  recommendedActions: string[];
  warning: string;
}

export interface FitPenalty {
  id: string;
  points: number;
  message: string;
}

export interface SituationScore {
  rawScore: number;
  score: number;
  penalties: FitPenalty[];
}

export interface ProfileWarning {
  id: string;
  title: string;
  body: string;
  severity: "note" | "watch";
}

export type ProfileKind = "natural" | "working" | "recommended" | "context";

export interface SavedMode {
  id: string;
  name: string;
  profile: ManagementProfile;
  createdAt: string;
  kind?: ProfileKind;
  context?: string;
}

export const CONTEXT_KEYS = [
  "experience",
  "confidence",
  "trust",
  "urgency",
  "failureConsequence",
  "uncertainty",
  "reversibility",
  "innovation",
] as const;

export type ContextKey = (typeof CONTEXT_KEYS)[number];
export type SituationContext = Record<ContextKey, number>;

export interface ContextDefinition {
  key: ContextKey;
  name: string;
  lowLabel: string;
  highLabel: string;
  description: string;
}

export interface AssessmentOption {
  id: string;
  label: string;
  rationale: string;
  effects: Partial<Record<DimensionKey, number>>;
}

export interface AssessmentScenario {
  id: string;
  title: string;
  prompt: string;
  options: AssessmentOption[];
}

export interface StyleSnapshot {
  id: string;
  label: string;
  profile: ManagementProfile;
  createdAt: string;
  note?: string;
}

export interface TeamPerceptionResponse {
  id: string;
  relationship: string;
  profile: ManagementProfile;
  createdAt: string;
}

export interface ContextProfile {
  id: string;
  name: string;
  description: string;
  profile: ManagementProfile;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  createdAt: string;
  situation: string;
  chosenStyle: string;
  intendedOutcome: string;
  actualOutcome: string;
  reflection: string;
  profile: ManagementProfile;
}

export interface SimulatorChoice {
  id: string;
  label: string;
  response: string;
  effects: {
    trust: number;
    clarity: number;
    accountability: number;
    delivery: number;
  };
  nextNodeId?: string;
}

export interface SimulatorNode {
  id: string;
  prompt: string;
  choices: SimulatorChoice[];
}

export interface SimulatorScenario {
  id: string;
  title: string;
  description: string;
  startNodeId: string;
  nodes: SimulatorNode[];
}
