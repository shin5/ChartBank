"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchCustomQuotes, fetchDefaultQuotes } from "@/lib/api";
import { QuoteData, WatchlistItem } from "@/types/market";

const REFRESH_INTERVAL = 30_000; // 30 seconds

export function useWatchlist(items: WatchlistItem[]) {
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (items.length > 0) {
        res = await fetchCustomQuotes(items);
      } else {
        res = await fetchDefaultQuotes();
      }
      setQuotes(res.quotes);
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [items]);

  useEffect(() => {
    load();

    // Auto-refresh
    intervalRef.current = setInterval(load, REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [load]);

  return { quotes, loading, error, refresh: load };
}
