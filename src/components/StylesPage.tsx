"use client";

import { RadarChart } from "@/components/RadarChart";
import { getArchetypeCode } from "@/lib/engine";
import { ARCHETYPES } from "@/data/archetypes";
import type { ManagementProfile } from "@/lib/types";

interface StylesPageProps {
  natural: ManagementProfile;
  working: ManagementProfile;
  recommended: ManagementProfile;
  onEditNatural: () => void;
  onEditWorking: () => void;
  onEditRecommended: () => void;
  onGoToPractice: () => void;
  onGoToJourney: () => void;
  onShare: () => void;
  darkMode: boolean;
}

export function StylesPage({
  natural, working, recommended,
  onEditNatural, onEditWorking, onEditRecommended,
  onGoToPractice, onGoToJourney, onShare,
  darkMode,
}: StylesPageProps) {
  const naturalCode = getArchetypeCode(natural);
  const workingCode = getArchetypeCode(working);
  const recommendedCode = getArchetypeCode(recommended);

  const naturalArch = ARCHETYPES.find((a) => a.code === naturalCode);
  const workingArch = ARCHETYPES.find((a) => a.code === workingCode);
  const recommendedArch = ARCHETYPES.find((a) => a.code === recommendedCode);

  return (
    <div className="styles-page-shell" data-theme={darkMode ? "dark" : "light"}>
      <div className="styles-page-header">
        <h1>Your Management Profiles</h1>
        <p>Three views of your leadership style. Edit any profile to adjust.</p>
      </div>

      {/* Three side-by-side columns */}
      <div className="styles-page-columns">
        {/* Natural */}
        <article className="styles-page-card">
          <div className="styles-page-card__head">
            <span className="section-kicker">Instinctive</span>
            <h3>Natural Default</h3>
          </div>
          <RadarChart profile={natural} compact />
          <div className="styles-page-card__archetype">
            <span className="archetype-code-badge">{naturalCode}</span>
            <span>{naturalArch?.name}</span>
          </div>
          <button className="text-button" onClick={onEditNatural}>Edit</button>
        </article>

        {/* Working */}
        <article className="styles-page-card styles-page-card--featured">
          <div className="styles-page-card__head">
            <span className="section-kicker">Deliberate</span>
            <h3>Working Mode</h3>
          </div>
          <RadarChart profile={working} compact comparison={natural} />
          <div className="styles-page-card__archetype">
            <span className="archetype-code-badge">{workingCode}</span>
            <span>{workingArch?.name}</span>
          </div>
          <button className="text-button" onClick={onEditWorking}>Edit</button>
        </article>

        {/* Recommended */}
        <article className="styles-page-card">
          <div className="styles-page-card__head">
            <span className="section-kicker">Context-aware</span>
            <h3>Recommended</h3>
          </div>
          <RadarChart profile={recommended} compact comparison={working} />
          <div className="styles-page-card__archetype">
            <span className="archetype-code-badge">{recommendedCode}</span>
            <span>{recommendedArch?.name}</span>
          </div>
          <button className="text-button" onClick={onEditRecommended}>Edit</button>
        </article>
      </div>

      {/* Action buttons */}
      <div className="styles-page-actions">
        <button className="button button--primary" onClick={onGoToPractice}>Go to Practice</button>
        <button className="button button--ghost" onClick={onGoToJourney}>Go to Journey</button>
        <button className="button button--ghost" onClick={onShare}>Share</button>
      </div>
    </div>
  );
}
