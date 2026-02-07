"use client";

import { useWatchlist } from "@/hooks/useWatchlist";
import { fetchChart, fetchSymbols } from "@/lib/api";
import { MarketType, QuoteData, WatchlistItem, SymbolInfo, MARKETS } from "@/types/market";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";

interface Props {
  items: WatchlistItem[];
  onClickSymbol: (symbol: string, name: string, market: MarketType) => void;
  onRemoveItem: (symbol: string) => void;
  onAddItem: (item: WatchlistItem) => void;
  onReorderItems: (items: WatchlistItem[]) => void;
}

function formatPrice(price: number): string {
  if (price >= 1000)
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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

export default function WatchlistDashboard({
  items,
  onClickSymbol,
  onRemoveItem,
  onAddItem,
  onReorderItems,
}: Props) {
  const { quotes, loading, error, refresh } = useWatchlist(items);
  const [filterMarket, setFilterMarket] = useState<string>("");
  const [dashLayout, setDashLayout] = useState<"tile" | "list">("list");
  const [showAddPanel, setShowAddPanel] = useState(false);

  /* drag-and-drop */
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const registered = useMemo(() => new Set(items.map((i) => i.symbol)), [items]);

  /* keep item ordering even after quotes refresh */
  const orderedQuotes = useMemo(() => {
    const map = new Map(quotes.map((q) => [q.symbol, q]));
    return items.map((it) => map.get(it.symbol)).filter(Boolean) as QuoteData[];
  }, [items, quotes]);

  const filtered = useMemo(() => {
    if (!filterMarket) return orderedQuotes;
    return orderedQuotes.filter((q) => q.market === filterMarket);
  }, [orderedQuotes, filterMarket]);

  /* map displayed index → original items index */
  const toItemIdx = useCallback(
    (displayIdx: number) => {
      const sym = filtered[displayIdx]?.symbol;
      return items.findIndex((it) => it.symbol === sym);
    },
    [filtered, items]
  );

  const handleDragStart = useCallback((idx: number) => setDragIdx(idx), []);
  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setOverIdx(idx);
  }, []);
  const handleDrop = useCallback(
    (idx: number) => {
      if (dragIdx === null || dragIdx === idx) {
        setDragIdx(null);
        setOverIdx(null);
        return;
      }
      const fromItem = toItemIdx(dragIdx);
      const toItem = toItemIdx(idx);
      if (fromItem < 0 || toItem < 0) return;
      const next = [...items];
      const [moved] = next.splice(fromItem, 1);
      next.splice(toItem, 0, moved);
      onReorderItems(next);
      setDragIdx(null);
      setOverIdx(null);
    },
    [dragIdx, items, toItemIdx, onReorderItems]
  );
  const handleDragEnd = useCallback(() => {
    setDragIdx(null);
    setOverIdx(null);
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* ── toolbar ── */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-cb-border bg-cb-panel shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterMarket("")}
            className={`px-2.5 py-1 text-sm rounded transition-colors ${!filterMarket ? "bg-cb-accent text-white" : "text-cb-muted hover:text-cb-text hover:bg-cb-border"}`}
          >
            全て
          </button>
          {MARKETS.map((m) => (
            <button
              key={m.key}
              onClick={() => setFilterMarket(m.key)}
              className={`px-2.5 py-1 text-sm rounded transition-colors ${filterMarket === m.key ? "bg-cb-accent text-white" : "text-cb-muted hover:text-cb-text hover:bg-cb-border"}`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {/* tile / list toggle */}
          <div className="flex rounded border border-cb-border overflow-hidden">
            <button
              onClick={() => setDashLayout("tile")}
              className={`px-2 py-1 text-xs transition-colors ${dashLayout === "tile" ? "bg-cb-accent text-white" : "text-cb-muted hover:text-cb-text hover:bg-cb-border"}`}
              title="タイル表示"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
            </button>
            <button
              onClick={() => setDashLayout("list")}
              className={`px-2 py-1 text-xs transition-colors ${dashLayout === "list" ? "bg-cb-accent text-white" : "text-cb-muted hover:text-cb-text hover:bg-cb-border"}`}
              title="リスト表示"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            </button>
          </div>
          {/* add symbol */}
          <button
            onClick={() => setShowAddPanel((v) => !v)}
            className={`flex items-center gap-1 px-2.5 py-1 text-sm rounded border transition-colors ${
              showAddPanel
                ? "border-cb-accent bg-cb-accent/20 text-cb-accent"
                : "border-cb-border text-cb-muted hover:text-cb-text hover:bg-cb-border"
            }`}
            title="銘柄を追加"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            追加
          </button>
          {/* refresh */}
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-1 px-2.5 py-1 text-sm rounded border border-cb-border text-cb-muted hover:text-cb-text hover:bg-cb-border transition-colors disabled:opacity-40"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            更新
          </button>
        </div>
      </div>

      {/* ── add-symbol panel ── */}
      {showAddPanel && (
        <AddSymbolPanel
          registered={registered}
          onAdd={(item) => onAddItem(item)}
          onClose={() => setShowAddPanel(false)}
        />
      )}

      {error && (
        <div className="px-4 py-2 text-xs text-red-400 bg-red-900/20 shrink-0">{error}</div>
      )}

      {loading && quotes.length === 0 && (
        <div className="flex items-center justify-center flex-1 text-sm text-cb-muted">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          読み込み中...
        </div>
      )}

      {(!loading || quotes.length > 0) && (
        <div className="flex-1 overflow-y-auto p-2">
          {dashLayout === "tile" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {filtered.map((q, i) => (
                <QuoteCard
                  key={q.symbol}
                  quote={q}
                  index={i}
                  onClick={() => onClickSymbol(q.symbol, q.name, q.market as MarketType)}
                  onRemove={() => onRemoveItem(q.symbol)}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  isDragging={dragIdx === i}
                  isOver={overIdx === i}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-0">
              {/* list header */}
              <div className="grid grid-cols-[24px_0.25fr_minmax(42px,0.35fr)_100px_120px_100px_80px_80px_80px_80px_32px] gap-2 px-3 py-1 text-xs text-cb-muted font-semibold border-b border-cb-border">
                <span></span><span>銘柄</span><span className="text-center">前日比</span><span className="text-right">チャート</span><span className="text-right">価格</span><span className="text-right">変動</span><span className="text-right">高値</span><span className="text-right">安値</span><span className="text-right">出来高</span><span className="text-right">前日終値</span><span></span>
              </div>
              {filtered.map((q, i) => (
                <ListRow
                  key={q.symbol}
                  quote={q}
                  index={i}
                  onClick={() => onClickSymbol(q.symbol, q.name, q.market as MarketType)}
                  onRemove={() => onRemoveItem(q.symbol)}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  isDragging={dragIdx === i}
                  isOver={overIdx === i}
                />
              ))}
            </div>
          )}
          {filtered.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="text-sm text-cb-muted">銘柄がありません</span>
              <button
                onClick={() => setShowAddPanel(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded border border-cb-accent text-cb-accent hover:bg-cb-accent hover:text-white transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                銘柄を追加
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Add Symbol Panel ─── */
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
      <div className="flex items-center justify-between px-3 py-1.5">
        <div className="flex gap-0.5 overflow-x-auto">
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
        <button onClick={onClose} className="p-0.5 text-cb-muted hover:text-cb-text">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="px-3 pb-2">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="シンボルを検索して追加..."
          className="w-full px-2 py-1.5 bg-cb-bg border border-cb-border rounded text-xs text-cb-text placeholder-cb-muted focus:outline-none focus:border-cb-accent"
        />
      </div>
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

/* ─── Sparkline ─── */
function Sparkline({ data, isUp }: { data: number[]; isUp: boolean }) {
  if (data.length < 2) return null;
  const w = 80,
    h = 36;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const stroke = isUp ? "#10b981" : "#ef4444";
  const gradId = isUp ? "spkG" : "spkR";
  const lastPt = points[points.length - 1];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.25} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${points.join(" ")} ${w},${h}`} fill={`url(#${gradId})`} />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lastPt.split(",")[0]} cy={lastPt.split(",")[1]} r={2} fill={stroke} />
    </svg>
  );
}

/* ─── Drag Handle ─── */
function DragHandle() {
  return (
    <svg
      className="w-4 h-4 text-cb-muted/50 group-hover:text-cb-muted cursor-grab active:cursor-grabbing"
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <circle cx="5" cy="3" r="1.2" />
      <circle cx="11" cy="3" r="1.2" />
      <circle cx="5" cy="8" r="1.2" />
      <circle cx="11" cy="8" r="1.2" />
      <circle cx="5" cy="13" r="1.2" />
      <circle cx="11" cy="13" r="1.2" />
    </svg>
  );
}

/* ─── CardProps ─── */
interface CardProps {
  quote: QuoteData;
  index: number;
  onClick: () => void;
  onRemove: () => void;
  onDragStart: (i: number) => void;
  onDragOver: (e: React.DragEvent, i: number) => void;
  onDrop: (i: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  isOver: boolean;
}

/* ─── QuoteCard (tile) ─── */
function QuoteCard({
  quote,
  index,
  onClick,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
  isOver,
}: CardProps) {
  const isUp = quote.change >= 0;
  const accentColor = isUp ? "text-cb-green" : "text-cb-red";
  const bgClass = isUp
    ? "bg-emerald-500/10 border-emerald-500/20"
    : "bg-red-500/10 border-red-500/20";
  const arrow = isUp ? "\u25B2" : "\u25BC";

  const prev = quote.prev_close || quote.price;
  const lowPct = ((quote.low - prev) / prev) * 100;
  const highPct = ((quote.high - prev) / prev) * 100;
  const curPct = ((quote.price - prev) / prev) * 100;

  const toPos = (pct: number) =>
    Math.min(100, Math.max(0, ((pct + 10) / 20) * 100));
  const centerPos = 50;
  const lowPos = toPos(lowPct);
  const highPos = toPos(highPct);
  const curPos = toPos(curPct);
  const bodyLeft = Math.min(centerPos, curPos);
  const bodyRight = Math.max(centerPos, curPos);
  const bodyWidth = Math.max(bodyRight - bodyLeft, 0.5);
  const bodyColor = isUp ? "bg-emerald-500" : "bg-red-500";
  const tickColor = isUp ? "bg-emerald-400" : "bg-red-400";

  const fmtPct = (v: number) => (v >= 0 ? "+" : "") + v.toFixed(2) + "%";

  const [sparkData, setSparkData] = useState<number[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetchChart(quote.market as MarketType, quote.symbol, "1d")
      .then((res) => {
        if (!cancelled && res.data.length > 0)
          setSparkData(res.data.slice(-30).map((d) => d.close));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [quote.symbol, quote.market]);

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={() => onDrop(index)}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={
        "relative group flex flex-col gap-1.5 p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg " +
        bgClass +
        (isDragging ? " opacity-40" : "") +
        (isOver ? " ring-2 ring-cb-accent" : "")
      }
    >
      {/* drag-handle + remove */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DragHandle />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-0.5 rounded text-cb-muted hover:text-cb-red opacity-0 group-hover:opacity-100 transition-opacity"
          title="削除"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="flex items-start justify-between pr-12">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold text-cb-text truncate">
              {quote.symbol}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cb-border/80 text-cb-muted whitespace-nowrap">
              {marketLabel(quote.market)}
            </span>
          </div>
          <div className="text-sm text-cb-muted truncate">{quote.name}</div>
        </div>
        {sparkData.length > 1 && (
          <div className="shrink-0 ml-2">
            <Sparkline data={sparkData} isUp={isUp} />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono text-cb-text leading-none">
          {formatPrice(quote.price)}
        </span>
      </div>

      <div className={"flex items-center gap-3 " + accentColor}>
        <span className="text-base font-mono font-semibold">
          {arrow} {Math.abs(quote.change_percent).toFixed(2)}%
        </span>
        <span className="text-sm font-mono">
          {isUp ? "+" : ""}
          {quote.change > 100 ? quote.change.toFixed(0) : quote.change.toFixed(4)}
        </span>
      </div>

      <div className="h-px bg-cb-border/50" />

      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
        <div className="flex justify-between">
          <span className="text-cb-muted">高値</span>
          <span className="font-mono text-cb-text">{formatPrice(quote.high)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-cb-muted">安値</span>
          <span className="font-mono text-cb-text">{formatPrice(quote.low)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-cb-muted">前日終値</span>
          <span className="font-mono text-cb-text">
            {formatPrice(quote.prev_close)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-cb-muted">出来高</span>
          <span className="font-mono text-cb-text">{formatVolume(quote.volume)}</span>
        </div>
      </div>

      {/* candlestick bar */}
      <div className="mt-1">
        <div className="flex items-center justify-between text-[10px] mb-0.5 px-0">
          <span className="text-cb-muted">-10%</span>
          <span className="text-cb-muted">-5%</span>
          <span className="text-cb-text font-semibold">前日比 0%</span>
          <span className="text-cb-muted">+5%</span>
          <span className="text-cb-muted">+10%</span>
        </div>
        <div className="relative h-5 flex items-center">
          {[0, 25, 50, 75, 100].map((pos) => (
            <div
              key={pos}
              className={
                "absolute top-0 bottom-0 w-[1px] " +
                (pos === 50 ? "bg-cb-muted/50" : "bg-cb-muted/20")
              }
              style={{ left: pos + "%" }}
            />
          ))}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-[2px] bg-cb-muted/60 rounded-full"
            style={{
              left: lowPos + "%",
              width: Math.max(0, highPos - lowPos) + "%",
            }}
          />
          <div
            className={
              "absolute top-1/2 -translate-y-1/2 h-1 rounded-sm transition-all " +
              bodyColor
            }
            style={{ left: bodyLeft + "%", width: bodyWidth + "%" }}
          />
          <div
            className={
              "absolute top-1/2 -translate-y-1/2 w-[2px] h-1.5 rounded-full " +
              tickColor
            }
            style={{ left: curPos + "%" }}
          />
        </div>
        <div className="flex justify-between text-[10px] mt-0.5">
          <span className="text-cb-red">{fmtPct(lowPct)}</span>
          <span className={accentColor + " font-semibold"}>{fmtPct(curPct)}</span>
          <span className="text-cb-green">{fmtPct(highPct)}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── ListRow ─── */
function ListRow({
  quote,
  index,
  onClick,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
  isOver,
}: CardProps) {
  const isUp = quote.change >= 0;
  const accentColor = isUp ? "text-cb-green" : "text-cb-red";
  const arrow = isUp ? "\u25B2" : "\u25BC";

  const [sparkData, setSparkData] = useState<number[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetchChart(quote.market as MarketType, quote.symbol, "1d")
      .then((res) => {
        if (!cancelled && res.data.length > 0)
          setSparkData(res.data.slice(-30).map((d) => d.close));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [quote.symbol, quote.market]);

  const prev = quote.prev_close || quote.price;
  const lowPct = ((quote.low - prev) / prev) * 100;
  const highPct = ((quote.high - prev) / prev) * 100;
  const curPct = ((quote.price - prev) / prev) * 100;
  const toPos = (pct: number) =>
    Math.min(100, Math.max(0, ((pct + 10) / 20) * 100));
  const centerPos = 50;
  const lowPos = toPos(lowPct);
  const highPos = toPos(highPct);
  const curPos = toPos(curPct);
  const bodyLeft = Math.min(centerPos, curPos);
  const bodyRight = Math.max(centerPos, curPos);
  const bodyWidth = Math.max(bodyRight - bodyLeft, 0.5);
  const bodyColor = isUp ? "bg-emerald-500" : "bg-red-500";
  const tickColor = isUp ? "bg-emerald-400" : "bg-red-400";

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={() => onDrop(index)}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={
        "group grid grid-cols-[24px_0.25fr_minmax(42px,0.35fr)_100px_120px_100px_80px_80px_80px_80px_32px] gap-2 items-center px-3 py-1.5 rounded hover:bg-cb-border/30 cursor-pointer transition-colors border-b border-cb-border/40" +
        (isDragging ? " opacity-40" : "") +
        (isOver ? " bg-cb-accent/10" : "")
      }
    >
      {/* drag handle */}
      <div className="flex items-center justify-center cursor-grab active:cursor-grabbing">
        <DragHandle />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-base font-bold text-cb-text truncate">
            {quote.symbol}
          </span>
          <span className="text-[10px] px-1 py-0.5 rounded bg-cb-border/80 text-cb-muted">
            {marketLabel(quote.market)}
          </span>
        </div>
        <div className="text-xs text-cb-muted truncate">{quote.name}</div>
      </div>
      <div className="relative h-5 flex items-center">
        {[0, 25, 50, 75, 100].map((pos) => (
          <div
            key={pos}
            className={
              "absolute top-0 bottom-0 w-[1px] " +
              (pos === 50 ? "bg-cb-muted/40" : "bg-cb-muted/15")
            }
            style={{ left: pos + "%" }}
          />
        ))}
        <span
          className="absolute text-[8px] text-cb-muted/50 -top-0.5"
          style={{ left: "0%", transform: "translateX(1px)" }}
        >
          -10%
        </span>
        <span
          className="absolute text-[8px] text-cb-muted/50 -top-0.5"
          style={{ left: "25%", transform: "translateX(-50%)" }}
        >
          -5%
        </span>
        <span
          className="absolute text-[8px] text-cb-muted/70 -top-0.5 font-semibold"
          style={{ left: "50%", transform: "translateX(-50%)" }}
        >
          0%
        </span>
        <span
          className="absolute text-[8px] text-cb-muted/50 -top-0.5"
          style={{ left: "75%", transform: "translateX(-50%)" }}
        >
          +5%
        </span>
        <span
          className="absolute text-[8px] text-cb-muted/50 -top-0.5"
          style={{ left: "100%", transform: "translateX(-100%)" }}
        >
          +10%
        </span>
        <div
          className="absolute top-1/2 -translate-y-1/2 h-[2px] bg-cb-muted/50 rounded-full"
          style={{
            left: lowPos + "%",
            width: Math.max(0, highPos - lowPos) + "%",
          }}
        />
        <div
          className={"absolute top-1/2 -translate-y-1/2 h-1 rounded-sm " + bodyColor}
          style={{ left: bodyLeft + "%", width: bodyWidth + "%" }}
        />
        <div
          className={
            "absolute top-1/2 -translate-y-1/2 w-[2px] h-1.5 rounded-full " + tickColor
          }
          style={{ left: curPos + "%" }}
        />
      </div>
      <div className="flex justify-end">
        {sparkData.length > 1 && <Sparkline data={sparkData} isUp={isUp} />}
      </div>
      <span className="text-base font-bold font-mono text-cb-text text-right">
        {formatPrice(quote.price)}
      </span>
      <span
        className={
          "text-sm font-mono text-right font-semibold " + accentColor
        }
      >
        {arrow} {Math.abs(quote.change_percent).toFixed(2)}%
      </span>
      <span className="text-sm font-mono text-cb-text text-right">
        {formatPrice(quote.high)}
      </span>
      <span className="text-sm font-mono text-cb-text text-right">
        {formatPrice(quote.low)}
      </span>
      <span className="text-sm font-mono text-cb-text text-right">
        {formatVolume(quote.volume)}
      </span>
      <span className="text-sm font-mono text-cb-text text-right">
        {formatPrice(quote.prev_close)}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="p-0.5 rounded text-cb-muted hover:text-cb-red opacity-0 group-hover:opacity-100 transition-opacity justify-self-center"
        title="削除"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
