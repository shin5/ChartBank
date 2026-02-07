# ChartBank

TradingView風のチャート表示Webアプリケーション。株式・暗号通貨・FX・先物・コモディティ・インデックスのチャートをリアルタイムで表示します。

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, lightweight-charts, Tailwind CSS |
| Backend | Python FastAPI, WebSocket |
| Data | yfinance, ccxt (Binance), free APIs |

## Quick Start

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at http://localhost:8000

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:3000

## Supported Markets

- **株式 (Stocks)**: Yahoo Finance API
- **暗号通貨 (Crypto)**: Binance API via ccxt
- **FX (Forex)**: Yahoo Finance API
- **先物 (Futures)**: Yahoo Finance API
- **コモディティ (Commodities)**: Yahoo Finance API
- **インデックス (Indices)**: Yahoo Finance API
