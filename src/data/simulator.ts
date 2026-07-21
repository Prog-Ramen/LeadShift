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
      },
    ],
  },
];
