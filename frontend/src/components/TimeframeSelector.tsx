"use client";

import { TIMEFRAMES } from "@/types/market";

interface Props {
  active: string;
  onChange: (tf: string) => void;
  compact?: boolean;
}

export default function TimeframeSelector({ active, onChange, compact }: Props) {
  return (
    <div className="flex gap-0.5 items-center">
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf.key}
          onClick={(e) => { e.stopPropagation(); onChange(tf.key); }}
          className={`${
            compact ? "px-1 py-0.5 text-[10px]" : "px-2 py-1 text-xs"
          } rounded transition-colors whitespace-nowrap ${
            active === tf.key
              ? "bg-cb-accent text-white"
              : "text-cb-muted hover:text-cb-text hover:bg-cb-border"
          }`}
        >
          {tf.label}
        </button>
      ))}
    </div>
  );
}
