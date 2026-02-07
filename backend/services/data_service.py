"""Unified data service that routes to the correct market provider."""

from typing import List
from models.market_data import OHLCV, SymbolInfo
from services import yahoo_finance, binance


def get_chart_data(symbol: str, market: str, interval: str = "1d") -> List[OHLCV]:
    """Fetch chart data based on market type."""
    if market == "crypto":
        return binance.fetch_ohlcv(symbol, interval)
    else:
        return yahoo_finance.fetch_ohlcv(symbol, interval)


def search(query: str, market: str = "") -> List[SymbolInfo]:
    """Search symbols across markets."""
    results: list = []

    if market in ("", "crypto"):
        results.extend(binance.search_symbols(query))

    if market in ("", "stocks", "forex", "futures", "commodities", "indices"):
        results.extend(yahoo_finance.search_symbols(query, market))

    return [SymbolInfo(**r) for r in results]


def get_quote(symbol: str, name: str, market: str) -> dict | None:
    """Fetch a single quote based on market type."""
    if market == "crypto":
        return binance.fetch_quote(symbol, name)
    else:
        return yahoo_finance.fetch_quote(symbol, name, market)


def get_quotes(items: list[dict]) -> list[dict]:
    """Fetch quotes for multiple symbols.
    Each item: {symbol, name, market}
    """
    results: list[dict] = []
    for item in items:
        q = get_quote(item["symbol"], item.get("name", ""), item["market"])
        if q:
            results.append(q)
    return results


# Default/popular symbols per market
DEFAULT_SYMBOLS = {
    "stocks": [
        {"symbol": "AAPL", "name": "Apple Inc.", "market": "stocks"},
        {"symbol": "MSFT", "name": "Microsoft Corp.", "market": "stocks"},
        {"symbol": "GOOGL", "name": "Alphabet Inc.", "market": "stocks"},
        {"symbol": "AMZN", "name": "Amazon.com Inc.", "market": "stocks"},
        {"symbol": "TSLA", "name": "Tesla Inc.", "market": "stocks"},
        {"symbol": "NVDA", "name": "NVIDIA Corp.", "market": "stocks"},
        {"symbol": "META", "name": "Meta Platforms", "market": "stocks"},
        {"symbol": "JPM", "name": "JPMorgan Chase", "market": "stocks"},
    ],
    "crypto": [
        {"symbol": "BTC/USDT", "name": "Bitcoin", "market": "crypto", "exchange": "Binance"},
        {"symbol": "ETH/USDT", "name": "Ethereum", "market": "crypto", "exchange": "Binance"},
        {"symbol": "SOL/USDT", "name": "Solana", "market": "crypto", "exchange": "Binance"},
        {"symbol": "XRP/USDT", "name": "Ripple", "market": "crypto", "exchange": "Binance"},
        {"symbol": "ADA/USDT", "name": "Cardano", "market": "crypto", "exchange": "Binance"},
    ],
    "forex": [
        {"symbol": "EURUSD=X", "name": "EUR/USD", "market": "forex"},
        {"symbol": "GBPUSD=X", "name": "GBP/USD", "market": "forex"},
        {"symbol": "USDJPY=X", "name": "USD/JPY", "market": "forex"},
        {"symbol": "AUDUSD=X", "name": "AUD/USD", "market": "forex"},
        {"symbol": "USDCHF=X", "name": "USD/CHF", "market": "forex"},
    ],
    "futures": [
        {"symbol": "ES=F", "name": "E-Mini S&P 500", "market": "futures"},
        {"symbol": "NQ=F", "name": "E-Mini NASDAQ 100", "market": "futures"},
        {"symbol": "YM=F", "name": "E-Mini Dow", "market": "futures"},
        {"symbol": "RTY=F", "name": "E-Mini Russell 2000", "market": "futures"},
    ],
    "commodities": [
        {"symbol": "GC=F", "name": "Gold", "market": "commodities"},
        {"symbol": "SI=F", "name": "Silver", "market": "commodities"},
        {"symbol": "CL=F", "name": "Crude Oil WTI", "market": "commodities"},
        {"symbol": "NG=F", "name": "Natural Gas", "market": "commodities"},
    ],
    "indices": [
        {"symbol": "^GSPC", "name": "S&P 500", "market": "indices"},
        {"symbol": "^DJI", "name": "Dow Jones", "market": "indices"},
        {"symbol": "^IXIC", "name": "NASDAQ Composite", "market": "indices"},
        {"symbol": "^N225", "name": "Nikkei 225", "market": "indices"},
        {"symbol": "^FTSE", "name": "FTSE 100", "market": "indices"},
    ],
}
