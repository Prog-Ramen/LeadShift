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
  center: Pick<
    ManagementProfile,
    "focus" | "authority" | "operatingMode" | "change"
  >;
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

export interface SavedMode {
  id: string;
  name: string;
  profile: ManagementProfile;
  createdAt: string;
}
