from fastapi import APIRouter, Query
from models.market_data import ChartResponse, SearchResult, SymbolInfo
from services.data_service import get_chart_data, search, DEFAULT_SYMBOLS

router = APIRouter()


@router.get("/chart/{symbol}", response_model=ChartResponse)
async def get_forex_chart(symbol: str, interval: str = Query("1d")):
    data = get_chart_data(symbol, "forex", interval)
    return ChartResponse(symbol=symbol, market="forex", interval=interval, data=data)


@router.get("/symbols", response_model=SearchResult)
async def get_forex_symbols(q: str = Query("")):
    if not q:
        return SearchResult(results=[SymbolInfo(**s) for s in DEFAULT_SYMBOLS["forex"]])
    return SearchResult(results=search(q, "forex"))
