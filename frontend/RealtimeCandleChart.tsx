"use client";

import { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";

import type { Candle, TimeframeKey } from "./types";

type RealtimeCandleChartProps = {
  title: string;
  timeframe: TimeframeKey;
  candles: Candle[];
  height?: number;
};

export function RealtimeCandleChart({
  title,
  timeframe,
  candles,
  height = 480,
}: RealtimeCandleChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const chart = createChart(container, {
      autoSize: true,
      height,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#cbd5e1",
        attributionLogo: true,
      },
      grid: {
        vertLines: { color: "rgba(148, 163, 184, 0.12)" },
        horzLines: { color: "rgba(148, 163, 184, 0.12)" },
      },
      timeScale: { timeVisible: true, secondsVisible: false },
    });
    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#7fe7ff",
      downColor: "#ff7fc8",
      borderVisible: false,
      wickUpColor: "#7fe7ff",
      wickDownColor: "#ff7fc8",
    });
    const resizeObserver = new ResizeObserver(() => chart.timeScale().fitContent());
    resizeObserver.observe(container);
    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [height]);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series) {
      return;
    }
    const data: CandlestickData[] = candles.map((candle) => ({
      time: Math.floor(new Date(candle.time).getTime() / 1000) as UTCTimestamp,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));
    series.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950 p-4">
      <div className="mb-3 flex items-center gap-3">
        <h2 className="text-lg font-medium text-slate-100">{title}</h2>
        <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300">{timeframe}</span>
      </div>
      <div ref={containerRef} className="rounded-xl border border-white/10" style={{ height }} />
    </section>
  );
}
