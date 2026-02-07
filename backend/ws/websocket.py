"""WebSocket endpoint for real-time price updates."""

import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.data_service import get_chart_data

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
