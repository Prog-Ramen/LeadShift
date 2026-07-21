"use client";

import type { CSSProperties } from "react";
import { DIMENSIONS } from "@/data/dimensions";
import { clamp, describeBand } from "@/lib/engine";
import type { DimensionKey, ManagementProfile } from "@/lib/types";

interface ProfileSlidersProps {
  profile: ManagementProfile;
  onChange: (profile: ManagementProfile) => void;
  activeDimension?: DimensionKey;
  onActiveDimensionChange?: (key: DimensionKey) => void;
  compact?: boolean;
  disabled?: boolean;
}

export function ProfileSliders({
  profile,
  onChange,
  activeDimension,
  onActiveDimensionChange,
  compact = false,
  disabled = false,
}: ProfileSlidersProps) {
  return (
    <div className={compact ? "slider-list slider-list--compact" : "slider-list"}>
      {DIMENSIONS.map((dimension) => {
        const value = profile[dimension.key];
        const active = activeDimension === dimension.key;
        return (
          <div
            className={`slider-card ${active ? "slider-card--active" : ""}`}
            key={dimension.key}
            onClick={() => onActiveDimensionChange?.(dimension.key)}
          >
            <div className="slider-card__header">
              <label htmlFor={`slider-${dimension.key}-${compact ? "compact" : "full"}`}>{dimension.name}</label>
              <span>{value}</span>
            </div>
            <input
              id={`slider-${dimension.key}-${compact ? "compact" : "full"}`}
              type="range"
              min="0"
              max="100"
              step="1"
              value={value}
              disabled={disabled}
              style={{ "--slider-value": `${value}%` } as CSSProperties}
              onChange={(event) => {
                const next = { ...profile, [dimension.key]: clamp(Number(event.target.value)) };
                onChange(next);
                onActiveDimensionChange?.(dimension.key);
              }}
              aria-valuetext={`${value}; ${dimension.lowLabel} to ${dimension.highLabel}`}
            />
            <div className="slider-card__labels">
              <span>{dimension.lowLabel}</span>
              <strong>{describeBand(value)}</strong>
              <span>{dimension.highLabel}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
