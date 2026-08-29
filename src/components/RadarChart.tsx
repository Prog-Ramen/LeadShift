import { DIMENSIONS } from "@/data/dimensions";
import type { DimensionKey, ManagementProfile } from "@/lib/types";
import type { StyleMilestone } from "@/data/tracks";

interface RadarChartProps {
  profile: ManagementProfile;
  comparison?: ManagementProfile;
  compact?: boolean;
  activeDimension?: DimensionKey;
  currentLabel?: string;
  comparisonLabel?: string;
}

const SIZE = 320;
const CENTER = SIZE / 2;
const RADIUS = 112;

const pointAt = (index: number, value: number, count: number) => {
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / count;
  const radius = (value / 100) * RADIUS;
  return {
    x: CENTER + Math.cos(angle) * radius,
    y: CENTER + Math.sin(angle) * radius,
  };
};

const axisOuter = (index: number, count: number) => {
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / count;
  return {
    x: CENTER + Math.cos(angle) * RADIUS,
    y: CENTER + Math.sin(angle) * RADIUS,
  };
};

const polygonPoints = (profile: ManagementProfile) =>
  DIMENSIONS.map((dimension, index) => {
    const point = pointAt(index, profile[dimension.key], DIMENSIONS.length);
    return `${point.x},${point.y}`;
  }).join(" ");

