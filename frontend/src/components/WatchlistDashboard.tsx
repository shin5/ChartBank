"use client";

import { useWatchlist } from "@/hooks/useWatchlist";
import { MarketType, QuoteData, WatchlistItem, MARKETS } from "@/types/market";
import { useState, useMemo } from "react";

interface Props {
  items: WatchlistItem[];
  onClickSymbol: (symbol: string, name: string, market: MarketType) => void;
  onRemoveItem: (symbol: string) => void;
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
}: Props) {
  const { quotes, loading, error, refresh } = useWatchlist(items);
  const [filterMarket, setFilterMarket] = useState<string>("");

  const filtered = useMemo(() => {
    if (!filterMarket) return quotes;
    return quotes.filter((q) => q.market === filterMarket);
  }, [quotes, filterMarket]);

  const marketsInData = useMemo(() => {
    const s = new Set(quotes.map((q) => q.market));
    return Array.from(s);
  }, [quotes]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-cb-border bg-cb-panel shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterMarket("")}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              !filterMarket
                ? "bg-cb-accent text-white"
                : "text-cb-muted hover:text-cb-text hover:bg-cb-border"
            }`}
          >
            全て
          </button>
          {marketsInData.map((m) => (
            <button
              key={m}
              onClick={() => setFilterMarket(m)}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                filterMarket === m
                  ? "bg-cb-accent text-white"
                  : "text-cb-muted hover:text-cb-text hover:bg-cb-border"
              }`}
            >
              {marketLabel(m)}
            </button>
          ))}
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-cb-border text-cb-muted hover:text-cb-text hover:bg-cb-border transition-colors disabled:opacity-40"
        >
          <svg
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          更新
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 text-xs text-red-400 bg-red-900/20 shrink-0">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && quotes.length === 0 && (
        <div className="flex items-center justify-center flex-1 text-sm text-cb-muted">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          読み込み中...
        </div>
      )}

      {/* Cards Grid */}
      {(!loading || quotes.length > 0) && (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
            {filtered.map((q) => (
              <QuoteCard
                key={q.symbol}
                quote={q}
                onClick={() =>
                  onClickSymbol(q.symbol, q.name, q.market as MarketType)
                }
                onRemove={() => onRemoveItem(q.symbol)}
              />
            ))}
          </div>
          {filtered.length === 0 && !loading && (
            <div className="flex items-center justify-center py-16 text-sm text-cb-muted">
              ウォッチリストに銘柄がありません
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Quote Card ─── */

function QuoteCard({
  quote,
  onClick,
  onRemove,
}: {
  quote: QuoteData;
  onClick: () => void;
  onRemove: () => void;
}) {
  const isUp = quote.change >= 0;
  const accentColor = isUp ? "text-cb-green" : "text-cb-red";
  const bgAccent = isUp
    ? "bg-emerald-500/10 border-emerald-500/20"
    : "bg-red-500/10 border-red-500/20";
  const arrow = isUp ? "▲" : "▼";

  const rangePct =
    quote.high !== quote.low
      ? ((quote.price - quote.low) / (quote.high - quote.low)) * 100
      : 50;

  return (
    <div
      onClick={onClick}
      className={`relative group flex flex-col gap-2 p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${bgAccent}`}
    >
      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 p-0.5 rounded text-cb-muted hover:text-cb-red opacity-0 group-hover:opacity-100 transition-opacity"
        title="削除"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Header: Symbol + Market badge */}
      <div className="flex items-start justify-between pr-5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-cb-text truncate">
              {quote.symbol}
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cb-border/80 text-cb-muted whitespace-nowrap">
              {marketLabel(quote.market)}
            </span>
          </div>
          <div className="text-xs text-cb-muted truncate mt-0.5">
            {quote.name}
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono text-cb-text leading-none">
          {formatPrice(quote.price)}
        </span>
      </div>

      {/* Change row */}
      <div className={`flex items-center gap-3 ${accentColor}`}>
        <span className="text-sm font-mono font-semibold">
          {arrow} {Math.abs(quote.change_percent).toFixed(2)}%
        </span>
        <span className="text-xs font-mono">
          {isUp ? "+" : ""}
          {quote.change > 100
            ? quote.change.toFixed(0)
            : quote.change.toFixed(4)}
        </span>
      </div>

      {/* Divider */}
      <div className="h-px bg-cb-border/50" />

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <div className="flex justify-between">
          <span className="text-cb-muted">高値</span>
          <span className="font-mono text-cb-text">
            {formatPrice(quote.high)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-cb-muted">安値</span>
          <span className="font-mono text-cb-text">
            {formatPrice(quote.low)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-cb-muted">前日終値</span>
          <span className="font-mono text-cb-text">
            {formatPrice(quote.prev_close)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-cb-muted">出来高</span>
          <span className="font-mono text-cb-text">
            {formatVolume(quote.volume)}
          </span>
        </div>
      </div>

      {/* Day range bar */}
      <div className="mt-1">
        <div className="flex justify-between text-[9px] text-cb-muted mb-0.5">
          <span>安値 {formatPrice(quote.low)}</span>
          <span>高値 {formatPrice(quote.high)}</span>
        </div>
        <div className="relative h-1.5 rounded-full bg-cb-border/50 overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full rounded-full transition-all ${
              isUp ? "bg-emerald-500" : "bg-red-500"
            }`}
            style={{ width: `${Math.min(100, Math.max(0, rangePct))}%` }}
          />
          {/* Current price indicator */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white border-2 border-cb-bg shadow-sm"
            style={{
              left: `${Math.min(100, Math.max(0, rangePct))}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
