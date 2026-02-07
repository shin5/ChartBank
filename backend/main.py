from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import stocks, crypto, forex, futures, commodities, indices, dashboard
from ws.websocket import router as ws_router

app = FastAPI(title="ChartBank API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stocks.router, prefix="/api/stocks", tags=["stocks"])
app.include_router(crypto.router, prefix="/api/crypto", tags=["crypto"])
app.include_router(forex.router, prefix="/api/forex", tags=["forex"])
app.include_router(futures.router, prefix="/api/futures", tags=["futures"])
app.include_router(commodities.router, prefix="/api/commodities", tags=["commodities"])
app.include_router(indices.router, prefix="/api/indices", tags=["indices"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(ws_router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "ChartBank"}
