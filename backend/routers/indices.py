from fastapi import APIRouter, Query
from models.market_data import ChartResponse, SearchResult, SymbolInfo
from services.data_service import get_chart_data, search, DEFAULT_SYMBOLS

router = APIRouter()


@router.get("/chart/{symbol:path}", response_model=ChartResponse)
async def get_indices_chart(symbol: str, interval: str = Query("1d")):
    data = get_chart_data(symbol, "indices", interval)
    return ChartResponse(symbol=symbol, market="indices", interval=interval, data=data)


@router.get("/symbols", response_model=SearchResult)
async def get_indices_symbols(q: str = Query("")):
    if not q:
        return SearchResult(results=[SymbolInfo(**s) for s in DEFAULT_SYMBOLS["indices"]])
    return SearchResult(results=search(q, "indices"))
