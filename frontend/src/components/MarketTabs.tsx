"use client";

import { MarketType, MARKETS } from "@/types/market";

interface Props {
  active: MarketType;
  onChange: (m: MarketType) => void;
  compact?: boolean;
}

export default function MarketTabs({ active, onChange, compact }: Props) {
  if (compact) {
    return (
      <div className="flex gap-0.5 items-center">
        {MARKETS.map((m) => (
          <button
            key={m.key}
            onClick={(e) => { e.stopPropagation(); onChange(m.key); }}
            className={`px-1.5 py-0.5 text-[10px] rounded whitespace-nowrap transition-colors ${
              active === m.key
                ? "bg-cb-accent text-white"
                : "text-cb-muted hover:text-cb-text hover:bg-cb-border"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-1 px-4 py-2 bg-cb-panel border-b border-cb-border overflow-x-auto">
      {MARKETS.map((m) => (
        <button
          key={m.key}
          onClick={() => onChange(m.key)}
          className={`px-3 py-1.5 text-sm rounded whitespace-nowrap transition-colors ${
            active === m.key
              ? "bg-cb-accent text-white"
              : "text-cb-muted hover:text-cb-text hover:bg-cb-border"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
