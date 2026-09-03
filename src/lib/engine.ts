import { ARCHETYPES } from "@/data/archetypes";
import { DIMENSIONS } from "@/data/dimensions";
import type {
  Archetype,
  AssessmentScenario,
  ContextKey,
  DimensionKey,
  FitPenalty,
  JournalEntry,
  ManagementProfile,
  ProfileWarning,
  Situation,
  SituationContext,
  SituationScore,
  StyleSnapshot,
  TeamPerceptionResponse,
} from "@/lib/types";
import { DIMENSION_KEYS } from "@/lib/types";

export const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));

export const makeProfile = (value = 50): ManagementProfile =>
  DIMENSION_KEYS.reduce((profile, key) => {
    profile[key] = value;
    return profile;
  }, {} as ManagementProfile);

export const averageProfiles = (profiles: ManagementProfile[]): ManagementProfile => {
  if (!profiles.length) return makeProfile();
  return DIMENSION_KEYS.reduce((profile, key) => {
    profile[key] = Math.round(
      profiles.reduce((total, current) => total + current[key], 0) / profiles.length,
    );
    return profile;
  }, {} as ManagementProfile);
};

export const blendProfiles = (
  first: ManagementProfile,
  second: ManagementProfile,
  secondWeight = 0.5,
): ManagementProfile =>
  DIMENSION_KEYS.reduce((profile, key) => {
    profile[key] = Math.round(
      clamp(first[key] * (1 - secondWeight) + second[key] * secondWeight),
    );
    return profile;
  }, {} as ManagementProfile);

export const getArchetypeCode = (profile: ManagementProfile) => {
  const letter1 = profile.focus < 50 ? "H" : "R";
  const directiveness = (profile.authority + profile.posture + (100 - profile.decisionStyle)) / 3;
  const letter2 = directiveness < 50 ? "A" : "D";
  const letter3 = profile.care >= profile.challenge ? "N" : "C";
  const explorativeness = (profile.change + profile.risk + profile.operatingMode) / 3;
  const letter4 = explorativeness < 50 ? "S" : "X";
  return `${letter1}${letter2}${letter3}${letter4}`;
};

export interface ArchetypeMatch {
  archetype: Archetype;
  confidence: number;
  distance: number;
  reasons: string[];
}

export const getArchetypeMatches = (
  profile: ManagementProfile,
): ArchetypeMatch[] => {
  return ARCHETYPES.map((archetype) => {
    const keys = ["focus", "authority", "care", "challenge", "operatingMode", "change"] as const;
    const squaredDistance = keys.reduce((total, key) => {
      const delta = profile[key] - archetype.center[key];
      return total + delta * delta;
    }, 0);
    const distance = Math.sqrt(squaredDistance / keys.length);
    const confidence = Math.round(clamp(100 - (distance / 75) * 100));
    const reasons = keys
      .map((key) => {
        const dimension = DIMENSIONS.find((item) => item.key === key)!;
        const label = profile[key] < 50 ? dimension.lowLabel : dimension.highLabel;
        const strength = Math.abs(profile[key] - 50);
        return { text: `${label} (${Math.round(profile[key])})`, strength };
      })
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 2)
      .map((item) => item.text);

    return { archetype, confidence, distance, reasons };
  }).sort((a, b) => a.distance - b.distance);
};

