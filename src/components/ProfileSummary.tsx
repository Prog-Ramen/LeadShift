import { RadarChart } from "@/components/RadarChart";
import { getArchetypeMatches } from "@/lib/engine";
import type { ManagementProfile } from "@/lib/types";

interface ProfileSummaryProps {
  title: string;
  label: string;
  profile: ManagementProfile;
  comparison?: ManagementProfile;
  action?: React.ReactNode;
}

export function ProfileSummary({ title, label, profile, comparison, action }: ProfileSummaryProps) {
  const matches = getArchetypeMatches(profile).slice(0, 3);
  return (
    <article className="profile-summary-card">
      <div className="profile-summary-card__head">
        <div>
          <span className="section-kicker">{label}</span>
          <h3>{title}</h3>
        </div>
        {action}
      </div>
      <RadarChart profile={profile} comparison={comparison} compact />
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
