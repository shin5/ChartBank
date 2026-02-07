from fastapi import APIRouter, Body
from models.market_data import QuotesResponse, QuoteData
from services.data_service import get_quotes, DEFAULT_SYMBOLS

router = APIRouter()


@router.get("/quotes", response_model=QuotesResponse)
async def get_default_quotes(market: str = ""):
    """Get quotes for default/popular symbols, optionally filtered by market."""
    items: list[dict] = []
    if market and market in DEFAULT_SYMBOLS:
        items = DEFAULT_SYMBOLS[market]
    else:
        for syms in DEFAULT_SYMBOLS.values():
            items.extend(syms[:3])  # top 3 per market

    quotes = get_quotes(items)
    return QuotesResponse(quotes=[QuoteData(**q) for q in quotes])


@router.post("/quotes", response_model=QuotesResponse)
async def get_custom_quotes(
    symbols: list[dict] = Body(..., example=[{"symbol": "AAPL", "name": "Apple", "market": "stocks"}])
):
    """Get quotes for a custom list of symbols."""
    quotes = get_quotes(symbols)
    return QuotesResponse(quotes=[QuoteData(**q) for q in quotes])