const buildInteractionPenalties = (profile: ManagementProfile): FitPenalty[] => {
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

export const rankSituations = (profile: ManagementProfile, situations: Situation[]) =>
  situations
    .map((situation) => ({ situation, ...scoreSituation(profile, situation) }))
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
  situationOrProfile: Situation | ManagementProfile,
  limit = 3,
): AdjustmentRecommendation[] => {
  const target = "ideal" in situationOrProfile ? situationOrProfile.ideal : situationOrProfile;
  const weights = "weights" in situationOrProfile ? situationOrProfile.weights : {};

  return DIMENSIONS.map((dimension) => {
    const delta = target[dimension.key] - profile[dimension.key];
    const direction = delta >= 0 ? "increase" : "decrease";
    const targetLabel = delta >= 0 ? dimension.highLabel : dimension.lowLabel;
    const priority = Math.abs(delta) * (weights[dimension.key] ?? 1);

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
    const lowerProfile = { ...profile, [dimension.key]: clamp(profile[dimension.key] - step) };
    const higherProfile = { ...profile, [dimension.key]: clamp(profile[dimension.key] + step) };
    const lowerScore = scoreSituation(lowerProfile, situation).score;
    const higherScore = scoreSituation(higherProfile, situation).score;
    const lowerImpact = lowerScore - currentScore;
    const higherImpact = higherScore - currentScore;
    const bestImpact = Math.max(lowerImpact, higherImpact, 0);
    const bestDirection: MarginalImpact["bestDirection"] =
      bestImpact === 0 ? "hold" : higherImpact >= lowerImpact ? "higher" : "lower";

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

export const getProfileWarnings = (profile: ManagementProfile): ProfileWarning[] => {
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
  if (!warnings.length) {
    warnings.push({
      id: "balanced-combination",
      title: "No strong combination warning",
      body: "The current dials do not create an obvious internal contradiction. Situational fit still matters.",
      severity: "note",
    });
  }
  return warnings.slice(0, 3);
};

const contextTarget = (
  key: DimensionKey,
  context: SituationContext,
): number => {
  const normalized = (contextKey: ContextKey) => (context[contextKey] - 50) / 50;
  const experience = normalized("experience");
  const confidence = normalized("confidence");
  const trust = normalized("trust");
  const urgency = normalized("urgency");
  const consequence = normalized("failureConsequence");
  const uncertainty = normalized("uncertainty");
  const reversibility = normalized("reversibility");
  const innovation = normalized("innovation");

  const scores: Record<DimensionKey, number> = {
    focus: 50 + urgency * 26 + consequence * 14 - trust * 5,
    authority: 50 - experience * 20 - confidence * 14 + urgency * 20 + consequence * 12 - reversibility * 8,
    care: 58 - confidence * 5 - trust * 8 + consequence * 5,
    challenge: 60 + experience * 6 + trust * 8 + urgency * 7,
    visibility: 64 - trust * 5 + uncertainty * 15 + urgency * 8,
    posture: 42 - experience * 16 - confidence * 8 + urgency * 25 + consequence * 12,
    change: 48 + innovation * 24 + uncertainty * 9 - consequence * 10,
    risk: 52 - consequence * 28 + reversibility * 24 + uncertainty * 8,
    operatingMode: 48 + innovation * 30 + uncertainty * 18 + reversibility * 10 - urgency * 14 - consequence * 18,
    decisionStyle: 56 + experience * 12 + trust * 12 - urgency * 22 - consequence * 10 + uncertainty * 8,
  };
  return clamp(scores[key]);
};

export const getContextRecommendedProfile = (
  context: SituationContext,
  baseSituation?: Situation,
): ManagementProfile => {
  const pureContext = DIMENSION_KEYS.reduce((profile, key) => {
    profile[key] = Math.round(contextTarget(key, context));
    return profile;
  }, {} as ManagementProfile);
  return baseSituation ? blendProfiles(baseSituation.ideal, pureContext, 0.45) : pureContext;
};

export const getAssessmentProfile = (
  scenarios: AssessmentScenario[],
  answers: Record<string, string>,
  base: ManagementProfile,
): ManagementProfile => {
  const totals = makeProfile(0);
  let answered = 0;
  for (const scenario of scenarios) {
    const selected = scenario.options.find((option) => option.id === answers[scenario.id]);
    if (!selected) continue;
    answered += 1;
    for (const key of DIMENSION_KEYS) totals[key] += selected.effects[key] ?? 0;
  }
  if (!answered) return { ...base };
  return DIMENSION_KEYS.reduce((profile, key) => {
    profile[key] = Math.round(clamp(base[key] + totals[key] / Math.max(1, answered * 0.8)));
    return profile;
  }, {} as ManagementProfile);
};

const actionCopy: Record<DimensionKey, { increase: string; decrease: string }> = {
  focus: {
    increase: "Make the outcome, priority, owner, and deadline explicit; remove work that does not support the commitment.",
    decrease: "Create space to understand capacity, motivation, and relationship impact before increasing output pressure.",
  },
  authority: {
    increase: "Define the outcome, owner, deadline, and check-in cadence, while leaving implementation choices with the employee where possible.",
    decrease: "Clarify the boundaries and decision rights, then let the team choose the path and escalate only named exceptions.",
  },
  care: {
    increase: "Acknowledge the human impact, ask what support would be useful, and demonstrate follow-through rather than reassurance alone.",
    decrease: "Keep the message respectful but spend less time cushioning it; state the observable issue and required change clearly.",
  },
  challenge: {
    increase: "Name the behavior, its impact, the standard, and the change required; invite context without making the expectation ambiguous.",
    decrease: "Use more inquiry before judgment and separate an early hypothesis from a final performance conclusion.",
  },
  visibility: {
    increase: "Explain the reasoning, constraints, trade-offs, and what remains unknown so the team can make aligned local decisions.",
    decrease: "Filter uncertainty for operational relevance and communicate the facts people can act on without transferring raw anxiety.",
  },
  posture: {
    increase: "Temporarily set sequence, roles, escalation paths, and decision ownership; state when command mode will end.",
    decrease: "Stop solving routine obstacles personally; coach owners to remove them and make yourself an escalation path rather than the default path.",
  },
  change: {
    increase: "Define the step-change required, what the current system cannot achieve, and the milestones that make the transition credible.",
    decrease: "Break the change into reversible increments with a short feedback cycle and a measurable next improvement.",
  },
  risk: {
    increase: "Reduce blast radius, improve observability, pre-plan recovery, and let the team learn through reversible attempts.",
    decrease: "Add review, safeguards, testing, and explicit approval for failure modes whose consequences are difficult to reverse.",
  },
  operatingMode: {
    increase: "Frame the work as a learning question, run small experiments, and decide in advance what evidence will change direction.",
    decrease: "Standardize the proven path, reduce work in progress, and optimize consistency before introducing more variation.",
  },
  decisionStyle: {
    increase: "Gather input from the people closest to the work, make decision rights explicit, and show how their evidence shaped the outcome.",
    decrease: "Name one accountable decision-maker, set the decision deadline, and communicate the reasoning after the call is made.",
  },
};

export const getBehaviorRecommendations = (
  current: ManagementProfile,
  target: ManagementProfile,
  limit = 4,
) =>
  getAdjustmentRecommendations(current, target, limit).map((recommendation) => ({
    ...recommendation,
    action: actionCopy[recommendation.key][recommendation.direction],
  }));

export type ConversationTone = "direct" | "supportive" | "concise" | "collaborative";

export const getConversationExample = (
  current: ManagementProfile,
  target: ManagementProfile,
  tone: ConversationTone,
): string => {
  const top = getAdjustmentRecommendations(current, target, 2);
  const direction = top[0];
  const core = direction?.key === "authority" && direction.direction === "increase"
    ? "I want you to own the solution. Let’s agree on the outcome, the date, and two checkpoints so I can support you without taking over."
    : direction?.key === "challenge" && direction.direction === "increase"
      ? "I want to be direct about the gap I’m seeing and its impact. I also want to understand your view so we can agree on a concrete change."
      : direction?.key === "care" && direction.direction === "increase"
        ? "I want to understand what this situation has been like for you and what support would make a practical difference."
        : direction?.key === "decisionStyle" && direction.direction === "increase"
          ? "I’ll make the final call, but I want the evidence and trade-offs you see before I decide."
          : "Let’s clarify the outcome, the constraints, and who owns each decision, then choose a check-in rhythm that matches the risk.";

  const variants: Record<ConversationTone, string> = {
    direct: `I want to be clear: ${core} We will review progress against the agreed outcome.`,
    supportive: `${core} My goal is to give you both meaningful ownership and the support needed to succeed.`,
    concise: core.replace("Let’s", "We’ll").replace("I want to", "I’ll"),
    collaborative: `${core} What would you change about that approach before we commit to it?`,
  };
  return variants[tone];
};

export const getStyleShiftInsight = (
  natural: ManagementProfile,
  working: ManagementProfile,
): string => {
  const differences = DIMENSIONS.map((dimension) => ({
    dimension,
    delta: working[dimension.key] - natural[dimension.key],
  })).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  const main = differences[0];
  const second = differences[1];
  if (!main || Math.abs(main.delta) < 8) {
    return "Your working style is close to your instinctive style. The main opportunity is to make any situational adaptations explicit rather than accidental.";
  }
  const mainTarget = main.delta > 0 ? main.dimension.highLabel : main.dimension.lowLabel;
  const secondTarget = second.delta > 0 ? second.dimension.highLabel : second.dimension.lowLabel;
  return `Your natural style leans toward ${main.delta > 0 ? main.dimension.lowLabel.toLowerCase() : main.dimension.highLabel.toLowerCase()}, but you are deliberately adding ${mainTarget.toLowerCase()}${Math.abs(second.delta) >= 8 ? ` and ${secondTarget.toLowerCase()}` : ""} in your current context.`;
};

export const getOvercorrectionWarnings = (
  natural: ManagementProfile,
  working: ManagementProfile,
  recommended?: ManagementProfile,
): ProfileWarning[] => {
  const warnings: ProfileWarning[] = [];
  const authorityShift = working.authority - natural.authority;
  const challengeShift = working.challenge - natural.challenge;
  const careShift = working.care - natural.care;
  const postureShift = working.posture - natural.posture;

  if (authorityShift >= 35) {
    warnings.push({
      id: "autonomy-collapse",
      title: "Autonomy may have collapsed too far",
      body: "A problem has moved you sharply toward direction. Add checkpoints and boundaries before taking routine decisions away from the team.",
      severity: "watch",
    });
  }
  if (challengeShift <= -22 && careShift >= 15) {
    warnings.push({
      id: "care-overcorrection",
      title: "Care may be replacing candour",
      body: "You have become more supportive while reducing challenge. Preserve empathy, but state the behavior and accountability required.",
      severity: "watch",
    });
  }
  if (postureShift >= 30 && working.posture >= 72) {
    warnings.push({
      id: "command-stuck",
      title: "Temporary command may be becoming permanent",
      body: "Command mode may be appropriate during the incident, but sustaining it afterward could reduce ownership. Define an explicit exit condition.",
      severity: "watch",
    });
  }
  if (recommended) {
    const overshoot = DIMENSIONS.map((dimension) => {
      const naturalToTarget = recommended[dimension.key] - natural[dimension.key];
      const naturalToWorking = working[dimension.key] - natural[dimension.key];
      const passedTarget = Math.sign(naturalToTarget) === Math.sign(naturalToWorking)
        && Math.abs(naturalToWorking) - Math.abs(naturalToTarget) >= 20;
      return { dimension, passedTarget, amount: Math.abs(naturalToWorking) - Math.abs(naturalToTarget) };
    }).filter((item) => item.passedTarget).sort((a, b) => b.amount - a.amount)[0];
    if (overshoot) {
      warnings.push({
        id: `overshoot-${overshoot.dimension.key}`,
        title: `${overshoot.dimension.shortName} has overshot the recommendation`,
        body: "Your adaptation moved beyond what the selected context calls for. A smaller deliberate shift may preserve more of your natural strengths.",
        severity: "note",
      });
    }
  }
  return warnings;
};

export const getTeamPerceptionAverage = (
  responses: TeamPerceptionResponse[],
): ManagementProfile | null =>
  responses.length ? averageProfiles(responses.map((response) => response.profile)) : null;

export const getPerceptionGaps = (
  selfProfile: ManagementProfile,
  teamProfile: ManagementProfile,
  limit = 4,
) =>
  DIMENSIONS.map((dimension) => ({
    key: dimension.key,
    name: dimension.shortName,
    self: selfProfile[dimension.key],
    team: teamProfile[dimension.key],
    gap: teamProfile[dimension.key] - selfProfile[dimension.key],
    experiencedAs: teamProfile[dimension.key] >= selfProfile[dimension.key]
      ? dimension.highLabel
      : dimension.lowLabel,
  }))
    .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
    .slice(0, limit);

export const getHistoryInsight = (snapshots: StyleSnapshot[]): string => {
  if (snapshots.length < 2) return "Add at least two snapshots to reveal how your style is changing over time.";
  const ordered = [...snapshots].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const first = ordered[0].profile;
  const last = ordered[ordered.length - 1].profile;
  const changes = DIMENSIONS.map((dimension) => ({
    dimension,
    delta: last[dimension.key] - first[dimension.key],
  })).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  const meaningful = changes.filter((change) => Math.abs(change.delta) >= 6).slice(0, 2);
  if (!meaningful.length) return "Your recorded style has remained relatively stable across these snapshots.";
  const phrases = meaningful.map((change) =>
    `${change.delta > 0 ? "more" : "less"} ${change.delta > 0 ? change.dimension.highLabel.toLowerCase() : change.dimension.lowLabel.toLowerCase()}`,
  );
  return `Across your recorded snapshots, you have become ${phrases.join(" and ")}.`;
};

export const describeBand = (value: number) => {
  if (value <= 20) return "Strongly left";
  if (value <= 40) return "Leans left";
  if (value < 60) return "Balanced";
  if (value < 80) return "Leans right";
  return "Strongly right";
};
