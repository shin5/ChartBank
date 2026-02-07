"use client";

import { LayoutMode, LAYOUT_OPTIONS } from "@/types/market";

interface Props {
  active: LayoutMode;
  onChange: (layout: LayoutMode) => void;
}

export default function LayoutSelector({ active, onChange }: Props) {
  return (
    <div className="flex items-center gap-1">
      {LAYOUT_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          title={opt.label}
          className={`relative w-7 h-7 rounded border transition-colors flex items-center justify-center ${
            active === opt.key
              ? "border-cb-accent bg-cb-accent/20"
              : "border-cb-border hover:border-cb-muted bg-cb-panel"
          }`}
        >
          <LayoutIcon layout={opt.key} active={active === opt.key} />
        </button>
      ))}
    </div>
  );
}

function LayoutIcon({ layout, active }: { layout: LayoutMode; active: boolean }) {
  const fill = active ? "#2962ff" : "#787b86";
  const gap = 1;

  const icons: Record<LayoutMode, React.ReactNode> = {
    "1": (
      <svg viewBox="0 0 18 18" className="w-4 h-4">
        <rect x="1" y="1" width="16" height="16" rx="1" fill={fill} opacity={0.6} />
      </svg>
    ),
    "2h": (
      <svg viewBox="0 0 18 18" className="w-4 h-4">
        <rect x="1" y="1" width="7" height="16" rx="1" fill={fill} opacity={0.6} />
        <rect x="10" y="1" width="7" height="16" rx="1" fill={fill} opacity={0.6} />
      </svg>
    ),
    "2v": (
      <svg viewBox="0 0 18 18" className="w-4 h-4">
        <rect x="1" y="1" width="16" height="7" rx="1" fill={fill} opacity={0.6} />
        <rect x="1" y="10" width="16" height="7" rx="1" fill={fill} opacity={0.6} />
      </svg>
    ),
    "3": (
      <svg viewBox="0 0 18 18" className="w-4 h-4">
        <rect x="1" y="1" width="10" height="16" rx="1" fill={fill} opacity={0.6} />
        <rect x="13" y="1" width="4" height="7" rx="1" fill={fill} opacity={0.6} />
        <rect x="13" y="10" width="4" height="7" rx="1" fill={fill} opacity={0.6} />
      </svg>
    ),
    "4": (
      <svg viewBox="0 0 18 18" className="w-4 h-4">
        <rect x="1" y="1" width="7" height="7" rx="1" fill={fill} opacity={0.6} />
        <rect x="10" y="1" width="7" height="7" rx="1" fill={fill} opacity={0.6} />
        <rect x="1" y="10" width="7" height="7" rx="1" fill={fill} opacity={0.6} />
        <rect x="10" y="10" width="7" height="7" rx="1" fill={fill} opacity={0.6} />
      </svg>
    ),
    "6": (
      <svg viewBox="0 0 18 18" className="w-4 h-4">
        <rect x="1" y="1" width="4.7" height="7" rx="1" fill={fill} opacity={0.6} />
        <rect x="7" y="1" width="4.7" height="7" rx="1" fill={fill} opacity={0.6} />
        <rect x="13" y="1" width="4.7" height="7" rx="1" fill={fill} opacity={0.6} />
        <rect x="1" y="10" width="4.7" height="7" rx="1" fill={fill} opacity={0.6} />
        <rect x="7" y="10" width="4.7" height="7" rx="1" fill={fill} opacity={0.6} />
        <rect x="13" y="10" width="4.7" height="7" rx="1" fill={fill} opacity={0.6} />
      </svg>
    ),
  };

  return icons[layout] ?? null;
}
