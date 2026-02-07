"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchCustomQuotes, fetchDefaultQuotes } from "@/lib/api";
import { QuoteData, WatchlistItem } from "@/types/market";

/** Derive the WebSocket URL from the API base or env var. */
function getWsUrl(): string {
  const apiUrl =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_API_URL || `http://${window.location.hostname}:8000`
      : "http://localhost:8000";
  return apiUrl.replace(/^http/, "ws") + "/ws/quotes";
}

const HTTP_REFRESH_INTERVAL = 30_000;

/**
 * HTTP-first hook: always loads data via REST immediately,
 * then attempts a WebSocket upgrade for real-time pushes.
 */
export function useWatchlist(items: WatchlistItem[]) {
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const httpTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const wsConnected = useRef(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  /* ---- HTTP fetch (always works) ---- */
  const httpLoad = useCallback(async () => {
    try {
      const cur = itemsRef.current;
      const res =
        cur.length > 0 ? await fetchCustomQuotes(cur) : await fetchDefaultQuotes();
      setQuotes(res.quotes);
      setError(null);
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---- WebSocket (enhancement for real-time) ---- */
  const connectWs = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    wsConnected.current = false;

    try {
      const ws = new WebSocket(getWsUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        wsConnected.current = true;
        // Stop HTTP polling — WS will push updates
        if (httpTimer.current) {
          clearInterval(httpTimer.current);
          httpTimer.current = null;
        }
        // Subscribe current items
        const payload = itemsRef.current.map((it) => ({
          symbol: it.symbol,
          name: it.name,
          market: it.market,
        }));
        ws.send(JSON.stringify({ symbols: payload }));
      };

      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          if (data.type === "quotes" && Array.isArray(data.quotes)) {
            setQuotes(data.quotes as QuoteData[]);
            setLoading(false);
          }
        } catch {
          /* ignore parse errors */
        }
      };

      ws.onerror = () => {
        ws.close();
      };

      ws.onclose = () => {
        wsRef.current = null;
        wsConnected.current = false;
        // Restart HTTP polling if not already running
        if (!httpTimer.current) {
          httpTimer.current = setInterval(httpLoad, HTTP_REFRESH_INTERVAL);
        }
      };
    } catch {
      /* WebSocket unavailable — HTTP polling continues */
    }
  }, [httpLoad]);

  /* ---- Mount: HTTP fetch immediately, then try WS ---- */
  useEffect(() => {
    // 1) Fetch data RIGHT NOW via HTTP
    httpLoad();
    // 2) Start HTTP polling as baseline
    httpTimer.current = setInterval(httpLoad, HTTP_REFRESH_INTERVAL);
    // 3) Try WebSocket for real-time upgrade
    connectWs();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (httpTimer.current) clearInterval(httpTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- When items change, re-subscribe or re-fetch ---- */
  useEffect(() => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      const payload = itemsRef.current.map((it) => ({
        symbol: it.symbol,
        name: it.name,
        market: it.market,
      }));
      ws.send(JSON.stringify({ symbols: payload }));
    }
    // Always re-fetch via HTTP too (items changed)
    httpLoad();
  }, [items, httpLoad]);

  /* ---- Manual refresh ---- */
  const refresh = useCallback(() => {
    httpLoad();
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      const payload = itemsRef.current.map((it) => ({
        symbol: it.symbol,
        name: it.name,
        market: it.market,
      }));
      ws.send(JSON.stringify({ symbols: payload }));
    }
  }, [httpLoad]);

  return { quotes, loading, error, refresh };
}
