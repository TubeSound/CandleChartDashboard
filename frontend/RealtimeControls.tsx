"use client";

import {
  BAR_COUNT_OPTIONS,
  TIMEFRAME_OPTIONS,
  type BarCount,
  type ChartSelection,
  type TimeframeKey,
} from "./types";

type RealtimeControlsProps = {
  symbol: string;
  symbols: string[];
  chart1: ChartSelection;
  chart2: ChartSelection;
  running: boolean;
  onSymbolChange: (symbol: string) => void;
  onChart1Change: (selection: ChartSelection) => void;
  onChart2Change: (selection: ChartSelection) => void;
  onRunningChange: (running: boolean) => void;
};

function Selector<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <select
        className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100"
        value={value}
        onChange={(event) => onChange(options.find((option) => `${option}` === event.target.value) ?? value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function ChartSelectors({
  name,
  selection,
  onChange,
}: {
  name: string;
  selection: ChartSelection;
  onChange: (selection: ChartSelection) => void;
}) {
  return (
    <div className="grid gap-3 rounded-xl border border-white/10 p-3">
      <p className="text-sm font-medium text-slate-200">{name}</p>
      <Selector<TimeframeKey>
        label="Timeframe"
        value={selection.timeframe}
        options={TIMEFRAME_OPTIONS}
        onChange={(timeframe) => onChange({ ...selection, timeframe })}
      />
      <Selector<BarCount>
        label="Bars"
        value={selection.bars}
        options={BAR_COUNT_OPTIONS}
        onChange={(bars) => onChange({ ...selection, bars })}
      />
    </div>
  );
}

export function RealtimeControls({
  symbol,
  symbols,
  chart1,
  chart2,
  running,
  onSymbolChange,
  onChart1Change,
  onChart2Change,
  onRunningChange,
}: RealtimeControlsProps) {
  return (
    <aside className="grid gap-4 rounded-2xl border border-white/10 bg-slate-950 p-4">
      <Selector label="Symbol" value={symbol} options={symbols} onChange={onSymbolChange} />
      <ChartSelectors name="Chart 1" selection={chart1} onChange={onChart1Change} />
      <ChartSelectors name="Chart 2" selection={chart2} onChange={onChart2Change} />
      <button
        className="rounded-xl bg-cyan-500 px-4 py-3 font-medium text-slate-950"
        onClick={() => onRunningChange(!running)}
        type="button"
      >
        {running ? "Stop Realtime" : "Start Realtime"}
      </button>
    </aside>
  );
}
