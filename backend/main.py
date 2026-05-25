from __future__ import annotations

import math
import time
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware


JST = timezone(timedelta(hours=9))
SYMBOLS = ["USDJPY", "JP225", "US100", "XAUUSD"]
TIMEFRAMES = {
    "M1": 60,
    "M5": 5 * 60,
    "M15": 15 * 60,
    "M30": 30 * 60,
    "H1": 60 * 60,
    "H4": 4 * 60 * 60,
}
BASE_PRICES = {
    "USDJPY": 156.2,
    "JP225": 38200.0,
    "US100": 21800.0,
    "XAUUSD": 3340.0,
}
PRICE_STEPS = {
    "USDJPY": 0.03,
    "JP225": 12.0,
    "US100": 8.0,
    "XAUUSD": 1.2,
}

app = FastAPI(title="Realtime Chart Dummy Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def ensure_symbol(symbol: str) -> None:
    if symbol not in SYMBOLS:
        raise HTTPException(status_code=400, detail=f"Unknown symbol: {symbol}")


def ensure_timeframe(timeframe: str) -> int:
    try:
        return TIMEFRAMES[timeframe]
    except KeyError as error:
        raise HTTPException(
            status_code=400, detail=f"Unknown timeframe: {timeframe}"
        ) from error


def round_price(symbol: str, value: float) -> float:
    return round(value, 3 if symbol == "USDJPY" else 2)


def candle_for_bucket(
    symbol: str,
    timeframe_seconds: int,
    bucket_start: int,
    now: float,
) -> dict[str, float | int | str]:
    base = BASE_PRICES[symbol]
    step = PRICE_STEPS[symbol]
    seed = sum(ord(character) for character in symbol)
    index = bucket_start // timeframe_seconds
    open_price = base + step * math.sin((index + seed) * 0.31) * 4.0
    close_price = base + step * math.sin((index + seed) * 0.31 + 0.8) * 4.0
    current_bucket = bucket_start == int(now) // timeframe_seconds * timeframe_seconds

    if current_bucket:
        progress = (now - bucket_start) / timeframe_seconds
        movement = math.sin(now * 3.4 + seed) * step + progress * step * 2.0
        close_price += movement

    wick = step * (1.8 + abs(math.cos(index * 0.13)))
    high_price = max(open_price, close_price) + wick
    low_price = min(open_price, close_price) - wick
    volume = int(100 + abs(math.sin(index * 0.43 + seed)) * 900)

    return {
        "time": datetime.fromtimestamp(bucket_start, tz=JST).isoformat(),
        "open": round_price(symbol, open_price),
        "high": round_price(symbol, high_price),
        "low": round_price(symbol, low_price),
        "close": round_price(symbol, close_price),
        "volume": volume,
    }


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Realtime chart dummy backend is running."}


@app.get("/metadata/live")
async def get_live_metadata(symbol: str = "USDJPY") -> dict[str, object]:
    ensure_symbol(symbol)
    return {
        "symbol": symbol,
        "symbols": SYMBOLS,
        "timeframes": list(TIMEFRAMES),
        "source": "dummy",
    }


@app.get("/rates/from")
async def get_rates_from(
    symbol: str = "USDJPY",
    timeframe: str = "M1",
    count: int = Query(default=50, ge=1, le=200),
) -> dict[str, object]:
    ensure_symbol(symbol)
    timeframe_seconds = ensure_timeframe(timeframe)
    now = time.time()
    latest_bucket = int(now) // timeframe_seconds * timeframe_seconds
    candles = [
        candle_for_bucket(
            symbol,
            timeframe_seconds,
            latest_bucket - offset * timeframe_seconds,
            now,
        )
        for offset in range(count - 1, -1, -1)
    ]
    return {
        "symbol": symbol,
        "timeframe": timeframe,
        "requested_count": count,
        "returned_count": len(candles),
        "candles": candles,
    }
