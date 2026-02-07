"use client";

import { useWatchlist } from "@/hooks/useWatchlist";
import { fetchSymbols } from "@/lib/api";
import { MarketType, QuoteData, WatchlistItem, SymbolInfo, MARKETS } from "@/types/market";
import { useState, useMemo, useEffect, useRef } from "react";

interface Props {
  items: WatchlistItem[];
  onClickSymbol: (symbol: string, name: string, market: MarketType) => void;
  onRemoveItem: (symbol: string) => void;
  onAddItem: (item: WatchlistItem) => void;
  onOpenInPanel: (symbol: string, name: string, market: MarketType) => void;
  onOpenAllInPanels: () => void;
}

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}

function formatVolume(vol: number): string {
  if (vol >= 1_000_000_000) return (vol / 1_000_000_000).toFixed(1) + "B";
  if (vol >= 1_000_000) return (vol / 1_000_000).toFixed(1) + "M";
  if (vol >= 1_000) return (vol / 1_000).toFixed(1) + "K";
  return String(Math.round(vol));
}

function marketLabel(market: string): string {
  return MARKETS.find((m) => m.key === market)?.label ?? market;
}

export default function Watchlist({ items, onClickSymbol, onRemoveItem, onAddItem, onOpenInPanel, onOpenAllInPanels }: Props) {
  const { quotes, loading, error, refresh } = useWatchlist(items);
  const [filterMarket, setFilterMarket] = useState<string>("");
  const [sortKey, setSortKey] = useState<"symbol" | "change_percent">("symbol");
  const [sortAsc, setSortAsc] = useState(true);
  const [showAddPanel, setShowAddPanel] = useState(false);

  const registered = useMemo(() => new Set(items.map((i) => i.symbol)), [items]);

  const filtered = useMemo(() => {
    let list = [...quotes];
    if (filterMarket) list = list.filter((q) => q.market === filterMarket);
    list.sort((a, b) => {
      const va = sortKey === "symbol" ? a.symbol : a.change_percent;
      const vb = sortKey === "symbol" ? b.symbol : b.change_percent;
      if (typeof va === "string" && typeof vb === "string")
        return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortAsc ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
    return list;
  }, [quotes, filterMarket, sortKey, sortAsc]);

  const handleSort = (key: "symbol" | "change_percent") => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const marketsInData = useMemo(() => {
    const s = new Set(quotes.map((q) => q.market));
    return Array.from(s);
  }, [quotes]);

  return (
    <div className="flex flex-col h-full bg-cb-panel border-l border-cb-border">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-cb-border shrink-0">
        <span className="text-sm font-semibold text-cb-text">ウォッチリスト</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowAddPanel((v) => !v)}
            className={`p-1 transition-colors rounded hover:bg-cb-border ${
              showAddPanel ? "text-cb-accent" : "text-cb-muted hover:text-cb-text"
            }`}
            title="銘柄を追加"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={onOpenAllInPanels}
            className="p-1 text-cb-muted hover:text-cb-text transition-colors rounded hover:bg-cb-border"
            title="パネルに展開"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </button>
          <button
            onClick={refresh}
            disabled={loading}
            className="p-1 text-cb-muted hover:text-cb-text transition-colors rounded hover:bg-cb-border disabled:opacity-40"
            title="更新"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Add symbol panel */}
      {showAddPanel && (
        <AddSymbolPanel
          registered={registered}
          onAdd={(item) => { onAddItem(item); }}
          onClose={() => setShowAddPanel(false)}
        />
      )}

      {/* Filter tabs */}
      <div className="flex gap-0.5 px-2 py-1.5 border-b border-cb-border shrink-0 overflow-x-auto">
        <button
          onClick={() => setFilterMarket("")}
          className={`px-2 py-0.5 text-[10px] rounded whitespace-nowrap ${!filterMarket ? "bg-cb-accent text-white" : "text-cb-muted hover:text-cb-text"}`}
        >
          全て
        </button>
        {marketsInData.map((m) => (
          <button
            key={m}
            onClick={() => setFilterMarket(m)}
            className={`px-2 py-0.5 text-[10px] rounded whitespace-nowrap ${filterMarket === m ? "bg-cb-accent text-white" : "text-cb-muted hover:text-cb-text"}`}
          >
            {marketLabel(m)}
          </button>
        ))}
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-1 px-3 py-1 text-[10px] text-cb-muted border-b border-cb-border shrink-0">
        <button onClick={() => handleSort("symbol")} className="text-left hover:text-cb-text">
          銘柄 {sortKey === "symbol" ? (sortAsc ? "▲" : "▼") : ""}
        </button>
        <span className="text-right w-20">現在値</span>
        <button onClick={() => handleSort("change_percent")} className="text-right w-16 hover:text-cb-text">
          変動 {sortKey === "change_percent" ? (sortAsc ? "▲" : "▼") : ""}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="px-3 py-1 text-[10px] text-red-400 bg-red-900/20 shrink-0">{error}</div>
      )}

      {/* Quotes list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading && quotes.length === 0 && (
          <div className="flex items-center justify-center py-8 text-sm text-cb-muted">
            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            読み込み中...
          </div>
        )}
        {filtered.map((q) => (
          <QuoteRow
            key={q.symbol}
            quote={q}
            onClick={() => onClickSymbol(q.symbol, q.name, q.market as MarketType)}
            onRemove={() => onRemoveItem(q.symbol)}
            onOpenInPanel={() => onOpenInPanel(q.symbol, q.name, q.market as MarketType)}
            removable={items.some((it) => it.symbol === q.symbol)}
          />
        ))}
      </div>
    </div>
  );
}

function QuoteRow({
  quote,
  onClick,
  onRemove,
  onOpenInPanel,
  removable,
}: {
  quote: QuoteData;
  onClick: () => void;
  onRemove: () => void;
  onOpenInPanel: () => void;
  removable: boolean;
}) {
  const isUp = quote.change >= 0;
  const color = isUp ? "text-cb-green" : "text-cb-red";
  const arrow = isUp ? "▲" : "▼";

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className="w-full grid grid-cols-[1fr_auto_auto] gap-1 items-center px-3 py-1.5 text-xs hover:bg-cb-border/50 transition-colors border-b border-cb-border/30"
      >
        {/* Symbol + name */}
        <div className="flex flex-col items-start min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-medium text-cb-text truncate">{quote.symbol}</span>
            <span className="text-[9px] px-1 py-0 rounded bg-cb-border text-cb-muted">
              {marketLabel(quote.market)}
            </span>
          </div>
          <span className="text-[10px] text-cb-muted truncate max-w-full">{quote.name}</span>
        </div>

        {/* Price */}
        <div className="text-right w-20">
          <span className="font-mono text-cb-text">{formatPrice(quote.price)}</span>
          <div className="text-[9px] text-cb-muted">Vol {formatVolume(quote.volume)}</div>
        </div>

        {/* Change */}
        <div className={`text-right w-16 ${color}`}>
          <div className="font-mono text-xs">
            {arrow} {Math.abs(quote.change_percent).toFixed(2)}%
          </div>
          <div className="text-[9px] font-mono">
            {isUp ? "+" : ""}{quote.change > 100 ? quote.change.toFixed(0) : quote.change.toFixed(4)}
          </div>
        </div>
      </button>

      {/* Action buttons — visible on hover */}
      <div className="absolute top-1 right-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onOpenInPanel(); }}
          className="p-0.5 rounded bg-cb-panel/90 text-cb-muted hover:text-cb-accent"
          title="新しいパネルで表示"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
        {removable && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-0.5 rounded bg-cb-panel/90 text-cb-muted hover:text-cb-red"
            title="ウォッチリストから削除"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Add Symbol Search Panel ─── */

function AddSymbolPanel({
  registered,
  onAdd,
  onClose,
}: {
  registered: Set<string>;
  onAdd: (item: WatchlistItem) => void;
  onClose: () => void;
}) {
  const [market, setMarket] = useState<MarketType>("stocks");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SymbolInfo[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetchSymbols(market, query);
        setResults(res.results);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, market]);

  return (
    <div className="border-b border-cb-border shrink-0 bg-cb-bg/50">
      {/* Market quick-tabs */}
      <div className="flex gap-0.5 px-2 py-1 overflow-x-auto">
        {MARKETS.map((m) => (
          <button
            key={m.key}
            onClick={() => setMarket(m.key)}
            className={`px-1.5 py-0.5 text-[10px] rounded whitespace-nowrap transition-colors ${
              market === m.key
                ? "bg-cb-accent text-white"
                : "text-cb-muted hover:text-cb-text hover:bg-cb-border"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Search input */}
      <div className="px-2 pb-1.5">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="シンボルを検索して追加..."
          className="w-full px-2 py-1.5 bg-cb-bg border border-cb-border rounded text-xs text-cb-text placeholder-cb-muted focus:outline-none focus:border-cb-accent"
        />
      </div>

      {/* Results */}
      <div className="max-h-48 overflow-y-auto">
        {searching && (
          <div className="px-3 py-2 text-[10px] text-cb-muted">検索中...</div>
        )}
        {!searching && results.length === 0 && query && (
          <div className="px-3 py-2 text-[10px] text-cb-muted">結果なし</div>
        )}
        {results.map((s) => {
          const already = registered.has(s.symbol);
          return (
            <div
              key={s.symbol}
              className="flex items-center justify-between px-3 py-1.5 text-xs hover:bg-cb-border/50 transition-colors border-b border-cb-border/20"
            >
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-cb-text truncate">{s.symbol}</span>
                <span className="text-[10px] text-cb-muted truncate">{s.name}</span>
              </div>
              <button
                onClick={() =>
                  onAdd({
                    symbol: s.symbol,
                    name: s.name,
                    market: (s.market as MarketType) || market,
                  })
                }
                disabled={already}
                className={`shrink-0 ml-2 px-2 py-0.5 text-[10px] rounded border transition-colors ${
                  already
                    ? "border-cb-border text-cb-muted cursor-default"
                    : "border-cb-accent text-cb-accent hover:bg-cb-accent hover:text-white"
                }`}
              >
                {already ? "登録済" : "+ 追加"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
