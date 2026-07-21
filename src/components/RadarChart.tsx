import { DIMENSIONS } from "@/data/dimensions";
import type { ManagementProfile } from "@/lib/types";

interface RadarChartProps {
  profile: ManagementProfile;
  comparison?: ManagementProfile;
  compact?: boolean;
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

const polygonPoints = (profile: ManagementProfile) =>
  DIMENSIONS.map((dimension, index) => {
    const point = pointAt(index, profile[dimension.key], DIMENSIONS.length);
    return `${point.x},${point.y}`;
  }).join(" ");

export function RadarChart({
  profile,
  comparison,
  compact = false,
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
          const outer = pointAt(index, 100, DIMENSIONS.length);
          const label = pointAt(index, 122, DIMENSIONS.length);
          return (
            <g key={dimension.key}>
              <line
                x1={CENTER}
                y1={CENTER}
                x2={outer.x}
                y2={outer.y}
                className="radar__axis"
              />
              {!compact && (
                <text
                  x={label.x}
                  y={label.y}
                  textAnchor={label.x < CENTER - 10 ? "end" : label.x > CENTER + 10 ? "start" : "middle"}
                  dominantBaseline="middle"
                  className="radar__label"
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
          return (
            <circle
              key={dimension.key}
              cx={point.x}
              cy={point.y}
              r="3.4"
              className="radar__point"
            />
          );
        })}
      </svg>
      {comparison && (
        <div className="radar__legend" aria-hidden="true">
          <span><i className="legend-dot legend-dot--current" />Current</span>
          <span><i className="legend-dot legend-dot--ideal" />Situation ideal</span>
        </div>
      )}
    </div>
  );
}
