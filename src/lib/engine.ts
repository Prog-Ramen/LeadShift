import { ARCHETYPES } from "@/data/archetypes";
import { DIMENSIONS } from "@/data/dimensions";
import type {
  Archetype,
  DimensionKey,
  FitPenalty,
  ManagementProfile,
  ProfileWarning,
  Situation,
  SituationScore,
} from "@/lib/types";
import { DIMENSION_KEYS } from "@/lib/types";

export const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));

export const getArchetypeCode = (profile: ManagementProfile) =>
  `${profile.focus < 50 ? "H" : "R"}${
    profile.authority < 50 ? "A" : "D"
  }${profile.operatingMode < 50 ? "S" : "E"}${
    profile.change < 50 ? "I" : "T"
  }`;

export interface ArchetypeMatch {
  archetype: Archetype;
  confidence: number;
  distance: number;
}

export const getArchetypeMatches = (
  profile: ManagementProfile,
): ArchetypeMatch[] => {
  return ARCHETYPES.map((archetype) => {
    const keys = ["focus", "authority", "operatingMode", "change"] as const;
    const squaredDistance = keys.reduce((total, key) => {
      const delta = profile[key] - archetype.center[key];
      return total + delta * delta;
    }, 0);
    const distance = Math.sqrt(squaredDistance / keys.length);
    const confidence = Math.round(clamp(100 - (distance / 75) * 100));

    return { archetype, confidence, distance };
  }).sort((a, b) => a.distance - b.distance);
};

const buildInteractionPenalties = (
  profile: ManagementProfile,
): FitPenalty[] => {
  const penalties: FitPenalty[] = [];

  if (profile.challenge >= 72 && profile.care <= 38) {
    penalties.push({
      id: "cold-candour",
      points: 7,
      message: "Direct challenge may land as aggression because visible care is low.",
    });
  }

  if (profile.care >= 76 && profile.challenge <= 34) {
    penalties.push({
      id: "support-without-accountability",
      points: 7,
      message: "Strong support may avoid the accountability needed to change performance.",
    });
  }

  if (profile.authority <= 28 && profile.visibility <= 38) {
    penalties.push({
      id: "autonomy-without-context",
      points: 6,
      message: "Broad autonomy without enough context can feel like abandonment.",
    });
  }

  if (profile.operatingMode >= 72 && profile.risk <= 28) {
    penalties.push({
      id: "innovation-under-lock",
      points: 6,
      message: "High exploration and strong failure prevention can pull the team in opposite directions.",
    });
  }

  if (profile.posture >= 72 && profile.decisionStyle >= 76) {
    penalties.push({
      id: "command-participation-conflict",
      points: 5,
      message: "Commanding execution and highly shared decisions may leave authority unclear.",
    });
  }

  if (profile.change >= 78 && profile.operatingMode <= 24) {
    penalties.push({
      id: "transformation-stability-conflict",
      points: 5,
      message: "A major transformation will struggle if the operating system is optimized only for stability.",
    });
  }

  return penalties;
};

export const scoreSituation = (
  profile: ManagementProfile,
  situation: Situation,
): SituationScore => {
  let weightedSquaredDistance = 0;
  let weightTotal = 0;

  for (const key of DIMENSION_KEYS) {
    const weight = situation.weights[key] ?? 1;
    const delta = profile[key] - situation.ideal[key];
    weightedSquaredDistance += weight * delta * delta;
    weightTotal += weight;
  }

  const rmsDistance = Math.sqrt(weightedSquaredDistance / weightTotal);
  const rawScore = clamp(100 - rmsDistance);
  const penalties = buildInteractionPenalties(profile);
  const penaltyPoints = penalties.reduce((total, penalty) => total + penalty.points, 0);

  return {
    rawScore: Math.round(rawScore),
    score: Math.round(clamp(rawScore - penaltyPoints)),
    penalties,
  };
};

export const rankSituations = (
  profile: ManagementProfile,
  situations: Situation[],
) =>
  situations
    .map((situation) => ({
      situation,
      ...scoreSituation(profile, situation),
    }))
    .sort((a, b) => b.score - a.score);

export interface AdjustmentRecommendation {
  key: DimensionKey;
  dimensionName: string;
  direction: "increase" | "decrease";
  targetLabel: string;
  delta: number;
  priority: number;
  text: string;
}

const movementWord = (absoluteDelta: number) => {
  if (absoluteDelta >= 45) return "substantially";
  if (absoluteDelta >= 25) return "meaningfully";
  return "slightly";
};

