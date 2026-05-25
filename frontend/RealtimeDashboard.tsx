"use client";

import { useEffect, useMemo, useState } from "react";

import { createHttpRealtimeDataSource } from "./httpDataSource";
import { RealtimeCandleChart } from "./RealtimeCandleChart";
import { RealtimeControls } from "./RealtimeControls";
import { useRealtimePolling } from "./useRealtimePolling";
import type { ChartSelection, RealtimeDataSource } from "./types";

type RealtimeDashboardProps = {
  apiBase?: string;
  dataSource?: RealtimeDataSource;
  initialSymbol?: string;
  pollMs?: number;
};

export function RealtimeDashboard({
  apiBase,
  dataSource: suppliedDataSource,
  initialSymbol = "USDJPY",
  pollMs = 200,
}: RealtimeDashboardProps) {
  const httpDataSource = useMemo(() => createHttpRealtimeDataSource(apiBase), [apiBase]);
  const dataSource = suppliedDataSource ?? httpDataSource;
  const [symbol, setSymbol] = useState(initialSymbol);
  const [symbols, setSymbols] = useState([initialSymbol]);
  const [chart1, setChart1] = useState<ChartSelection>({ timeframe: "M1", bars: 50 });
  const [chart2, setChart2] = useState<ChartSelection>({ timeframe: "M5", bars: 50 });
  const [running, setRunning] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    dataSource.metadata(symbol, controller.signal)
      .then((metadata) => {
        setSymbols(metadata.symbols);
        setMetadataError(null);
      })
      .catch((caught) => {
        if (!(caught instanceof DOMException && caught.name === "AbortError")) {
          setMetadataError(caught instanceof Error ? caught.message : "Metadata request failed.");
        }
      });
    return () => controller.abort();
  }, [dataSource, symbol]);

  const { responses, lastFetchAt, error } = useRealtimePolling(
    dataSource,
    symbol,
    chart1,
    chart2,
    running,
    pollMs,
  );

  return (
    <main className="grid gap-4 bg-slate-900 p-4 text-slate-100 xl:grid-cols-[300px_1fr]">
      <RealtimeControls
        symbol={symbol}
        symbols={symbols}
        chart1={chart1}
        chart2={chart2}
        running={running}
        onSymbolChange={setSymbol}
        onChart1Change={setChart1}
        onChart2Change={setChart2}
        onRunningChange={setRunning}
      />
      <div className="grid gap-4">
        <header className="flex flex-wrap justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950 p-4">
          <span>{symbol} Realtime</span>
          <span className="text-sm text-slate-400">
            Polling {pollMs / 1000}s / Last fetch {lastFetchAt ?? "--"}
          </span>
          {metadataError || error ? (
            <span className="w-full text-sm text-red-400">{metadataError ?? error}</span>
          ) : null}
        </header>
        <RealtimeCandleChart
          title="Chart 1"
          timeframe={chart1.timeframe}
          candles={responses.chart1?.candles ?? []}
        />
        <RealtimeCandleChart
          title="Chart 2"
          timeframe={chart2.timeframe}
          candles={responses.chart2?.candles ?? []}
        />
      </div>
    </main>
  );
}
