"use client";

import { useState, useCallback } from "react";
import Header from "@/components/Header";
import PanelGrid from "@/components/PanelGrid";
import WatchlistDashboard from "@/components/WatchlistDashboard";
import {
  PanelState,
  ViewMode,
  DEFAULT_SYMBOL,
  MarketType,
  WatchlistItem,
} from "@/types/market";

let nextId = 1;
function makePanel(
  market: MarketType = "stocks",
  symbol?: string,
  symbolName?: string
): PanelState {
  const def = DEFAULT_SYMBOL[market];
  return {
    id: String(nextId++),
    symbol: symbol ?? def.symbol,
    symbolName: symbolName ?? def.name,
    market,
    interval: "1d",
  };
}

const DEFAULT_WATCHLIST: WatchlistItem[] = [
  { symbol: "AAPL", name: "Apple Inc.", market: "stocks" },
  { symbol: "MSFT", name: "Microsoft Corp.", market: "stocks" },
  { symbol: "GOOGL", name: "Alphabet Inc.", market: "stocks" },
  { symbol: "BTC/USDT", name: "Bitcoin", market: "crypto" },
  { symbol: "ETH/USDT", name: "Ethereum", market: "crypto" },
  { symbol: "EURUSD=X", name: "EUR/USD", market: "forex" },
  { symbol: "USDJPY=X", name: "USD/JPY", market: "forex" },
  { symbol: "GC=F", name: "Gold", market: "commodities" },
  { symbol: "^GSPC", name: "S&P 500", market: "indices" },
  { symbol: "^N225", name: "Nikkei 225", market: "indices" },
];

export default function Home() {
  const [panels, setPanels] = useState<PanelState[]>([makePanel()]);
  const [activeId, setActiveId] = useState<string | null>(panels[0]?.id ?? null);
  const [viewMode, setViewMode] = useState<ViewMode>("chart");
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>(DEFAULT_WATCHLIST);

  const handleUpdatePanel = useCallback(
    (id: string, patch: Partial<PanelState>) => {
      setPanels((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
      );
    },
    []
  );

  /** Clicking a watchlist symbol opens it in the active panel (or the first). */
  const handleWatchlistClick = useCallback(
    (symbol: string, name: string, market: MarketType) => {
      const targetId = activeId ?? panels[0]?.id;
      if (!targetId) return;
      handleUpdatePanel(targetId, { symbol, symbolName: name, market });
    },
    [activeId, panels, handleUpdatePanel]
  );

  const handleRemoveWatchlistItem = useCallback((symbol: string) => {
    setWatchlistItems((prev) => prev.filter((it) => it.symbol !== symbol));
  }, []);

  const handleAddWatchlistItem = useCallback((item: WatchlistItem) => {
    setWatchlistItems((prev) => {
      if (prev.some((it) => it.symbol === item.symbol)) return prev;
      return [...prev, item];
    });
  }, []);

  const handleReorderItems = useCallback((newItems: WatchlistItem[]) => {
    setWatchlistItems(newItems);
  }, []);

  const handleToggleWatchlist = useCallback(
    (symbol: string, name: string, market: string) => {
      setWatchlistItems((prev) => {
        if (prev.some((it) => it.symbol === symbol)) {
          return prev.filter((it) => it.symbol !== symbol);
        }
        return [...prev, { symbol, name, market: market as MarketType }];
      });
    },
    []
  );

  return (
    <div className="flex flex-col h-screen">
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <div className="flex flex-1 min-h-0">
        {viewMode === "chart" ? (
          <PanelGrid
            layout="1"
            panels={panels}
            activeId={activeId}
            onActivate={setActiveId}
            onUpdatePanel={handleUpdatePanel}
            onRemovePanel={() => {}}
            watchlistItems={watchlistItems}
            onToggleWatchlist={handleToggleWatchlist}
          />
        ) : (
          <WatchlistDashboard
            items={watchlistItems}
            onClickSymbol={(symbol, name, market) => {
              setViewMode("chart");
              handleWatchlistClick(symbol, name, market);
            }}
            onRemoveItem={handleRemoveWatchlistItem}
            onAddItem={handleAddWatchlistItem}
            onReorderItems={handleReorderItems}
          />
        )}

      </div>
    </div>
  );
}
