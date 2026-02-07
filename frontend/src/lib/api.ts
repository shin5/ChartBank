import { ChartResponse, MarketType, QuotesResponse, SearchResult, WatchlistItem } from "@/types/market";

const API_BASE = "/api";

export async function fetchChart(
  market: MarketType,
  symbol: string,
  interval: string = "1d"
): Promise<ChartResponse> {
  const encoded = encodeURIComponent(symbol);
  const res = await fetch(
    `${API_BASE}/${market}/chart/${encoded}?interval=${interval}`
  );
  if (!res.ok) throw new Error(`Failed to fetch chart: ${res.statusText}`);
  return res.json();
}

export async function fetchSymbols(
  market: MarketType,
  query: string = ""
): Promise<SearchResult> {
  const params = query ? `?q=${encodeURIComponent(query)}` : "";
  const res = await fetch(`${API_BASE}/${market}/symbols${params}`);
  if (!res.ok) throw new Error(`Failed to fetch symbols: ${res.statusText}`);
  return res.json();
}

export async function fetchDefaultQuotes(
  market: string = ""
): Promise<QuotesResponse> {
  const params = market ? `?market=${encodeURIComponent(market)}` : "";
  const res = await fetch(`${API_BASE}/dashboard/quotes${params}`);
  if (!res.ok) throw new Error(`Failed to fetch quotes: ${res.statusText}`);
  return res.json();
}

export async function fetchCustomQuotes(
  items: WatchlistItem[]
): Promise<QuotesResponse> {
  const res = await fetch(`${API_BASE}/dashboard/quotes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items),
  });
  if (!res.ok) throw new Error(`Failed to fetch quotes: ${res.statusText}`);
  return res.json();
}
