"use client";

import { LayoutMode, PanelState, WatchlistItem } from "@/types/market";
import ChartPanel from "@/components/ChartPanel";

interface Props {
  layout: LayoutMode;
  panels: PanelState[];
  activeId: string | null;
  onActivate: (id: string) => void;
  onUpdatePanel: (id: string, patch: Partial<PanelState>) => void;
  onRemovePanel: (id: string) => void;
  watchlistItems: WatchlistItem[];
  onToggleWatchlist: (symbol: string, name: string, market: string) => void;
}

/**
 * CSS-grid based multi-chart layout.
 * Each LayoutMode maps to a different grid configuration.
 */
export default function PanelGrid({
  layout,
  panels,
  activeId,
  onActivate,
  onUpdatePanel,
  onRemovePanel,
  watchlistItems,
  onToggleWatchlist,
}: Props) {
  const gridClass = GRID_CLASSES[layout] ?? GRID_CLASSES["1"];
  const watchlistSymbols = new Set(watchlistItems.map((w) => w.symbol));

  return (
    <div className={`flex-1 min-h-0 p-1 gap-1 ${gridClass}`}>
      {panels.map((p) => (
        <ChartPanel
          key={p.id}
          panel={p}
          isActive={p.id === activeId}
          onActivate={() => onActivate(p.id)}
          onUpdate={(patch) => onUpdatePanel(p.id, patch)}
          onRemove={() => onRemovePanel(p.id)}
          showRemove={panels.length > 1}
          isInWatchlist={watchlistSymbols.has(p.symbol)}
          onToggleWatchlist={() => onToggleWatchlist(p.symbol, p.symbolName ?? p.symbol, p.market)}
        />
      ))}
    </div>
  );
}

const GRID_CLASSES: Record<LayoutMode, string> = {
  "1":  "grid grid-cols-1 grid-rows-1",
  "2h": "grid grid-cols-2 grid-rows-1",
  "2v": "grid grid-cols-1 grid-rows-2",
  "3":  "grid grid-cols-[2fr_1fr] grid-rows-2 [&>*:first-child]:row-span-2",
  "4":  "grid grid-cols-2 grid-rows-2",
  "6":  "grid grid-cols-3 grid-rows-2",
};
