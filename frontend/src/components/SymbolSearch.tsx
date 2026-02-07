"use client";

import { useState, useEffect, useRef } from "react";
import { fetchSymbols } from "@/lib/api";
import { MarketType, SymbolInfo } from "@/types/market";

interface Props {
  market: MarketType;
  currentSymbol: string;
  onSelect: (symbol: string, name: string) => void;
}

export default function SymbolSearch({ market, currentSymbol, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SymbolInfo[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetchSymbols(market, query);
        setResults(res.results);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, market]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded text-sm font-semibold text-cb-text hover:bg-cb-border transition-colors"
      >
        <svg className="w-4 h-4 text-cb-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {currentSymbol}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-cb-panel border border-cb-border rounded-lg shadow-xl z-50">
          <div className="p-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="シンボルを検索..."
              className="w-full px-3 py-2 bg-cb-bg border border-cb-border rounded text-sm text-cb-text placeholder-cb-muted focus:outline-none focus:border-cb-accent"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {loading && (
              <div className="px-3 py-2 text-sm text-cb-muted">検索中...</div>
            )}
            {!loading && results.length === 0 && (
              <div className="px-3 py-2 text-sm text-cb-muted">結果なし</div>
            )}
            {results.map((s) => (
              <button
                key={s.symbol}
                onClick={() => {
                  onSelect(s.symbol, s.name);
                  setOpen(false);
                  setQuery("");
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-cb-border transition-colors"
              >
                <span className="font-medium text-cb-text">{s.symbol}</span>
                <span className="text-cb-muted text-xs truncate ml-2">{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
