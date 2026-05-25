export const TIMEFRAME_OPTIONS = ["M1", "M5", "M15", "M30", "H1", "H4"] as const;
export const BAR_COUNT_OPTIONS = [50, 100, 150, 200] as const;

export type TimeframeKey = (typeof TIMEFRAME_OPTIONS)[number];
export type BarCount = (typeof BAR_COUNT_OPTIONS)[number];
export type ChartKey = "chart1" | "chart2";

export type ChartSelection = {
  timeframe: TimeframeKey;
  bars: BarCount;
};

export type Candle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type RealtimeMetadata = {
  symbol: string;
  symbols: string[];
};

export type RealtimeRatesResponse = {
  symbol: string;
  timeframe: TimeframeKey;
  candles: Candle[];
};

export interface RealtimeDataSource {
  metadata(symbol: string, signal?: AbortSignal): Promise<RealtimeMetadata>;
  rates(
    symbol: string,
    selection: ChartSelection,
    signal?: AbortSignal,
  ): Promise<RealtimeRatesResponse>;
}
