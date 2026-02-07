"use client";

import { useState, useCallback } from "react";
import Chart from "@/components/Chart";
import SymbolSearch from "@/components/SymbolSearch";
import TimeframeSelector from "@/components/TimeframeSelector";
import MarketTabs from "@/components/MarketTabs";
import { useMarketData } from "@/hooks/useMarketData";
import { PanelState, MarketType, DEFAULT_SYMBOL } from "@/types/market";

interface Props {
  panel: PanelState;
  isActive: boolean;
  onActivate: () => void;
  onUpdate: (patch: Partial<PanelState>) => void;
  onRemove: () => void;
  showRemove: boolean;
  isInWatchlist: boolean;
  onToggleWatchlist: () => void;
}

export default function ChartPanel({
  panel,
  isActive,
  onActivate,
  onUpdate,
  onRemove,
  showRemove,
  isInWatchlist,
  onToggleWatchlist,
}: Props) {
  const [showToolbar, setShowToolbar] = useState(false);
  const { data, loading, error } = useMarketData(
    panel.symbol,
    panel.market,
    panel.interval
  );

  const handleMarketChange = useCallback(
    (m: MarketType) => {
      const def = DEFAULT_SYMBOL[m];
      onUpdate({ market: m, symbol: def.symbol, symbolName: def.name });
    },
    [onUpdate]
  );

  const handleSymbolSelect = useCallback(
    (sym: string, name: string) => {
      onUpdate({ symbol: sym, symbolName: name });
    },
    [onUpdate]
  );

  const handleIntervalChange = useCallback(
    (iv: string) => {
      onUpdate({ interval: iv });
    },
    [onUpdate]
  );

  return (
    <div
      className={`relative flex flex-col min-h-0 min-w-0 bg-cb-bg border rounded transition-colors ${
        isActive ? "border-cb-accent" : "border-cb-border"
      }`}
      onClick={onActivate}
      onMouseEnter={() => setShowToolbar(true)}
      onMouseLeave={() => setShowToolbar(false)}
    >
      {/* Panel header — always visible */}
      <div className="flex items-center justify-between px-2 py-1 bg-cb-panel border-b border-cb-border shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <SymbolSearch
            market={panel.market}
            currentSymbol={panel.symbol}
            onSelect={handleSymbolSelect}
          />
          <span className="text-xs text-cb-muted truncate hidden sm:inline">
            {panel.symbolName}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist();
            }}
            className={`p-1 transition-colors rounded hover:bg-cb-border ${
              isInWatchlist ? "text-yellow-400" : "text-cb-muted hover:text-yellow-400"
            }`}
            title={isInWatchlist ? "ウォッチリストから削除" : "ウォッチリストに追加"}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={isInWatchlist ? "currentColor" : "none"} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
          {showRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-1 text-cb-muted hover:text-cb-red transition-colors rounded hover:bg-cb-border"
              title="パネルを削除"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Expandable toolbar — market tabs + timeframe */}
      {showToolbar && (
        <div className="flex items-center gap-2 px-2 py-1 bg-cb-panel/80 border-b border-cb-border shrink-0 overflow-x-auto">
          <MarketTabs active={panel.market} onChange={handleMarketChange} compact />
          <div className="h-3 w-px bg-cb-border shrink-0" />
          <TimeframeSelector active={panel.interval} onChange={handleIntervalChange} compact />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-2 py-1 bg-red-900/30 text-red-400 text-xs shrink-0">
          {error}
        </div>
      )}

      {/* Chart */}
      <Chart data={data} loading={loading} />
    </div>
  );
}
