"""Binance data service for crypto markets via ccxt."""

import ccxt
from typing import List
from models.market_data import OHLCV

exchange = ccxt.binance({"enableRateLimit": True})

# Interval mapping
INTERVAL_MAP = {
    "1m": "1m",
    "5m": "5m",
    "15m": "15m",
    "30m": "30m",
    "1h": "1h",
    "4h": "4h",
    "1d": "1d",
    "1w": "1w",
    "1M": "1M",
}

# Popular crypto pairs
POPULAR_PAIRS = [
    {"symbol": "BTC/USDT", "name": "Bitcoin"},
    {"symbol": "ETH/USDT", "name": "Ethereum"},
    {"symbol": "BNB/USDT", "name": "Binance Coin"},
    {"symbol": "SOL/USDT", "name": "Solana"},
    {"symbol": "XRP/USDT", "name": "Ripple"},
    {"symbol": "ADA/USDT", "name": "Cardano"},
    {"symbol": "DOGE/USDT", "name": "Dogecoin"},
    {"symbol": "AVAX/USDT", "name": "Avalanche"},
    {"symbol": "DOT/USDT", "name": "Polkadot"},
    {"symbol": "MATIC/USDT", "name": "Polygon"},
]


def fetch_ohlcv(symbol: str, interval: str = "1d", limit: int = 500) -> List[OHLCV]:
    """Fetch OHLCV data from Binance via ccxt."""
    timeframe = INTERVAL_MAP.get(interval, "1d")

    try:
        raw = exchange.fetch_ohlcv(symbol, timeframe=timeframe, limit=limit)
    except Exception:
        return []

    bars: List[OHLCV] = []
    for candle in raw:
        bars.append(OHLCV(
            time=int(candle[0] / 1000),  # ms -> seconds
            open=candle[1],
            high=candle[2],
            low=candle[3],
            close=candle[4],
            volume=candle[5],
        ))
    return bars


def fetch_quote(symbol: str, name: str = "") -> dict | None:
    """Fetch current quote for a Binance crypto pair."""
    try:
        ticker = exchange.fetch_ticker(symbol)
        price = ticker.get("last", 0)
        prev = ticker.get("previousClose") or (price - (ticker.get("change") or 0))
        change = ticker.get("change") or round(price - prev, 6)
        pct = ticker.get("percentage") or (round((change / prev) * 100, 2) if prev else 0)
        return {
            "symbol": symbol,
            "name": name or symbol,
            "market": "crypto",
            "price": round(price, 6),
            "change": round(change, 6),
            "change_percent": round(pct, 2),
            "high": round(ticker.get("high", 0), 6),
            "low": round(ticker.get("low", 0), 6),
            "volume": round(ticker.get("baseVolume", 0), 2),
            "prev_close": round(prev, 6),
        }
    except Exception:
        return None


def search_symbols(query: str) -> list:
    """Search crypto trading pairs on Binance."""
    query_upper = query.upper()
    results = []
    for pair in POPULAR_PAIRS:
        if query_upper in pair["symbol"] or query_upper in pair["name"].upper():
            results.append({
                "symbol": pair["symbol"],
                "name": pair["name"],
                "market": "crypto",
                "exchange": "Binance",
            })
    return results
