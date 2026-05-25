# Realtime Candle Chart Export

This export contains a portable frontend component and a small dummy backend.
It covers:

- Selecting `symbol`, `timeframe`, and `bars` from the GUI
- Drawing two realtime candlestick charts
- Polling a market data source every 200 ms
- Supplying compatible dummy candle data without MT5

## Structure

```text
export/realtime-chart/
  frontend/
    app/
      globals.css
      layout.tsx
      page.tsx
    RealtimeCandleChart.tsx
    RealtimeControls.tsx
    RealtimeDashboard.tsx
    httpDataSource.ts
    index.ts
    package.json
    types.ts
    useRealtimePolling.ts
  backend/
    main.py
    requirements.txt
```

## Frontend

The frontend is a standalone Next.js sample application. Run it in a second
PowerShell terminal after starting the dummy backend:

```powershell
cd export/realtime-chart/frontend
npm install
npm run dev
```

Open `http://localhost:3000`. The selected candles load immediately; click
`Start Realtime` to continue polling for live updates.

The standalone app proxies `/api/backend/*` to the local dummy backend. This
allows the dashboard to work when the frontend is opened through the machine's
LAN address as well as through `localhost`.

To reuse only the dashboard components in another Next.js app, import them:

```tsx
import { RealtimeDashboard } from "./RealtimeDashboard";

export default function Page() {
  return (
    <RealtimeDashboard
      apiBase="http://127.0.0.1:8100"
      initialSymbol="USDJPY"
      pollMs={200}
    />
  );
}
```

The components use Tailwind utility classes for layout and styling. They can
also be adapted to ordinary CSS if Tailwind is not part of the target app.

## Dummy Backend

The backend is a standalone FastAPI application. It creates deterministic
historical dummy candles and changes the latest candle as time advances, so
the realtime polling behavior can be tested in a browser.

```powershell
cd export/realtime-chart/backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8100 --reload
```

CORS is enabled so a separately running frontend development server can call
this backend directly.

## API Contract

The exported frontend calls these endpoints:

```http
GET /metadata/live?symbol=USDJPY
GET /rates/from?symbol=USDJPY&timeframe=M1&count=50
```

Supported dummy symbols are `USDJPY`, `JP225`, `US100`, and `XAUUSD`.
Supported timeframes are `M1`, `M5`, `M15`, `M30`, `H1`, and `H4`.

Example rates response:

```json
{
  "symbol": "USDJPY",
  "timeframe": "M1",
  "requested_count": 50,
  "returned_count": 50,
  "candles": [
    {
      "time": "2026-05-25T12:00:00+09:00",
      "open": 156.201,
      "high": 156.271,
      "low": 156.131,
      "close": 156.225,
      "volume": 302
    }
  ]
}
```

To connect a real provider later, keep the same two endpoints or inject an
alternative `RealtimeDataSource` into `RealtimeDashboard`.
