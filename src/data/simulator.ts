import type { SimulatorScenario } from "@/lib/types";

export const SIMULATOR_SCENARIOS: SimulatorScenario[] = [
  {
    id: "missed-commitment",
    title: "The missed commitment",
    description: "Practice balancing accountability, diagnosis, and ownership with a strong employee whose delivery has become unreliable.",
    startNodeId: "start",
    nodes: [
      {
        id: "start",
        prompt: "Alex, a senior engineer, misses a second deadline. The technical quality is excellent, but another team is now blocked. What do you say first?",
        choices: [
          {
            id: "direct-curious",
            label: "Name the pattern and ask what is driving it.",
            response: "Alex acknowledges over-scoping and says they were afraid to surface uncertainty.",
            effects: { trust: 8, clarity: 12, accountability: 10, delivery: 5 },
            nextNodeId: "diagnosis",
          },
          {
            id: "take-control",
            label: "Tell Alex you will break down and monitor the next plan.",
            response: "Alex agrees, but becomes quieter and waits for your approval on routine choices.",
            effects: { trust: -7, clarity: 13, accountability: -4, delivery: 7 },
            nextNodeId: "control",
          },
          {
            id: "reassure",
            label: "Emphasize that quality matters and avoid making this a major issue.",
            response: "Alex feels supported, but the affected team still lacks a reliable commitment.",
            effects: { trust: 7, clarity: -8, accountability: -12, delivery: -7 },
            nextNodeId: "soft",
          },
        ],
      },
      {
        id: "diagnosis",
        prompt: "Alex proposes a smaller milestone but wants freedom over implementation. How do you proceed?",
        choices: [
          {
            id: "bounded-owner",
            label: "Agree on outcome, owner, date, and two checkpoints; leave implementation to Alex.",
            response: "The next milestone lands on time, and Alex raises a risk at the first checkpoint.",
            effects: { trust: 10, clarity: 12, accountability: 13, delivery: 12 },
          },
          {
            id: "daily-plan",
            label: "Require a daily task plan until reliability is restored.",
            response: "Delivery improves, but Alex reports feeling treated below their level.",
            effects: { trust: -5, clarity: 10, accountability: 4, delivery: 10 },
          },
          {
            id: "full-reset",
            label: "Accept the new date and step back completely.",
            response: "Alex appreciates the trust, but the same uncertainty resurfaces too late.",
            effects: { trust: 6, clarity: -5, accountability: -4, delivery: -8 },
          },
        ],
      },
      {
        id: "control",
        prompt: "Your detailed plan is working, but Alex now escalates minor decisions. What do you do?",
        choices: [
          {
            id: "release",
            label: "Explicitly return implementation decisions while keeping milestone checkpoints.",
            response: "Alex resumes ownership and keeps the useful reporting cadence.",
            effects: { trust: 11, clarity: 5, accountability: 9, delivery: 8 },
          },
          {
            id: "continue",
            label: "Keep the controls until the entire project is complete.",
            response: "The project delivers, but you become the decision bottleneck.",
            effects: { trust: -8, clarity: 7, accountability: -8, delivery: 5 },
          },
        ],
      },
      {
        id: "soft",
        prompt: "A third commitment is now at risk. How do you correct course?",
        choices: [
          {
            id: "reset-expectations",
            label: "Acknowledge your earlier ambiguity and set a direct reliability expectation.",
            response: "The conversation is uncomfortable but produces a concrete recovery plan.",
            effects: { trust: 4, clarity: 14, accountability: 14, delivery: 10 },
          },
          {
            id: "move-work",
            label: "Quietly move critical work to someone else.",
            response: "The deadline is protected, but Alex experiences the change as unexplained loss of trust.",
            effects: { trust: -12, clarity: -4, accountability: -7, delivery: 8 },
          },
        ],
      },
    ],
  },
  {
    id: "incident-leadership",
    title: "The escalating incident",
    description: "Practice moving into temporary command mode without trapping the team there after recovery.",
    startNodeId: "start",
    nodes: [
      {
        id: "start",
        prompt: "A payment outage is spreading. Three engineers are investigating different theories and no one is coordinating. What do you do?",
        choices: [
          {
            id: "roles",
            label: "Appoint an incident lead, assign roles, and establish 10-minute updates.",
            response: "The team converges on one timeline and eliminates duplicated investigation.",
            effects: { trust: 4, clarity: 15, accountability: 12, delivery: 14 },
            nextNodeId: "resolved",
          },
          {
            id: "consensus",
            label: "Pause and ask the group to agree on a response structure.",
            response: "The discussion surfaces useful ideas but consumes critical response time.",
            effects: { trust: 5, clarity: 2, accountability: -2, delivery: -8 },
            nextNodeId: "resolved",
          },
          {
            id: "fix-yourself",
            label: "Take the keyboard and implement the most likely fix yourself.",
            response: "The fix helps briefly, but the team loses the overall incident picture.",
            effects: { trust: -5, clarity: -4, accountability: -8, delivery: 5 },
            nextNodeId: "resolved",
          },
        ],
      },
      {
        id: "resolved",
        prompt: "Service is restored. The team is still looking to you for every next step. What now?",
        choices: [
          {
            id: "release-command",
            label: "End incident command explicitly and assign the review to a team owner.",
            response: "The team understands that centralized authority was temporary and resumes normal ownership.",
            effects: { trust: 10, clarity: 8, accountability: 10, delivery: 6 },
          },
          {
            id: "stay-command",
            label: "Keep approving all reliability work until confidence is restored.",
            response: "Short-term coordination remains high, but initiative and speed decline over the following weeks.",
            effects: { trust: -8, clarity: 6, accountability: -10, delivery: -4 },
          },
          {
            id: "move-on",
            label: "Thank everyone and return immediately to planned work.",
            response: "Normal work resumes quickly, but important learning and prevention work are lost.",
            effects: { trust: 1, clarity: -5, accountability: -6, delivery: 2 },
          },
        ],
        end: true,
      },
    ],
  },
  {
    id: "team-conflict",
    title: "The open conflict",
    description: "Practice navigating two senior team members whose public friction is eroding team morale and slowing work.",
    startNodeId: "start",
    nodes: [
      {
        id: "start",
        prompt: "Jordan and Sam, both senior engineers, are openly dismissive of each other in team meetings. Others have stopped contributing to discussions those two are in. How do you address it first?",
        choices: [
          {
            id: "separate-conversations",
            label: "Meet with each person individually before doing anything else.",
            response: "Both share genuine grievances the other party does not know about. You gain context without the dynamic escalating.",
            effects: { trust: 9, clarity: 11, accountability: 4, delivery: 0 },
            nextNodeId: "root-cause",
          },
          {
            id: "joint-conversation",
            label: "Bring Jordan and Sam together to address the behavior directly with you facilitating.",
            response: "The conversation is tense. Sam becomes defensive; Jordan disengages. You learn less than expected.",
            effects: { trust: -3, clarity: 5, accountability: 8, delivery: -5 },
            nextNodeId: "aftermath",
          },
          {
            id: "team-norm",
            label: "Address the behavior as a team norm issue in the next team meeting without naming individuals.",
            response: "The team appreciates the signal, but Jordan and Sam both privately feel absolved. The dynamic does not change.",
            effects: { trust: 3, clarity: -4, accountability: -8, delivery: -4 },
            nextNodeId: "aftermath",
          },
        ],
      },
      {
        id: "root-cause",
        prompt: "You learn Jordan believes Sam takes credit for shared work, while Sam feels Jordan blocks their ideas without explanation. Both are partly right. How do you proceed?",
        choices: [
          {
            id: "share-themes",
            label: "Share the themes from both conversations with each person — anonymized but honest — then set behavioral expectations.",
            response: "Both are surprised. The conversation moves from grievance to understanding. Tension drops noticeably.",
            effects: { trust: 12, clarity: 13, accountability: 10, delivery: 7 },
            nextNodeId: "resolution",
          },
          {
            id: "mediation",
            label: "Bring in an HR business partner to facilitate a structured mediation session.",
            response: "The process is perceived as formal and high-stakes. Sam is uncomfortable; Jordan cooperates but feels judged.",
            effects: { trust: -4, clarity: 8, accountability: 9, delivery: -3 },
            nextNodeId: "resolution",
          },
          {
            id: "structural-fix",
            label: "Change team assignments so Jordan and Sam work on separate workstreams and rarely interact.",
            response: "Meetings improve immediately, but the structural tension remains unresolved and resurfaces when paths cross.",
            effects: { trust: 2, clarity: 4, accountability: -10, delivery: 5 },
            nextNodeId: "resolution",
          },
        ],
      },
      {
        id: "aftermath",
        prompt: "The behavior has improved slightly but not resolved. Two weeks later a code review between Jordan and Sam goes badly and a junior engineer messages you privately saying they are considering transferring. What do you do?",
        choices: [
          {
            id: "escalate-expectations",
            label: "Set a direct, documented expectation with both seniors: the behavior must change within 30 days or there are performance consequences.",
            response: "The message lands clearly. Both adjust their public behavior, though the relationship remains cold.",
            effects: { trust: -2, clarity: 14, accountability: 14, delivery: 8 },
            nextNodeId: "resolution",
          },
          {
            id: "protect-junior",
            label: "Focus energy on the junior engineer — reassure them, give them more agency, and shield them from the conflict.",
            response: "The junior feels supported and stays, but the senior conflict continues to affect others.",
            effects: { trust: 7, clarity: -3, accountability: -8, delivery: -4 },
            nextNodeId: "resolution",
          },
        ],
      },
      {
        id: "resolution",
        prompt: "The immediate friction has subsided. Jordan pulls you aside and says the tension came partly from unclear ownership across a shared service. How do you close this out?",
        choices: [
          {
            id: "ownership-mapping",
            label: "Run a team session to map explicit ownership across shared systems and publish it.",
            response: "The team gains clarity that outlasts the interpersonal work. Similar conflicts become less likely.",
            effects: { trust: 8, clarity: 14, accountability: 11, delivery: 9 },
          },
          {
            id: "bilateral-agreement",
            label: "Ask Jordan and Sam to draft a working agreement between themselves and present it to you.",
            response: "The agreement is thoughtful but narrow. Broader ownership ambiguity remains for others on the team.",
            effects: { trust: 9, clarity: 7, accountability: 10, delivery: 4 },
          },
          {
            id: "close-it",
            label: "Acknowledge the insight and move on — you have addressed the interpersonal piece and the team is moving again.",
            response: "The team recovers short-term, but the structural cause re-emerges in the next quarter.",
            effects: { trust: 4, clarity: -4, accountability: -5, delivery: 3 },
          },
        ],
        end: true,
      },
    ],
  },
  {
    id: "underperformer",
    title: "The sudden disengagement",
    description: "Practice diagnosing and responding when a previously strong performer starts missing targets and pulling back.",
    startNodeId: "start",
    nodes: [
      {
        id: "start",
        prompt: "Morgan was your most reliable engineer six months ago. In the last two sprints they have missed three commitments, stopped volunteering in planning, and their code review quality has dropped. How do you open the conversation?",
        choices: [
          {
            id: "curiosity-first",
            label: "Ask Morgan directly: something seems different lately — what is going on for them?",
            response: "Morgan pauses, then discloses they have been dealing with a family health situation and feel they are letting the team down.",
            effects: { trust: 13, clarity: 8, accountability: 4, delivery: 2 },
            nextNodeId: "personal-context",
          },
          {
            id: "performance-frame",
            label: "Walk through the missed commitments specifically and ask what is getting in the way of hitting them.",
            response: "Morgan becomes defensive initially, then acknowledges the pattern but does not share the underlying cause.",
            effects: { trust: -4, clarity: 13, accountability: 10, delivery: 3 },
            nextNodeId: "no-context",
          },
          {
            id: "watch-longer",
            label: "Give it another sprint before acting — perhaps it is temporary and will resolve on its own.",
            response: "A third sprint passes with similar results. A junior engineer now tells you they do not trust the estimates Morgan provides.",
            effects: { trust: -5, clarity: -6, accountability: -10, delivery: -9 },
            nextNodeId: "no-context",
          },
        ],
      },
      {
        id: "personal-context",
        prompt: "Morgan is managing a serious family situation. They want to stay fully engaged but are clearly stretched. How do you respond?",
        choices: [
          {
            id: "flexible-structure",
            label: "Offer reduced scope for one sprint with clear expectations, and check in weekly — not to monitor, but to remove blockers.",
            response: "Morgan delivers a smaller but complete set of commitments. Their engagement begins to return.",
            effects: { trust: 14, clarity: 10, accountability: 9, delivery: 8 },
            nextNodeId: "recovery",
          },
          {
            id: "leave-offer",
            label: "Suggest Morgan take formal leave and return when the situation stabilizes.",
            response: "Morgan declines, worried about being seen as unreliable. They appreciate the offer but the underlying tension remains.",
            effects: { trust: 6, clarity: 4, accountability: -3, delivery: -4 },
            nextNodeId: "recovery",
          },
          {
            id: "business-as-usual",
            label: "Acknowledge the situation but hold the same expectations — the team depends on consistency.",
            response: "Morgan tries to keep up but misses another commitment. They stop sharing problems with you.",
            effects: { trust: -9, clarity: 7, accountability: 4, delivery: -6 },
            nextNodeId: "recovery",
          },
        ],
      },
      {
        id: "no-context",
        prompt: "Morgan has not shared what is driving the change. The pattern is still worsening. How do you escalate your response?",
        choices: [
          {
            id: "pip-light",
            label: "Document the pattern and put Morgan on an informal improvement plan with clear milestones.",
            response: "Morgan feels managed out rather than supported. They begin job searching quietly.",
            effects: { trust: -10, clarity: 12, accountability: 11, delivery: 4 },
            nextNodeId: "recovery",
          },
          {
            id: "second-open-door",
            label: "Try once more with a different framing: tell Morgan you are not here to evaluate them — you are wondering if there is something you can do differently.",
            response: "Morgan opens up about a conflict with another team member you were unaware of. The actual root cause is now visible.",
            effects: { trust: 10, clarity: 11, accountability: 5, delivery: 3 },
            nextNodeId: "recovery",
          },
          {
            id: "redistribute",
            label: "Quietly move critical work to another engineer and lower expectations for Morgan until things improve.",
            response: "Delivery stabilizes but Morgan notices and interprets it as a signal that their role is at risk.",
            effects: { trust: -8, clarity: -4, accountability: -7, delivery: 7 },
            nextNodeId: "recovery",
          },
        ],
      },
      {
        id: "recovery",
        prompt: "Morgan is showing early signs of re-engagement. How do you close the loop to make the improvement sustainable?",
        choices: [
          {
            id: "name-the-return",
            label: "Tell Morgan explicitly that you have noticed the change and that it matters — and ask what would help them stay in that mode.",
            response: "Morgan says the check-ins helped most. You build them into a standing rhythm. Engagement holds.",
            effects: { trust: 12, clarity: 8, accountability: 9, delivery: 10 },
          },
          {
            id: "raise-the-bar",
            label: "Increase scope back to the previous level and watch whether it holds.",
            response: "Morgan handles it, but the abrupt jump creates new pressure before the recovery has fully stabilized.",
            effects: { trust: -3, clarity: 6, accountability: 8, delivery: 7 },
          },
          {
            id: "move-forward",
            label: "Do not make a big moment of it — just resume normal working cadence.",
            response: "Things are functional again, but Morgan does not feel the relationship has been repaired.",
            effects: { trust: 2, clarity: 4, accountability: 5, delivery: 6 },
          },
        ],
        end: true,
      },
    ],
  },
  {
    id: "scope-creep",
    title: "The expanding sprint",
    description: "Practice holding scope boundaries with stakeholders while keeping the team from burning out mid-delivery.",
    startNodeId: "start",
    nodes: [
      {
        id: "start",
        prompt: "Halfway through a three-week sprint, a senior stakeholder adds two new requirements directly to the team's Slack channel, framing them as small and urgent. Three engineers have already asked you privately if the sprint goal is still valid. What do you do first?",
        choices: [
          {
            id: "team-first",
            label: "Meet with the team before responding to the stakeholder — reaffirm the sprint goal and ask them to flag any direct asks to you.",
            response: "The team feels protected. Two engineers say this is the first time someone held the line for them.",
            effects: { trust: 13, clarity: 9, accountability: 7, delivery: 5 },
            nextNodeId: "stakeholder-response",
          },
          {
            id: "stakeholder-first",
            label: "Respond to the stakeholder immediately to understand what is driving the urgency before deciding anything.",
            response: "One ask turns out to be genuinely urgent; the other is preference, not need. You now have information to make a real trade-off.",
            effects: { trust: 4, clarity: 12, accountability: 5, delivery: 4 },
            nextNodeId: "stakeholder-response",
          },
          {
            id: "absorb",
            label: "Tell the team to absorb the smaller one and flag the larger one for next sprint.",
            response: "The team accommodates it, but the precedent is set. Two more requests arrive by end of week.",
            effects: { trust: -8, clarity: -6, accountability: -5, delivery: -7 },
            nextNodeId: "escalation",
          },
        ],
      },
      {
        id: "stakeholder-response",
        prompt: "The stakeholder insists at least one new item must ship this sprint. How do you respond?",
        choices: [
          {
            id: "explicit-trade",
            label: "Agree to add it only if something of equivalent size is removed — and ask the stakeholder to decide what comes out.",
            response: "The stakeholder is initially frustrated, then picks a deprioritization. The trade-off is now theirs to own.",
            effects: { trust: 8, clarity: 14, accountability: 13, delivery: 7 },
            nextNodeId: "team-impact",
          },
          {
            id: "negotiate-scope",
            label: "Break the request into a smaller slice that can fit, and defer the rest.",
            response: "The stakeholder agrees. The team can accommodate it without disrupting the sprint goal.",
            effects: { trust: 7, clarity: 10, accountability: 8, delivery: 9 },
            nextNodeId: "team-impact",
          },
          {
            id: "escalate-up",
            label: "Tell the stakeholder this decision needs to go to your manager and theirs — you will not absorb it unilaterally.",
            response: "The escalation resolves the immediate request, but the stakeholder relationship cools noticeably.",
            effects: { trust: 2, clarity: 9, accountability: 6, delivery: 3 },
            nextNodeId: "team-impact",
          },
        ],
      },
      {
        id: "escalation",
        prompt: "Scope has continued to grow. Two engineers say they are working evenings to keep up and one has asked to be moved to a different team. What is your next move?",
        choices: [
          {
            id: "hard-stop",
            label: "Call a sprint reset: stop new work, re-scope to what is achievable, and communicate the change to all stakeholders.",
            response: "Some stakeholders are frustrated, but the team's working hours normalize within a week.",
            effects: { trust: 9, clarity: 13, accountability: 10, delivery: -5 },
            nextNodeId: "team-impact",
          },
          {
            id: "push-through",
            label: "Acknowledge the strain but ask the team to hold on for this sprint — promise to fix the process after.",
            response: "The sprint completes, but trust in the promise is low. The engineer who asked to transfer submits a formal request.",
            effects: { trust: -10, clarity: 3, accountability: -4, delivery: 8 },
            nextNodeId: "team-impact",
          },
        ],
      },
      {
        id: "team-impact",
        prompt: "The sprint closes. The team is exhausted and morale is visibly lower than it was a month ago. How do you address it going into the next cycle?",
        choices: [
          {
            id: "retrospective-contract",
            label: "Run a retro focused specifically on scope discipline — and co-create a written process with the team for handling mid-sprint requests.",
            response: "The team owns the new process and enforces it. Mid-sprint additions drop sharply next quarter.",
            effects: { trust: 11, clarity: 14, accountability: 13, delivery: 10 },
          },
          {
            id: "buffer-sprint",
            label: "Plan the next sprint at 70% capacity to let the team recover, without telling stakeholders why.",
            response: "The team appreciates the breathing room, but the root cause with stakeholders is untouched.",
            effects: { trust: 8, clarity: -4, accountability: -5, delivery: 4 },
          },
          {
            id: "individual-checkins",
            label: "Do individual check-ins with each engineer and address morale one person at a time.",
            response: "People feel heard, but systemic scope pressure continues because no stakeholder expectation has changed.",
            effects: { trust: 9, clarity: -2, accountability: -4, delivery: 2 },
          },
        ],
        end: true,
      },
    ],
  },
  {
    id: "promotion-request",
    title: "The premature promotion",
    description: "Practice navigating a promotion conversation honestly when you believe the team member is not yet ready.",
    startNodeId: "start",
    nodes: [
      {
        id: "start",
        prompt: "Taylor, a mid-level engineer, asks for a meeting and opens by saying they believe they are ready for a senior promotion. You do not share that view — their technical work is strong but their cross-team influence and handling of ambiguity are inconsistent. How do you open your response?",
        choices: [
          {
            id: "honest-gap",
            label: "Tell Taylor directly that you do not think the timing is right, and explain specifically what is missing.",
            response: "Taylor is visibly disappointed but asks clarifying questions. The conversation stays substantive.",
            effects: { trust: 8, clarity: 15, accountability: 11, delivery: 3 },
            nextNodeId: "gap-discussion",
          },
          {
            id: "process-deflect",
            label: "Explain that promotion decisions involve a committee and timing factors outside your control — and leave the assessment vague.",
            response: "Taylor leaves the meeting unclear on where they stand. They interpret it as a soft no but do not know what to fix.",
            effects: { trust: -7, clarity: -12, accountability: -8, delivery: -3 },
            nextNodeId: "gap-discussion",
          },
          {
            id: "encourage-apply",
            label: "Say you will support them in putting together a case and see how the committee responds.",
            response: "Taylor invests weeks preparing. The case is declined. Taylor feels misled about where you stood.",
            effects: { trust: -10, clarity: -8, accountability: -6, delivery: -4 },
            nextNodeId: "gap-discussion",
          },
        ],
      },
      {
        id: "gap-discussion",
        prompt: "Taylor asks what specifically they need to demonstrate to be ready. How concrete do you get?",
        choices: [
          {
            id: "written-criteria",
            label: "Agree on two or three concrete observable behaviors and put them in writing with a rough timeline.",
            response: "Taylor has a clear target. Over the following weeks they begin actively seeking opportunities in those areas.",
            effects: { trust: 12, clarity: 15, accountability: 13, delivery: 6 },
            nextNodeId: "progress-check",
          },
          {
            id: "verbal-examples",
            label: "Give examples of what senior-level behavior looks like in your team, but keep the path informal.",
            response: "Taylor appreciates the examples but revisits the conversation three months later with different assumptions about the timeline.",
            effects: { trust: 7, clarity: 7, accountability: 5, delivery: 3 },
            nextNodeId: "progress-check",
          },
          {
            id: "compare-peers",
            label: "Point to specific ways senior engineers on the team handle ambiguity differently, using real examples.",
            response: "The comparison is clarifying but lands as faint criticism of Taylor's current work. Trust dips briefly.",
            effects: { trust: -3, clarity: 11, accountability: 8, delivery: 2 },
            nextNodeId: "progress-check",
          },
        ],
      },
      {
        id: "progress-check",
        prompt: "Three months in, Taylor has improved noticeably in some areas but not others. A peer manager quietly asks if Taylor is being groomed for senior — they would like to promote someone on their own team first. How do you handle this?",
        choices: [
          {
            id: "stay-course",
            label: "Tell the peer manager the timing depends on Taylor's demonstrated readiness — not a competitive slot — and hold that position.",
            response: "The peer manager is not happy but respects the clarity. Taylor is not affected by the side conversation.",
            effects: { trust: 10, clarity: 13, accountability: 12, delivery: 5 },
            nextNodeId: "decision",
          },
          {
            id: "soft-delay",
            label: "Tell Taylor that the business timing has shifted and revisit the timeline without explaining the full context.",
            response: "Taylor is frustrated by the vague delay. They begin interviewing externally within six weeks.",
            effects: { trust: -12, clarity: -8, accountability: -9, delivery: -7 },
            nextNodeId: "decision",
          },
          {
            id: "accelerate",
            label: "Decide Taylor is close enough and submit the promotion case now to avoid further politics.",
            response: "Taylor is promoted but struggles with some senior expectations. The peer manager relationship is preserved but Taylor's credibility takes time to build.",
            effects: { trust: 4, clarity: -4, accountability: -5, delivery: -5 },
            nextNodeId: "decision",
          },
        ],
      },
      {
        id: "decision",
        prompt: "You are now confident Taylor is ready — or not — and it is promotion cycle time. How do you handle the final conversation?",
        choices: [
          {
            id: "advocate-fully",
            label: "Write a strong case anchored in the specific evidence Taylor demonstrated against the criteria you set together.",
            response: "Taylor is promoted. They reference the criteria conversation as the most useful feedback they have received.",
            effects: { trust: 14, clarity: 12, accountability: 13, delivery: 10 },
          },
          {
            id: "defer-again",
            label: "Tell Taylor they are almost there — one more cycle — without a specific remaining gap.",
            response: "Taylor updates their resume that evening. They leave within the quarter.",
            effects: { trust: -14, clarity: -10, accountability: -10, delivery: -8 },
          },
          {
            id: "honest-not-ready",
            label: "Tell Taylor clearly they are not ready yet, name the remaining gap, and commit to a concrete check-in in 90 days.",
            response: "Taylor is disappointed but stays. The clarity preserves the relationship even without the outcome they wanted.",
            effects: { trust: 9, clarity: 14, accountability: 11, delivery: 4 },
          },
        ],
        end: true,
      },
    ],
  },
];
