"""Yahoo Finance data service for stocks, forex, futures, commodities, indices."""

import yfinance as yf
from typing import List
from models.market_data import OHLCV

# Interval mapping: frontend label -> yfinance interval
INTERVAL_MAP = {
    "1m": "1m",
    "5m": "5m",
    "15m": "15m",
    "30m": "30m",
    "1h": "1h",
    "4h": "4h",
    "1d": "1d",
    "1w": "1wk",
    "1M": "1mo",
}

# Period mapping based on interval (yfinance limits intraday history)
PERIOD_MAP = {
    "1m": "7d",
    "5m": "60d",
    "15m": "60d",
    "30m": "60d",
    "1h": "730d",
    "4h": "730d",
    "1d": "5y",
    "1w": "10y",
    "1M": "max",
}


def fetch_ohlcv(symbol: str, interval: str = "1d") -> List[OHLCV]:
    """Fetch OHLCV data from Yahoo Finance."""
    yf_interval = INTERVAL_MAP.get(interval, "1d")
    period = PERIOD_MAP.get(interval, "5y")

    ticker = yf.Ticker(symbol)
    df = ticker.history(period=period, interval=yf_interval)

    if df.empty:
        return []

    bars: List[OHLCV] = []
    for ts, row in df.iterrows():
        bars.append(OHLCV(
            time=int(ts.timestamp()),
            open=round(row["Open"], 6),
            high=round(row["High"], 6),
            low=round(row["Low"], 6),
            close=round(row["Close"], 6),
            volume=round(row["Volume"], 2),
        ))
    return bars


def fetch_quote(symbol: str, name: str = "", market: str = "") -> dict | None:
    """Fetch current quote for a single Yahoo Finance symbol."""
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        price = info.get("currentPrice") or info.get("regularMarketPrice", 0)
        prev = info.get("previousClose") or info.get("regularMarketPreviousClose", 0)
        change = round(price - prev, 6) if price and prev else 0
        pct = round((change / prev) * 100, 2) if prev else 0
        return {
            "symbol": symbol,
            "name": name or info.get("shortName", symbol),
            "market": market,
            "price": round(price, 6),
            "change": change,
            "change_percent": pct,
            "high": round(info.get("dayHigh") or info.get("regularMarketDayHigh", 0), 6),
            "low": round(info.get("dayLow") or info.get("regularMarketDayLow", 0), 6),
            "volume": info.get("volume") or info.get("regularMarketVolume", 0),
            "prev_close": round(prev, 6),
        }
    except Exception:
        return None


def search_symbols(query: str, market: str = "") -> list:
    """Basic symbol search using yfinance."""
    try:
        ticker = yf.Ticker(query.upper())
        info = ticker.info
        if info and info.get("symbol"):
            return [{
                "symbol": info["symbol"],
                "name": info.get("shortName", info.get("longName", query)),
                "market": market,
                "exchange": info.get("exchange", ""),
            }]
    except Exception:
        pass
    return []
