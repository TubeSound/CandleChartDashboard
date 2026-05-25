import type {
  ChartSelection,
  RealtimeDataSource,
  RealtimeMetadata,
  RealtimeRatesResponse,
} from "./types";

async function request<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { cache: "no-store", signal });
  if (!response.ok) {
    throw new Error((await response.text()) || `Request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export function createHttpRealtimeDataSource(apiBase = "/api/backend"): RealtimeDataSource {
  return {
    metadata(symbol, signal) {
      const params = new URLSearchParams({ symbol });
      return request<RealtimeMetadata>(`${apiBase}/metadata/live?${params.toString()}`, signal);
    },

    rates(symbol: string, selection: ChartSelection, signal?: AbortSignal) {
      const params = new URLSearchParams({
        symbol,
        timeframe: selection.timeframe,
        count: `${selection.bars}`,
      });
      return request<RealtimeRatesResponse>(`${apiBase}/rates/from?${params.toString()}`, signal);
    },
  };
}