export const getAdjustmentRecommendations = (
  profile: ManagementProfile,
  situation: Situation,
  limit = 3,
): AdjustmentRecommendation[] => {
  return DIMENSIONS.map((dimension) => {
    const delta = situation.ideal[dimension.key] - profile[dimension.key];
    const direction = delta >= 0 ? "increase" : "decrease";
    const targetLabel = delta >= 0 ? dimension.highLabel : dimension.lowLabel;
    const priority = Math.abs(delta) * (situation.weights[dimension.key] ?? 1);

    return {
      key: dimension.key,
      dimensionName: dimension.shortName,
      direction,
      targetLabel,
      delta,
      priority,
      text: `${movementWord(Math.abs(delta))} toward ${targetLabel.toLowerCase()}`,
    } as AdjustmentRecommendation;
  })
    .filter((recommendation) => Math.abs(recommendation.delta) >= 8)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
};

export interface MarginalImpact {
  key: DimensionKey;
  dimensionName: string;
  lowLabel: string;
  highLabel: string;
  currentScore: number;
  lowerScore: number;
  higherScore: number;
  lowerImpact: number;
  higherImpact: number;
  bestDirection: "lower" | "higher" | "hold";
  bestImpact: number;
}

export const getMarginalImpacts = (
  profile: ManagementProfile,
  situation: Situation,
  step = 10,
): MarginalImpact[] => {
  const currentScore = scoreSituation(profile, situation).score;

  return DIMENSIONS.map((dimension) => {
    const lowerProfile = {
      ...profile,
      [dimension.key]: clamp(profile[dimension.key] - step),
    };
    const higherProfile = {
      ...profile,
      [dimension.key]: clamp(profile[dimension.key] + step),
    };
    const lowerScore = scoreSituation(lowerProfile, situation).score;
    const higherScore = scoreSituation(higherProfile, situation).score;
    const lowerImpact = lowerScore - currentScore;
    const higherImpact = higherScore - currentScore;
    const bestImpact = Math.max(lowerImpact, higherImpact, 0);
    const bestDirection: MarginalImpact["bestDirection"] =
      bestImpact === 0
        ? "hold"
        : higherImpact >= lowerImpact
          ? "higher"
          : "lower";

    return {
      key: dimension.key,
      dimensionName: dimension.shortName,
      lowLabel: dimension.lowLabel,
      highLabel: dimension.highLabel,
      currentScore,
      lowerScore,
      higherScore,
      lowerImpact,
      higherImpact,
      bestDirection,
      bestImpact,
    };
  }).sort((a, b) => b.bestImpact - a.bestImpact);
};

export const getProfileWarnings = (
  profile: ManagementProfile,
): ProfileWarning[] => {
  const warnings: ProfileWarning[] = [];

  if (profile.challenge >= 72 && profile.care <= 38) {
    warnings.push({
      id: "cold-candour",
      title: "Candour without connection",
      body: "Your challenge is high while visible care is low. Feedback may be accurate but harder to hear or trust.",
      severity: "watch",
    });
  }

  if (profile.care >= 76 && profile.challenge <= 34) {
    warnings.push({
      id: "ruinous-empathy",
      title: "Support without accountability",
      body: "You may protect relationships by postponing direct feedback or difficult consequences.",
      severity: "watch",
    });
  }

  if (profile.authority <= 28 && profile.visibility <= 38) {
    warnings.push({
      id: "autonomy-without-context",
      title: "Autonomy without context",
      body: "People have freedom, but may lack enough reasoning, priorities, or boundaries to use it well.",
      severity: "watch",
    });
  }

  if (profile.operatingMode >= 72 && profile.risk <= 28) {
    warnings.push({
      id: "innovation-under-lock",
      title: "Innovation under lock and key",
      body: "The team is asked to explore while also avoiding failure. Small, reversible experiments could resolve the tension.",
      severity: "watch",
    });
  }

  if (profile.posture >= 75) {
    warnings.push({
      id: "command-fatigue",
      title: "Command fatigue",
      body: "This posture can be effective temporarily, but sustained use may reduce ownership and make you the bottleneck.",
      severity: "note",
    });
  }

  if (profile.visibility >= 90) {
    warnings.push({
      id: "unfiltered-transparency",
      title: "Filter for usefulness",
      body: "High transparency builds trust when information is actionable. Raw uncertainty can unintentionally transfer anxiety.",
      severity: "note",
    });
  }

  if (warnings.length === 0) {
    warnings.push({
      id: "balanced-combination",
      title: "No strong combination warning",
      body: "The current dials do not create an obvious internal contradiction. Situational fit still matters.",
      severity: "note",
    });
  }

  return warnings.slice(0, 3);
};

export const describeBand = (value: number) => {
  if (value <= 20) return "Strongly left";
  if (value <= 40) return "Leans left";
  if (value < 60) return "Balanced";
  if (value < 80) return "Leans right";
  return "Strongly right";
};
