"""WebSocket endpoint for real-time price updates."""

import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.data_service import get_chart_data, get_quotes

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        self.active.remove(ws)

    async def send_json(self, ws: WebSocket, data: dict):
        await ws.send_text(json.dumps(data))


manager = ConnectionManager()


@router.websocket("/ws/chart")
async def chart_ws(ws: WebSocket):
    """Stream latest candle data for a symbol."""
    await manager.connect(ws)
    try:
        while True:
            msg = await ws.receive_text()
            req = json.loads(msg)
            symbol = req.get("symbol", "AAPL")
            market = req.get("market", "stocks")
            interval = req.get("interval", "1d")

            bars = get_chart_data(symbol, market, interval)
            await manager.send_json(ws, {
                "type": "chart",
                "symbol": symbol,
                "market": market,
                "interval": interval,
                "data": [b.model_dump() for b in bars],
            })
    except WebSocketDisconnect:
        manager.disconnect(ws)


@router.websocket("/ws/quotes")
async def quotes_ws(ws: WebSocket):
    """Stream real-time quote updates for a list of symbols.

    Client sends: {"symbols": [{"symbol":"AAPL","name":"Apple","market":"stocks"}, ...]}
    Server pushes updated quotes every 5 seconds.
    """
    await manager.connect(ws)
    symbols: list[dict] = []

    async def push_quotes():
        """Fetch and push quotes in a loop."""
        while True:
            if symbols:
                try:
                    quotes = await asyncio.to_thread(get_quotes, symbols)
                    await manager.send_json(ws, {
                        "type": "quotes",
                        "quotes": quotes,
                    })
                except Exception:
                    pass
            await asyncio.sleep(5)

    push_task = asyncio.create_task(push_quotes())

    try:
        while True:
            msg = await ws.receive_text()
            req = json.loads(msg)
            if "symbols" in req:
                symbols = req["symbols"]
                # Send immediately on subscribe
                if symbols:
                    try:
                        quotes = await asyncio.to_thread(get_quotes, symbols)
                        await manager.send_json(ws, {
                            "type": "quotes",
                            "quotes": quotes,
                        })
                    except Exception:
                        pass
    except WebSocketDisconnect:
        push_task.cancel()
        manager.disconnect(ws)
