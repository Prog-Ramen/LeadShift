"use client";

import { useState } from "react";
import { RadarChart } from "@/components/RadarChart";
import { getArchetypeMatches } from "@/lib/engine";
import type { ManagementProfile } from "@/lib/types";

interface ProfileSummaryProps {
  title: string;
  label: string;
  profile: ManagementProfile;
  comparison?: ManagementProfile;
  currentLabel?: string;
  comparisonLabel?: string;
  action?: React.ReactNode;
  info?: { what: string; ghost?: string; why?: string };
}

function InfoPopover({ info }: { info: NonNullable<ProfileSummaryProps["info"]> }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="info-popover-wrap">
      <button
        className="info-trigger"
        aria-label="What does this graph show?"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
      >
        ?
      </button>
      {open && (
        <div className="info-popover" role="tooltip">
          <div className="info-popover__row">
            <span className="info-popover__icon">◆</span>
            <div>
              <strong>Solid shape</strong>
              <p>{info.what}</p>
            </div>
          </div>
          {info.ghost && (
            <div className="info-popover__row">
              <span className="info-popover__icon info-popover__icon--ghost">◇</span>
              <div>
                <strong>Ghost outline</strong>
                <p>{info.ghost}</p>
              </div>
            </div>
          )}
          {info.why && (
            <div className="info-popover__row info-popover__row--why">
              <span className="info-popover__icon">→</span>
              <div>
                <strong>What to do with this</strong>
                <p>{info.why}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </span>
  );
}

export function ProfileSummary({ title, label, profile, comparison, currentLabel, comparisonLabel, action, info }: ProfileSummaryProps) {
  const matches = getArchetypeMatches(profile).slice(0, 3);
  return (
    <article className="profile-summary-card">
      <div className="profile-summary-card__head">
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div>
            <span className="section-kicker">{label}</span>
            <h3>{title}</h3>
          </div>
          {info && <InfoPopover info={info} />}
        </div>
        {action}
      </div>
      <RadarChart profile={profile} comparison={comparison} compact currentLabel={currentLabel} comparisonLabel={comparisonLabel} />
      <div className="blend-list">
        {matches.map((match, index) => (
          <div className="blend-row" key={match.archetype.code}>
            <span className="blend-rank">{index + 1}</span>
            <div>
              <strong>{match.archetype.name}</strong>
              <small>{match.reasons.join(" · ")}</small>
            </div>
            <b>{match.confidence}%</b>
          </div>
        ))}
      </div>
    </article>
  );
}
