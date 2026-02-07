"use client";

import { useState, useCallback, useMemo } from "react";
import Header from "@/components/Header";
import PanelGrid from "@/components/PanelGrid";
import Watchlist from "@/components/Watchlist";
import WatchlistDashboard from "@/components/WatchlistDashboard";
import {
  PanelState,
  LayoutMode,
  ViewMode,
  LAYOUT_PANEL_COUNT,
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

const INITIAL_DEFAULTS: { market: MarketType; symbol: string; name: string }[] = [
  { market: "stocks", symbol: "AAPL", name: "Apple Inc." },
  { market: "crypto", symbol: "BTC/USDT", name: "Bitcoin" },
  { market: "forex", symbol: "EURUSD=X", name: "EUR/USD" },
  { market: "indices", symbol: "^GSPC", name: "S&P 500" },
  { market: "commodities", symbol: "GC=F", name: "Gold" },
  { market: "futures", symbol: "ES=F", name: "E-Mini S&P 500" },
];

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
  const [layout, setLayout] = useState<LayoutMode>("1");
  const [panels, setPanels] = useState<PanelState[]>([makePanel()]);
  const [activeId, setActiveId] = useState<string | null>(panels[0]?.id ?? null);
  const [showWatchlist, setShowWatchlist] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("chart");
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>(DEFAULT_WATCHLIST);

  const maxPanels = LAYOUT_PANEL_COUNT[layout];

  const handleLayoutChange = useCallback(
    (newLayout: LayoutMode) => {
      const needed = LAYOUT_PANEL_COUNT[newLayout];
      setPanels((prev) => {
        if (prev.length >= needed) return prev.slice(0, needed);
        const extra: PanelState[] = [];
        for (let i = prev.length; i < needed; i++) {
          const d = INITIAL_DEFAULTS[i % INITIAL_DEFAULTS.length];
          extra.push(makePanel(d.market, d.symbol, d.name));
        }
        return [...prev, ...extra];
      });
      setLayout(newLayout);
    },
    []
  );

  const handleAddPanel = useCallback(() => {
    setPanels((prev) => {
      if (prev.length >= maxPanels) return prev;
      const idx = prev.length % INITIAL_DEFAULTS.length;
      const d = INITIAL_DEFAULTS[idx];
      return [...prev, makePanel(d.market, d.symbol, d.name)];
    });
  }, [maxPanels]);

  const handleUpdatePanel = useCallback(
    (id: string, patch: Partial<PanelState>) => {
      setPanels((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
      );
    },
    []
  );

  const handleRemovePanel = useCallback(
    (id: string) => {
      setPanels((prev) => {
        const next = prev.filter((p) => p.id !== id);
        if (next.length === 0) return prev;
        return next;
      });
      setActiveId((prev) => (prev === id ? null : prev));
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

  /** Open a watchlist symbol in a new panel (or replace active if at max). */
  const handleOpenInNewPanel = useCallback(
    (symbol: string, name: string, market: MarketType) => {
      setPanels((prev) => {
        if (prev.length >= maxPanels) {
          const tid = activeId ?? prev[0]?.id;
          return prev.map((p) =>
            p.id === tid ? { ...p, symbol, symbolName: name, market } : p
          );
        }
        return [...prev, makePanel(market, symbol, name)];
      });
    },
    [maxPanels, activeId]
  );

  /** Fill panels with all watchlist items, auto-selecting the best layout. */
  const handleOpenAllInPanels = useCallback(() => {
    const count = watchlistItems.length;
    if (count === 0) return;
    let newLayout: LayoutMode;
    if (count <= 1) newLayout = "1";
    else if (count <= 2) newLayout = "2h";
    else if (count <= 3) newLayout = "3";
    else if (count <= 4) newLayout = "4";
    else newLayout = "6";

    const needed = LAYOUT_PANEL_COUNT[newLayout];
    const newPanels = watchlistItems
      .slice(0, needed)
      .map((item) => makePanel(item.market, item.symbol, item.name));
    while (newPanels.length < needed) {
      const idx = newPanels.length % INITIAL_DEFAULTS.length;
      const d = INITIAL_DEFAULTS[idx];
      newPanels.push(makePanel(d.market, d.symbol, d.name));
    }

    setLayout(newLayout);
    setPanels(newPanels);
    setActiveId(newPanels[0]?.id ?? null);
  }, [watchlistItems]);

  return (
    <div className="flex flex-col h-screen">
      <Header
        layout={layout}
        onLayoutChange={handleLayoutChange}
        onAddPanel={handleAddPanel}
        panelCount={panels.length}
        maxPanels={maxPanels}
        showWatchlist={showWatchlist}
        onToggleWatchlist={() => setShowWatchlist((v) => !v)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <div className="flex flex-1 min-h-0">
        {viewMode === "chart" ? (
          <PanelGrid
            layout={layout}
            panels={panels}
            activeId={activeId}
            onActivate={setActiveId}
            onUpdatePanel={handleUpdatePanel}
            onRemovePanel={handleRemovePanel}
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
          />
        )}
        {showWatchlist && (
          <div className="w-72 shrink-0">
            <Watchlist
              items={watchlistItems}
              onClickSymbol={handleWatchlistClick}
              onRemoveItem={handleRemoveWatchlistItem}
              onAddItem={handleAddWatchlistItem}
              onOpenInPanel={handleOpenInNewPanel}
              onOpenAllInPanels={handleOpenAllInPanels}
            />
          </div>
        )}
      </div>
    </div>
  );
}
