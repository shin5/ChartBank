from pydantic import BaseModel
from typing import List, Optional


class OHLCV(BaseModel):
    """Single candlestick bar."""
    time: int  # Unix timestamp (seconds)
    open: float
    high: float
    low: float
    close: float
    volume: float


class ChartResponse(BaseModel):
    symbol: str
    market: str
    interval: str
    data: List[OHLCV]


class SymbolInfo(BaseModel):
    symbol: str
    name: str
    market: str
    exchange: Optional[str] = None


class SearchResult(BaseModel):
    results: List[SymbolInfo]


class QuoteData(BaseModel):
    """Current price quote for a single symbol."""
    symbol: str
    name: str
    market: str
    price: float
    change: float          # absolute change
    change_percent: float  # percentage change
    high: float
    low: float
    volume: float
    prev_close: float


class QuotesResponse(BaseModel):
    quotes: List[QuoteData]