export function RadarChart({
  profile,
  comparison,
  compact = false,
  activeDimension,
  currentLabel = "Current",
  comparisonLabel = "Comparison",
}: RadarChartProps) {
  const rings = [20, 40, 60, 80, 100];

  return (
    <div className={compact ? "radar radar--compact" : "radar"}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label="Radar chart of the current management style"
      >
        {rings.map((ring) => (
          <polygon
            key={ring}
            points={DIMENSIONS.map((_, index) => {
              const point = pointAt(index, ring, DIMENSIONS.length);
              return `${point.x},${point.y}`;
            }).join(" ")}
            className="radar__ring"
          />
        ))}

        {DIMENSIONS.map((dimension, index) => {
          const outer = axisOuter(index, DIMENSIONS.length);
          const labelPt = pointAt(index, 122, DIMENSIONS.length);
          const isActive = dimension.key === activeDimension;
          return (
            <g key={dimension.key}>
              <line
                x1={CENTER}
                y1={CENTER}
                x2={outer.x}
                y2={outer.y}
                className={isActive ? "radar__axis radar__axis--active" : "radar__axis"}
              />
              {!compact && (
                <text
                  x={labelPt.x}
                  y={labelPt.y}
                  textAnchor={labelPt.x < CENTER - 10 ? "end" : labelPt.x > CENTER + 10 ? "start" : "middle"}
                  dominantBaseline="middle"
                  className={isActive ? "radar__label radar__label--active" : "radar__label"}
                >
                  {dimension.shortName}
                </text>
              )}
            </g>
          );
        })}

        {comparison && (
          <polygon
            points={polygonPoints(comparison)}
            className="radar__comparison"
          />
        )}
        <polygon points={polygonPoints(profile)} className="radar__profile" />

        {DIMENSIONS.map((dimension, index) => {
          const point = pointAt(index, profile[dimension.key], DIMENSIONS.length);
          const isActive = dimension.key === activeDimension;
          return (
            <circle
              key={dimension.key}
              cx={point.x}
              cy={point.y}
              r={isActive ? 6 : 3.4}
              className={isActive ? "radar__point radar__point--active" : "radar__point"}
            />
          );
        })}

        {/* Active dimension value label on the axis */}
        {activeDimension && (() => {
          const idx = DIMENSIONS.findIndex((d) => d.key === activeDimension);
          if (idx === -1) return null;
          const pt = pointAt(idx, profile[activeDimension], DIMENSIONS.length);
          const offset = pointAt(idx, profile[activeDimension] + 14, DIMENSIONS.length);
          return (
            <text
              x={offset.x}
              y={offset.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="radar__active-value"
            >
              {profile[activeDimension]}
            </text>
          );
        })()}
      </svg>
      {comparison && (
        <div className="radar__legend" aria-hidden="true">
          <span><i className="legend-dot legend-dot--current" />{currentLabel}</span>
          <span><i className="legend-dot legend-dot--ideal" />{comparisonLabel}</span>
        </div>
      )}
    </div>
  );
}

// ── Track Evolution Radar ──────────────────────────────────────────────────

const EVO_SIZE = 520;
const EVO_CENTER = EVO_SIZE / 2;
const EVO_RADIUS = 175;
const EVO_LABEL_RADIUS = 195;

const evoPointAt = (index: number, value: number, count: number) => {
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / count;
  const radius = (value / 100) * EVO_RADIUS;
  return {
    x: EVO_CENTER + Math.cos(angle) * radius,
    y: EVO_CENTER + Math.sin(angle) * radius,
  };
};

const evoAxisOuter = (index: number, count: number) => {
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / count;
  return {
    x: EVO_CENTER + Math.cos(angle) * EVO_RADIUS,
    y: EVO_CENTER + Math.sin(angle) * EVO_RADIUS,
  };
};

const evoLabelAt = (index: number, count: number) => {
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / count;
  return {
    x: EVO_CENTER + Math.cos(angle) * EVO_LABEL_RADIUS,
    y: EVO_CENTER + Math.sin(angle) * EVO_LABEL_RADIUS,
  };
};

const evoPolygon = (profile: ManagementProfile) =>
  DIMENSIONS.map((d, i) => {
    const pt = evoPointAt(i, profile[d.key], DIMENSIONS.length);
    return `${pt.x},${pt.y}`;
  }).join(" ");

interface TrackEvolutionRadarProps {
  milestones: StyleMilestone[];
  selectedIndex: number;
  currentIndex: number;
  color: string;
}

export function TrackEvolutionRadar({ milestones, selectedIndex, currentIndex, color }: TrackEvolutionRadarProps) {
  const rings = [20, 40, 60, 80, 100];
  const n = milestones.length;

  return (
    <div className="evolution-radar-wrap">
      <div className="evolution-radar">
        <svg
          viewBox={`0 0 ${EVO_SIZE} ${EVO_SIZE}`}
          role="img"
          aria-label="Management style evolution across track phases"
        >
          {/* Grid rings */}
          {rings.map((ring) => (
            <polygon
              key={ring}
              points={DIMENSIONS.map((_, i) => {
                const pt = evoPointAt(i, ring, DIMENSIONS.length);
                return `${pt.x},${pt.y}`;
              }).join(" ")}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.07}
              strokeWidth={1}
            />
          ))}

          {/* Axes + labels */}
          {DIMENSIONS.map((dim, i) => {
            const outer = evoAxisOuter(i, DIMENSIONS.length);
            const lbl = evoLabelAt(i, DIMENSIONS.length);
            return (
              <g key={dim.key}>
                <line
                  x1={EVO_CENTER} y1={EVO_CENTER}
                  x2={outer.x} y2={outer.y}
                  stroke="currentColor" strokeOpacity={0.1} strokeWidth={1}
                />
                <text
                  x={lbl.x} y={lbl.y}
                  textAnchor={lbl.x < EVO_CENTER - 12 ? "end" : lbl.x > EVO_CENTER + 12 ? "start" : "middle"}
                  dominantBaseline="middle"
                  className="evo-label"
                >
                  {dim.shortName}
                </text>
              </g>
            );
          })}

          {/* Ghost layers — all milestone profiles */}
          {milestones.map((milestone, index) => {
            const isSelected = index === selectedIndex;
            const isPast = index < selectedIndex;
            const isFuture = index > selectedIndex;
            const distancePast = selectedIndex - index;
            const distanceFuture = index - selectedIndex;

            const fillOpacity = isSelected
              ? 0.18
              : isPast
              ? Math.max(0.02, 0.1 - distancePast * 0.025)
              : Math.max(0.01, 0.05 - distanceFuture * 0.01);

            const strokeOpacity = isSelected
              ? 0.9
              : isPast
              ? Math.max(0.12, 0.45 - distancePast * 0.1)
              : Math.max(0.08, 0.2 - distanceFuture * 0.04);

            const strokeWidth = isSelected ? 2.5 : 1.5;
            const fillColor = isPast || isSelected ? color : "#888888";
            const strokeColor = isPast || isSelected ? color : "#888888";

            return (
              <polygon
                key={milestone.label}
                points={evoPolygon(milestone.profile)}
                fill={fillColor}
                fillOpacity={fillOpacity}
                stroke={strokeColor}
                strokeOpacity={strokeOpacity}
                strokeWidth={strokeWidth}
                strokeDasharray={isFuture ? "5 4" : undefined}
                style={{ transition: "fill-opacity 350ms ease, stroke-opacity 350ms ease" }}
              />
            );
          })}

          {/* Selected milestone vertex dots */}
          {DIMENSIONS.map((dim, i) => {
            const pt = evoPointAt(i, milestones[selectedIndex].profile[dim.key], DIMENSIONS.length);
            return (
              <circle
                key={dim.key}
                cx={pt.x} cy={pt.y} r={4}
                fill={color} fillOpacity={0.9}
                stroke="white" strokeWidth={1.5}
              />
            );
          })}

          {/* Current milestone ring accent (if different from selected) */}
          {currentIndex !== selectedIndex && (
            <polygon
              points={evoPolygon(milestones[currentIndex].profile)}
              fill="none"
              stroke={color}
              strokeOpacity={0.55}
              strokeWidth={2}
              strokeDasharray="3 4"
            />
          )}
        </svg>
      </div>

      {/* Dimension trajectory — sparklines per dimension */}
      <div className="evo-trajectory">
        <div className="evo-trajectory__header">
          <span className="section-kicker">Posture trajectory across phases</span>
        </div>
        <div className="evo-trajectory__grid">
          {DIMENSIONS.map((dim) => {
            const values = milestones.map((m) => m.profile[dim.key]);
            const min = Math.min(...values);
            const max = Math.max(...values);
            const range = max - min;
            const svgW = 120;
            const svgH = 28;
            const pad = 4;
            const xStep = (svgW - pad * 2) / Math.max(1, n - 1);
            const yOf = (v: number) =>
              range === 0
                ? svgH / 2
                : pad + ((max - v) / range) * (svgH - pad * 2);
            const points = values.map((v, i) => `${pad + i * xStep},${yOf(v)}`).join(" ");
            return (
              <div key={dim.key} className="evo-dim-row">
                <span className="evo-dim-name">{dim.shortName}</span>
                <svg viewBox={`0 0 ${svgW} ${svgH}`} width={svgW} height={svgH} className="evo-sparkline">
                  <polyline
                    points={points}
                    fill="none"
                    stroke={color}
                    strokeOpacity={0.35}
                    strokeWidth={1.5}
                  />
                  {values.map((v, i) => {
                    const x = pad + i * xStep;
                    const y = yOf(v);
                    const isSelected = i === selectedIndex;
                    const isCur = i === currentIndex;
                    return (
                      <circle
                        key={i}
                        cx={x} cy={y}
                        r={isSelected ? 4 : isCur ? 3 : 2}
                        fill={isSelected ? color : isCur ? color : "currentColor"}
                        fillOpacity={isSelected ? 1 : isCur ? 0.6 : 0.25}
                      />
                    );
                  })}
                </svg>
                <span className="evo-dim-val" style={{ color }}>
                  {milestones[selectedIndex].profile[dim.key]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
