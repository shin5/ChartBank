export interface OHLCV {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartResponse {
  symbol: string;
  market: MarketType;
  interval: string;
  data: OHLCV[];
}

export interface SymbolInfo {
  symbol: string;
  name: string;
  market: string;
  exchange?: string;
}

export interface SearchResult {
  results: SymbolInfo[];
}

export type MarketType =
  | "stocks"
  | "crypto"
  | "forex"
  | "futures"
  | "commodities"
  | "indices";

export const MARKETS: { key: MarketType; label: string }[] = [
  { key: "stocks", label: "株式" },
  { key: "crypto", label: "暗号通貨" },
  { key: "forex", label: "FX" },
  { key: "futures", label: "先物" },
  { key: "commodities", label: "コモディティ" },
  { key: "indices", label: "インデックス" },
];

export const TIMEFRAMES = [
  { key: "1m", label: "1分" },
  { key: "5m", label: "5分" },
  { key: "15m", label: "15分" },
  { key: "30m", label: "30分" },
  { key: "1h", label: "1時間" },
  { key: "4h", label: "4時間" },
  { key: "1d", label: "日足" },
  { key: "1w", label: "週足" },
  { key: "1M", label: "月足" },
];

export const DEFAULT_SYMBOL: Record<MarketType, { symbol: string; name: string }> = {
  stocks: { symbol: "AAPL", name: "Apple Inc." },
  crypto: { symbol: "BTC/USDT", name: "Bitcoin" },
  forex: { symbol: "EURUSD=X", name: "EUR/USD" },
  futures: { symbol: "ES=F", name: "E-Mini S&P 500" },
  commodities: { symbol: "GC=F", name: "Gold" },
  indices: { symbol: "^GSPC", name: "S&P 500" },
};

/** A single chart panel in the multi-panel layout. */
export interface PanelState {
  id: string;
  symbol: string;
  symbolName: string;
  market: MarketType;
  interval: string;
}

export type LayoutMode = "1" | "2h" | "2v" | "3" | "4" | "6";

/** Toggle between chart panels view and watchlist dashboard view. */
export type ViewMode = "chart" | "dashboard";

export const LAYOUT_OPTIONS: { key: LayoutMode; label: string; icon: string }[] = [
  { key: "1",  label: "1画面",  icon: "⬜" },
  { key: "2h", label: "2画面(横)", icon: "⬜⬜" },
  { key: "2v", label: "2画面(縦)", icon: "⬛" },
  { key: "3",  label: "3画面",  icon: "⬜⬜⬜" },
  { key: "4",  label: "4画面",  icon: "⊞" },
  { key: "6",  label: "6画面",  icon: "⊞⊞" },
];

/** How many panels each layout needs. */
export const LAYOUT_PANEL_COUNT: Record<LayoutMode, number> = {
  "1": 1, "2h": 2, "2v": 2, "3": 3, "4": 4, "6": 6,
};

/** Current price quote for a single symbol. */
export interface QuoteData {
  symbol: string;
  name: string;
  market: string;
  price: number;
  change: number;
  change_percent: number;
  high: number;
  low: number;
  volume: number;
  prev_close: number;
}

export interface QuotesResponse {
  quotes: QuoteData[];
}

/** Watchlist item that the user can add/remove. */
export interface WatchlistItem {
  symbol: string;
  name: string;
  market: MarketType;
}
