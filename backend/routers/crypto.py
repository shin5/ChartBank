from fastapi import APIRouter, Query
from models.market_data import ChartResponse, SearchResult, SymbolInfo
from services.data_service import get_chart_data, search, DEFAULT_SYMBOLS

router = APIRouter()


@router.get("/chart/{symbol:path}", response_model=ChartResponse)
async def get_crypto_chart(symbol: str, interval: str = Query("1d")):
    data = get_chart_data(symbol, "crypto", interval)
    return ChartResponse(symbol=symbol, market="crypto", interval=interval, data=data)


@router.get("/symbols", response_model=SearchResult)
async def get_crypto_symbols(q: str = Query("")):
    if not q:
        return SearchResult(results=[SymbolInfo(**s) for s in DEFAULT_SYMBOLS["crypto"]])
    return SearchResult(results=search(q, "crypto"))
