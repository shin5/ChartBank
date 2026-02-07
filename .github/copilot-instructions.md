<!-- ChartBank - workspace instructions for Copilot -->

## Project: ChartBank

A TradingView-like charting web application.

### Tech Stack
- **Frontend**: Next.js 14 + TypeScript + lightweight-charts + Tailwind CSS
- **Backend**: Python FastAPI + WebSocket
- **Data Sources**: yfinance, ccxt (Binance), free market APIs

### Markets
Stocks, Crypto, FX, Futures, Commodities, Indices

### Architecture
- `frontend/` — Next.js app (port 3000)
- `backend/` — FastAPI server (port 8000)
- No authentication required

### Development
- Backend: `cd backend && uvicorn main:app --reload`
- Frontend: `cd frontend && npm run dev`
