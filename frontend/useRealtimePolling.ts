"use client";

import { useEffect, useRef, useState } from "react";

import type {
  ChartKey,
  ChartSelection,
  RealtimeDataSource,
  RealtimeRatesResponse,
} from "./types";

type ChartResponses = Record<ChartKey, RealtimeRatesResponse | null>;

const INITIAL_RESPONSES: ChartResponses = {
  chart1: null,
  chart2: null,
};

export function useRealtimePolling(
  dataSource: RealtimeDataSource,
  symbol: string,
  chart1: ChartSelection,
  chart2: ChartSelection,
  running: boolean,
  pollMs = 200,
) {
  const [responses, setResponses] = useState<ChartResponses>(INITIAL_RESPONSES);
  const [lastFetchAt, setLastFetchAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    let timer: number | null = null;
    let requestController: AbortController | null = null;

    async function poll() {
      requestController = new AbortController();
      try {
        const [chart1Response, chart2Response] = await Promise.all([
          dataSource.rates(symbol, chart1, requestController.signal),
          dataSource.rates(symbol, chart2, requestController.signal),
        ]);
        if (!active) {
          return;
        }

        const nextResponses = { chart1: chart1Response, chart2: chart2Response };
        const signature = JSON.stringify(nextResponses);
        if (signature !== lastSignatureRef.current) {
          setResponses(nextResponses);
          lastSignatureRef.current = signature;
        }
        setLastFetchAt(new Date().toISOString());
        setError(null);
      } catch (caught) {
        if (!active || (caught instanceof DOMException && caught.name === "AbortError")) {
          return;
        }
        setError(caught instanceof Error ? caught.message : "Realtime polling failed.");
      } finally {
        if (active && running) {
          timer = window.setTimeout(() => void poll(), pollMs);
        }
      }
    }

    void poll();
    return () => {
      active = false;
      requestController?.abort();
      if (timer !== null) {
        window.clearTimeout(timer);
      }
    };
  }, [chart1, chart2, dataSource, pollMs, running, symbol]);

  return { responses, lastFetchAt, error };
}
