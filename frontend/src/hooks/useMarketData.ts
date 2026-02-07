"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchChart } from "@/lib/api";
import { OHLCV, MarketType } from "@/types/market";

export function useMarketData(
  symbol: string,
  market: MarketType,
  interval: string
) {
  const [data, setData] = useState<OHLCV[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchChart(market, symbol, interval);
      setData(res.data);
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [symbol, market, interval]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
