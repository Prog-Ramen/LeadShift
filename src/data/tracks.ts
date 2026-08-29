import type { ManagementProfile } from "@/lib/types";

export interface PhaseShift {
  headline: string;
  readyWhen: string[];
  watchOut: string;
}

export interface TrackSuccessor {
  trackId: string;
  trigger: string;
  headline: string;
  bridge: string;
}

export interface StyleMilestone {
  label: string;
  daysFromStart: number;
  focus: string;
  summary: string;
  transitions: { head: string; detail: string }[];
  phaseShift?: PhaseShift;
  profile: ManagementProfile;
}

export interface StyleTrack {
  id: string;
  name: string;
  description: string;
  outcome: string;
  color: string;
  milestones: StyleMilestone[];
  successors: TrackSuccessor[];
}

export const STYLE_TRACKS: StyleTrack[] = [
  {
    id: "new-to-role",
    name: "New to the role",
    description: "Joining a new team or stepping into management for the first time.",
    outcome: "Trust, credibility, and psychological safety",
    color: "#2e8c6c",
    milestones: [
      {
        label: "30 days",
        daysFromStart: 30,
        focus: "Listen & Learn",
        summary: "Observe more than you direct. Build relationships before changing anything.",
        transitions: [
          { head: "Stay patient", detail: "Resist the urge to fix things early" },
          { head: "Ask first", detail: "More questions than answers in every conversation" },
          { head: "Listen deeply", detail: "Learn each person's working style and what they need from you" },
        ],
        phaseShift: {
          headline: "Absorbing → Acting",
          readyWhen: [
            "You can predict how each person will react to a decision",
            "Trust feels established with at least two or three people",
            "You have a clear view of what is and isn't working",
          ],
          watchOut: "Don't name problems before you have specifics — early generalisations undermine the trust you've built.",
        },
        profile: { focus: 30, authority: 25, care: 88, challenge: 35, visibility: 70, posture: 22, change: 25, risk: 60, operatingMode: 55, decisionStyle: 75 },
      },
      {
        label: "60 days",
        daysFromStart: 60,
        focus: "Set Expectations",
        summary: "You understand the landscape. Start being clear about what good looks like.",
        transitions: [
          { head: "Set norms", detail: "Introduce your operating principles" },
          { head: "Name it", detail: "Start naming problems you see directly" },
          { head: "Show up", detail: "Establish a regular 1:1 cadence" },
        ],
        phaseShift: {
          headline: "Setting → Developing",
          readyWhen: [
            "Your 1:1s feel like real two-way conversations",
            "People come to you proactively rather than waiting to be asked",
            "Expectations are understood and mostly being met",
          ],
          watchOut: "Staying in feedback mode when coaching would serve better — people ready to grow need questions, not answers.",
        },
        profile: { focus: 40, authority: 35, care: 82, challenge: 50, visibility: 75, posture: 30, change: 30, risk: 62, operatingMode: 52, decisionStyle: 70 },
      },
      {
        label: "90 days",
        daysFromStart: 90,
        focus: "Coach & Clarify",
        summary: "Shift from observing to actively developing. You know who needs what.",
        transitions: [
          { head: "Coach up", detail: "Move from advice to questions in 1:1s" },
          { head: "Delegate", detail: "First decisions with clear scope" },
          { head: "Be direct", detail: "Name performance gaps directly and specifically" },
        ],
        phaseShift: {
          headline: "Directing → Releasing",
          readyWhen: [
            "The team solves problems without you in the room",
            "Delivery is consistent and predictable",
            "You're attending meetings to observe, not to decide",
          ],
          watchOut: "Holding onto decisions because you can make them faster — this limits the team's ownership and your bandwidth.",
        },
        profile: { focus: 42, authority: 42, care: 78, challenge: 62, visibility: 72, posture: 35, change: 35, risk: 65, operatingMode: 52, decisionStyle: 68 },
      },
      {
        label: "6 months",
        daysFromStart: 180,
        focus: "Build Autonomy",
        summary: "The team knows what you expect. Start removing yourself from decisions they can own.",
        transitions: [
          { head: "Step back", detail: "Stop attending meetings you don't need to attend" },
          { head: "Amplify them", detail: "Let the team represent their own work externally" },
          { head: "Go strategic", detail: "Focus your attention on strategy and blockers" },
        ],
        phaseShift: {
          headline: "Releasing → Challenging",
          readyWhen: [
            "The team is consistently meeting expectations without your oversight",
            "Trust is high enough that direct feedback lands well",
            "You have spare bandwidth — a sign the team is running itself",
          ],
          watchOut: "Reducing challenge just because things are running smoothly — a comfortable team is often an under-stretched one.",
        },
        profile: { focus: 45, authority: 32, care: 74, challenge: 68, visibility: 70, posture: 28, change: 40, risk: 68, operatingMode: 58, decisionStyle: 76 },
      },
      {
        label: "1 year",
        daysFromStart: 365,
        focus: "Enable & Challenge",
        summary: "Trust is established. Push the team harder and remove more of your own overhead.",
        transitions: [
          { head: "Stretch them", detail: "Set stretch goals with full ownership" },
          { head: "Elevate", detail: "Make the team lead external conversations" },
          { head: "Think long", detail: "Shift your focus to 12-month outcomes" },
        ],
        phaseShift: {
          headline: "Managing → Leading",
          readyWhen: [
            "You spend more time on team outcomes than individual output",
            "The team can represent its own work externally without you",
            "You're thinking at a 12-month horizon, not week to week",
          ],
          watchOut: "Staying too close to the work when org-level thinking is what the role now demands.",
        },
        profile: { focus: 48, authority: 24, care: 70, challenge: 74, visibility: 68, posture: 20, change: 48, risk: 72, operatingMode: 64, decisionStyle: 80 },
      },
      {
        label: "2 years",
        daysFromStart: 730,
        focus: "Operate Higher",
        summary: "Your team runs itself. Your job is strategy, culture, and developing the next generation of leaders.",
        transitions: [
          { head: "Spot leaders", detail: "Identify who can grow into leadership roles" },
          { head: "Work up", detail: "Shift your calendar toward org-level work" },
          { head: "Codify it", detail: "Make your own operating model explicit and teachable" },
        ],
        profile: { focus: 50, authority: 18, care: 68, challenge: 76, visibility: 72, posture: 16, change: 52, risk: 74, operatingMode: 66, decisionStyle: 82 },
      },
    ],
    successors: [
      {
        trackId: "scaling-fast",
        trigger: "Your team is stable and growing fast",
        headline: "Foundation built → now scale it",
        bridge: "The credibility you built in your first two years is the culture container. Switching to the Scaling track means protecting that culture as headcount grows — the biggest failure mode is not bringing new people into what you built.",
      },
      {
        trackId: "developing-successor",
        trigger: "You have a high-potential ready to grow",
        headline: "Manager → developer of managers",
        bridge: "After two years you know your team deeply. If someone is ready for leadership, formalising a development track gives that relationship a structure and a destination. The shift is from managing them to deliberately growing them.",
      },
    ],
  },
  {
    id: "turnaround",
    name: "Turnaround",
    description: "Stepping in to fix a team with serious performance, delivery, or culture problems.",
    outcome: "Accountability, reliability, and restored trust",
    color: "#b46a21",
    milestones: [
      {
        label: "30 days",
        daysFromStart: 30,
        focus: "Diagnose & Stabilise",
        summary: "Get the full picture fast. Set non-negotiable standards without burning the team.",
        transitions: [
          { head: "Be direct", detail: "Name every delivery gap directly and specifically" },
          { head: "Diagnose", detail: "Separate performance issues from structural ones" },
          { head: "Reality check", detail: "Don't shield people from the reality of the situation" },
        ],
        phaseShift: {
          headline: "Crisis Mode → Ownership",
          readyWhen: [
            "Every delivery gap is named and owned — no ambiguity about what is broken",
            "You've separated structural problems from people problems",
            "The team is stabilised enough to absorb accountability",
          ],
          watchOut: "Transferring ownership before people feel supported — accountability without care is just pressure.",
        },
        profile: { focus: 78, authority: 80, care: 58, challenge: 85, visibility: 80, posture: 78, change: 30, risk: 50, operatingMode: 22, decisionStyle: 28 },
      },
      {
        label: "60 days",
        daysFromStart: 60,
        focus: "Root Cause & Own",
        summary: "You know what is broken. Start transferring ownership of the fix.",
        transitions: [
          { head: "Own it", detail: "Assign named owners to each recovery area" },
          { head: "Go deeper", detail: "Ask why, not just what" },
          { head: "Show care", detail: "Visible support for people doing hard things" },
        ],
        phaseShift: {
          headline: "Identifying → Acknowledging",
          readyWhen: [
            "Named owners are meeting regularly on their recovery areas",
            "Trust is starting to return — people are engaging, not just complying",
            "You can point to at least one thing that has measurably improved",
          ],
          watchOut: "Still looking for problems when you should be recognising progress — missing early wins kills momentum.",
        },
        profile: { focus: 72, authority: 72, care: 64, challenge: 82, visibility: 78, posture: 72, change: 32, risk: 55, operatingMode: 24, decisionStyle: 34 },
      },
      {
        label: "90 days",
        daysFromStart: 90,
        focus: "Reinforce & Reward",
        summary: "Performance is stabilising. Acknowledge what is working and build on it.",
        transitions: [
          { head: "Celebrate wins", detail: "Explicitly name what has improved" },
          { head: "Release control", detail: "Delegate decisions in recovering areas" },
          { head: "Give choice", detail: "Introduce one improvement the team chose themselves" },
        ],
        phaseShift: {
          headline: "Accountability → Autonomy",
          readyWhen: [
            "The team is hitting commitments consistently",
            "Morale is visibly improving — energy and engagement have returned",
            "People are starting to suggest solutions rather than waiting to be told",
          ],
          watchOut: "Relaxing standards too quickly after early wins — the team needs to feel the new baseline is permanent, not a temporary phase.",
        },
        profile: { focus: 65, authority: 62, care: 68, challenge: 78, visibility: 75, posture: 65, change: 36, risk: 58, operatingMode: 28, decisionStyle: 42 },
      },
      {
        label: "6 months",
        daysFromStart: 180,
        focus: "Release Control",
        summary: "The team is performing. Reward recovery with increasing autonomy.",
        transitions: [
          { head: "Trust them", detail: "Let the team own their process choices" },
          { head: "Raise the bar", detail: "Shift challenge from compliance to growth" },
          { head: "Restore freedom", detail: "Reintroduce exploration where it was lost" },
        ],
        phaseShift: {
          headline: "Recovery → Growth",
          readyWhen: [
            "Performance is reliable — no regression when you step back",
            "The team references their own standards, not just yours",
            "Past problems feel resolved, not suppressed",
          ],
          watchOut: "Reverting to accountability management when the team starts to grow — they've earned development, not more scrutiny.",
        },
        profile: { focus: 55, authority: 48, care: 72, challenge: 74, visibility: 72, posture: 52, change: 42, risk: 62, operatingMode: 38, decisionStyle: 56 },
      },
      {
        label: "1 year",
        daysFromStart: 365,
        focus: "Rebuild Culture",
        summary: "Turnaround is complete. Shift from performance management to development.",
        transitions: [
          { head: "Develop not manage", detail: "Move 1:1s from accountability to growth" },
          { head: "Invest in them", detail: "Invest in the team's professional development" },
          { head: "Build safeguards", detail: "Build systems that prevent recurrence" },
        ],
        phaseShift: {
          headline: "Turnaround → High Performance",
          readyWhen: [
            "No one is talking about the old problems anymore",
            "The team has its own identity — they define themselves by what they build, not what they fixed",
            "You've built the systems that make recurrence unlikely",
          ],
          watchOut: "Not acknowledging how far the team has come — the transition from turnaround manager to culture builder requires explicitly closing the old chapter.",
        },
        profile: { focus: 46, authority: 36, care: 76, challenge: 72, visibility: 70, posture: 36, change: 48, risk: 66, operatingMode: 46, decisionStyle: 66 },
      },
      {
        label: "2 years",
        daysFromStart: 730,
        focus: "High Performance",
        summary: "You have a fundamentally different team. Operate at the level they deserve.",
        transitions: [
          { head: "Move forward", detail: "Treat past performance issues as closed chapters" },
          { head: "Match autonomy", detail: "Grant autonomy proportional to current capability" },
          { head: "Build identity", detail: "Use the turnaround story to forge team identity" },
        ],
        profile: { focus: 48, authority: 24, care: 74, challenge: 74, visibility: 68, posture: 22, change: 52, risk: 70, operatingMode: 58, decisionStyle: 76 },
      },
    ],
    successors: [
      {
        trackId: "new-to-role",
        trigger: "The team is recovered — reset the relationship",
        headline: "Turnaround complete → lead fresh",
        bridge: "The turnaround manager identity can become a ceiling. Once the team is high-performing, deliberately shifting into a 'new to role' posture — curious, listening, building — signals to the team that the old chapter is genuinely closed and a new one has started.",
      },
      {
        trackId: "developing-successor",
        trigger: "A strong performer emerged through the hard times",
        headline: "Recovery revealed your next leader",
        bridge: "Turnarounds often surface who the real talent is. If someone showed exceptional ownership during the recovery, they may be ready for deliberate development. Don't let that go unrecognised.",
      },
    ],
  },
  {
    id: "scaling-fast",
    name: "Scaling fast",
    description: "Managing a team that is growing rapidly — headcount, scope, or both.",
    outcome: "Culture preservation, speed, and operational coherence",
    color: "#4f6e91",
    milestones: [
      {
        label: "30 days",
        daysFromStart: 30,
        focus: "Culture First",
        summary: "Before the team gets big, make the values, principles, and decision rights explicit.",
        transitions: [
          { head: "Define rights", detail: "Document how decisions get made before you have to enforce it" },
          { head: "Be explicit", detail: "Make your leadership principles visible and discussable" },
          { head: "Hire right", detail: "Hire for values fit as much as skills" },
        ],
        phaseShift: {
          headline: "Values → Systems",
          readyWhen: [
            "Culture is explicitly documented and people can articulate it in their own words",
            "New hires are joining and the culture is holding without your direct involvement",
            "Processes are starting to feel informal and inconsistent at the team's current size",
          ],
          watchOut: "Building process before the team understands why — systems without culture become bureaucracy.",
        },
        profile: { focus: 42, authority: 35, care: 76, challenge: 68, visibility: 85, posture: 28, change: 65, risk: 75, operatingMode: 78, decisionStyle: 78 },
      },
      {
        label: "90 days",
        daysFromStart: 90,
        focus: "Systematise",
        summary: "You are past the early stage. Start building repeatable systems before the chaos scales with you.",
        transitions: [
          { head: "Document", detail: "Capture processes the team is running well" },
          { head: "Onboard well", detail: "Introduce lightweight onboarding for new hires" },
          { head: "Spot leads", detail: "Identify team leads who can own sub-domains" },
        ],
        phaseShift: {
          headline: "Systems → Structure",
          readyWhen: [
            "Key processes are documented and running without you",
            "Onboarding is consistent — new hires ramp at a predictable rate",
            "Two or three people are showing genuine leadership instincts",
          ],
          watchOut: "Promoting into team lead roles too early because you need the capacity — premature promotion damages both the person and the sub-team.",
        },
        profile: { focus: 48, authority: 40, care: 74, challenge: 70, visibility: 80, posture: 36, change: 60, risk: 72, operatingMode: 72, decisionStyle: 74 },
      },
      {
        label: "6 months",
        daysFromStart: 180,
        focus: "Build the Layer",
        summary: "You cannot directly manage everyone. Identify and develop team leads who carry your values.",
        transitions: [
          { head: "Layer up", detail: "Delegate management of sub-teams explicitly" },
          { head: "Manage managers", detail: "Shift from IC management to lead management" },
          { head: "Onboard at scale", detail: "Invest heavily in onboarding quality" },
        ],
        phaseShift: {
          headline: "One Layer → Two Speeds",
          readyWhen: [
            "Team leads are trusted and running their sub-teams independently",
            "Sub-teams have distinct identities and work rhythms",
            "You're spending your time on cross-team coordination and strategy, not individual contributor management",
          ],
          watchOut: "Separating teams so much that culture fragments — execution and exploration need a shared foundation.",
        },
        profile: { focus: 52, authority: 46, care: 72, challenge: 72, visibility: 76, posture: 44, change: 55, risk: 68, operatingMode: 66, decisionStyle: 70 },
      },
      {
        label: "1 year",
        daysFromStart: 365,
        focus: "Two Speeds",
        summary: "Your core team executes reliably. A smaller group continues to explore and expand.",
        transitions: [
          { head: "Separate modes", detail: "Structurally separate stable execution from experimental work" },
          { head: "Create space", detail: "Protect explorers from operators and vice versa" },
          { head: "Define success", detail: "Set different success metrics for each mode" },
        ],
        phaseShift: {
          headline: "Two Speeds → Full Maturity",
          readyWhen: [
            "Execution and exploration are both working independently and well",
            "Team leads are making decisions you would have made",
            "You're thinking about the organisation's 3-5 year position, not just this year",
          ],
          watchOut: "A mature organisation becoming too slow and process-heavy to stay competitive — maturity is not the same as bureaucracy.",
        },
        profile: { focus: 55, authority: 42, care: 70, challenge: 72, visibility: 74, posture: 40, change: 52, risk: 66, operatingMode: 60, decisionStyle: 68 },
      },
      {
        label: "2 years",
        daysFromStart: 730,
        focus: "Mature & Sustain",
        summary: "You have built a real organisation. Your role is culture stewardship and the next generation of leaders.",
        transitions: [
          { head: "Institutionalise", detail: "Make your operating model explicit so it survives you" },
          { head: "Pipeline", detail: "Identify the next two levels of leadership" },
          { head: "Look further", detail: "Shift your personal focus to the 3-5 year horizon" },
        ],
        profile: { focus: 50, authority: 30, care: 70, challenge: 74, visibility: 72, posture: 26, change: 50, risk: 68, operatingMode: 62, decisionStyle: 76 },
      },
    ],
    successors: [
      {
        trackId: "developing-successor",
        trigger: "Your organisation has strong leaders ready to grow",
        headline: "Scale built → now develop the next layer",
        bridge: "At scale, your most leveraged activity shifts from building systems to building leaders. The people who helped you scale are often ready for a development track of their own. Formalise that relationship.",
      },
    ],
  },
  {
    id: "developing-successor",
    name: "Developing a successor",
    description: "Deliberately growing a high-potential team member into a leadership role.",
    outcome: "Leadership capability and sustainable succession",
    color: "#7c4fa0",
    milestones: [
      {
        label: "30 days",
        daysFromStart: 30,
        focus: "Assess & Commit",
        summary: "Understand exactly where they are and make a clear developmental commitment to them.",
        transitions: [
          { head: "Commit openly", detail: "Tell them explicitly you're investing in their leadership growth" },
          { head: "Focus gaps", detail: "Identify the two or three gaps that matter most" },
          { head: "Set goals", detail: "Set a 6-month developmental goal together" },
        ],
        phaseShift: {
          headline: "Assessing → Stretching",
          readyWhen: [
            "You've had the explicit developmental commitment conversation with them",
            "The key gaps are agreed between you — not just your view, but theirs",
            "The relationship has enough trust for honest, direct feedback to land well",
          ],
          watchOut: "Stretching before the relationship is ready — a stretch assignment without trust feels like being set up to fail.",
        },
        profile: { focus: 36, authority: 45, care: 86, challenge: 62, visibility: 78, posture: 30, change: 38, risk: 66, operatingMode: 55, decisionStyle: 72 },
      },
      {
        label: "90 days",
        daysFromStart: 90,
        focus: "Deliberate Stretch",
        summary: "Assign them work that is slightly beyond their current comfort zone with your support visible.",
        transitions: [
          { head: "Stretch them", detail: "Let them lead something they've never led before" },
          { head: "Debrief always", detail: "Debrief after every stretch moment — good and bad" },
          { head: "Hold back", detail: "Resist solving problems they should work through" },
        ],
        phaseShift: {
          headline: "Tasks → Real Scope",
          readyWhen: [
            "They've successfully led something significant with your visible support",
            "Their instincts are improving — they're asking better questions, not just different ones",
            "They're ready for the visibility and accountability that comes with domain ownership",
          ],
          watchOut: "Delegating scope before they're ready for the external visibility — stakeholder exposure without preparation can undermine confidence.",
        },
        profile: { focus: 38, authority: 42, care: 84, challenge: 74, visibility: 74, posture: 28, change: 42, risk: 68, operatingMode: 56, decisionStyle: 70 },
      },
      {
        label: "6 months",
        daysFromStart: 180,
        focus: "Delegate Scope",
        summary: "Move from task delegation to domain ownership. They own outcomes, not just activities.",
        transitions: [
          { head: "Give ownership", detail: "Hand over a meaningful scope — team, area, or process" },
          { head: "Step away", detail: "Stop attending their team meetings unless invited" },
          { head: "Push first", detail: "Ask them to solve problems before coming to you" },
        ],
        phaseShift: {
          headline: "Scope → Judgment",
          readyWhen: [
            "They're running their domain without checking in too often",
            "Their judgment is sound — they make decisions you'd sanction even if you'd have decided differently",
            "Their direct reports and stakeholders treat them as the decision-maker",
          ],
          watchOut: "Pulling back your support so fast they feel abandoned — the shift from coach to sponsor is gradual, not a handover.",
        },
        profile: { focus: 40, authority: 32, care: 80, challenge: 76, visibility: 70, posture: 24, change: 46, risk: 70, operatingMode: 58, decisionStyle: 74 },
      },
      {
        label: "1 year",
        daysFromStart: 365,
        focus: "Coach Behind",
        summary: "They run the day-to-day. Your job is to develop their judgment, not their delivery.",
        transitions: [
          { head: "Go deeper", detail: "Move 1:1s from review to strategy and reflection" },
          { head: "Trust the process", detail: "Let them make decisions you disagree with and learn" },
          { head: "Sponsor them", detail: "Introduce them to peers and stakeholders as a leader" },
        ],
        phaseShift: {
          headline: "Coaching → Sponsoring",
          readyWhen: [
            "They're making decisions you would have made differently and getting good outcomes",
            "Their leadership identity is solid — they're not dependent on your validation",
            "The developmental relationship has reached its natural ceiling",
          ],
          watchOut: "Keeping them in the developer relationship too long — at some point the most developmental thing you can do is let them fly.",
        },
        profile: { focus: 36, authority: 22, care: 78, challenge: 78, visibility: 68, posture: 18, change: 50, risk: 72, operatingMode: 60, decisionStyle: 78 },
      },
      {
        label: "2 years",
        daysFromStart: 730,
        focus: "Transition to Peer",
        summary: "They are ready. Your relationship shifts from manager-developer to peer and sponsor.",
        transitions: [
          { head: "Close the arc", detail: "Explicitly mark the end of the developmental journey" },
          { head: "Champion them", detail: "Advocate for their next opportunity externally" },
          { head: "Reinvent yourself", detail: "Rebuild your own focus on what comes next for you" },
        ],
        profile: { focus: 38, authority: 18, care: 74, challenge: 76, visibility: 65, posture: 16, change: 54, risk: 72, operatingMode: 62, decisionStyle: 80 },
      },
    ],
    successors: [
      {
        trackId: "new-to-role",
        trigger: "Your successor is ready — they need their own journey",
        headline: "Their new chapter starts now",
        bridge: "The most valuable thing you can do once your successor is ready is help them approach their expanded role with the same intentional posture you used. Coach them through their own new-to-role arc — you know exactly what they'll need.",
      },
      {
        trackId: "scaling-fast",
        trigger: "You're moving to a bigger scope yourself",
        headline: "You built the successor — now scale up",
        bridge: "Developing a successor often frees you for a larger scope. If your next role means a growing team or org, the Scaling track gives you a framework for what comes next — for you, not just the person you developed.",
      },
    ],
  },
];

export function getMilestoneForDate(track: StyleTrack, startDate: Date, now: Date): { milestone: StyleMilestone; index: number } {
  const daysElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  let index = track.milestones.length - 1;
  for (let i = 0; i < track.milestones.length; i++) {
    if (daysElapsed < track.milestones[i].daysFromStart) {
      index = Math.max(0, i - 1);
      break;
    }
  }
  return { milestone: track.milestones[index], index };
}

export function getDaysUntilNext(track: StyleTrack, startDate: Date, now: Date): number | null {
  const daysElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const next = track.milestones.find((m) => m.daysFromStart > daysElapsed);
  return next ? next.daysFromStart - daysElapsed : null;
}
