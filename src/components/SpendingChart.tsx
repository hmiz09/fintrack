import React from 'react';
import { useFinTrack } from '../context/FinTrackContext';
import { formatIDR, formatShortAxis } from '../utils/formatters';

interface Point {
  x: number;
  y: number;
  val: number;
}

const toSmoothPath = (pts: Point[]): string => {
  const n = pts.length;
  if (n < 2) return '';
  if (n === 2) {
    return `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)} L ${pts[1].x.toFixed(1)} ${pts[1].y.toFixed(1)}`;
  }

  const dxs: number[] = [];
  const ms: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const dx = pts[i + 1].x - pts[i].x;
    const dy = pts[i + 1].y - pts[i].y;
    dxs.push(dx);
    ms.push(dx === 0 ? 0 : dy / dx);
  }

  const c1s: number[] = [ms[0]];
  for (let i = 0; i < dxs.length - 1; i++) {
    const m0 = ms[i];
    const m1 = ms[i + 1];
    if (m0 * m1 <= 0) {
      c1s.push(0);
    } else {
      const dx0 = dxs[i];
      const dx1 = dxs[i + 1];
      const common = dx0 + dx1;
      c1s.push((3 * common) / ((common + dx1) / m0 + (common + dx0) / m1));
    }
  }
  c1s.push(ms[ms.length - 1]);

  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const dx = dxs[i] / 3;
    const cp1x = pts[i].x + dx;
    const cp1y = pts[i].y + c1s[i] * dx;
    const cp2x = pts[i + 1].x - dx;
    const cp2y = pts[i + 1].y - c1s[i + 1] * dx;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${pts[i + 1].x.toFixed(1)} ${pts[i + 1].y.toFixed(1)}`;
  }
  return d;
};

export const SpendingChart: React.FC = () => {
  const {
    metrics,
    chartMode,
    setChartMode,
    compareOct,
    setCompareOct,
    selectedWeekIdx,
    setSelectedWeekIdx,
    selectedMonthIdx,
    setSelectedMonthIdx,
    monthlyHistory,
    lastMonthWeekly,
  } = useFinTrack();

  const isMonth = chartMode === 'month';
  const showOct = !isMonth && compareOct;

  const items = isMonth
    ? [
        ...monthlyHistory,
        { label: 'Oct', total: metrics.lastMonthTotal },
        { label: 'Nov', total: metrics.thisMonthTotal },
      ]
    : [0, 1, 2, 3].map((i) => ({
        label: `W${i + 1}`,
        total: metrics.thisMonthWeekly[i] || 0,
      }));

  const labels = items.map((x) => x.label);
  const curVals = items.map((x) => x.total);
  const octVals = showOct ? lastMonthWeekly : [];
  const selIdx = Math.min(
    items.length - 1,
    Math.max(0, isMonth ? selectedMonthIdx : selectedWeekIdx)
  );

  const rawMax = Math.max(...curVals, ...(octVals.length ? octVals : [0]), 1000000);
  const stepUnit = rawMax > 4000000 ? 1000000 : 500000;
  const midVal = Math.ceil((rawMax * 1.12) / (stepUnit * 2)) * stepUnit;
  const maxVal = midVal * 2;

  const svgW = 300;
  const svgH = 144;
  const padX = 14;
  const padTop = 36;
  const padBottom = 10;
  const innerW = svgW - padX * 2;
  const innerH = svgH - padTop - padBottom;
  const baseY = padTop + innerH;

  const getCoords = (arr: number[]): Point[] =>
    arr.map((v, i) => ({
      x: padX + (arr.length > 1 ? (innerW / (arr.length - 1)) * i : innerW / 2),
      y: baseY - (v / maxVal) * innerH,
      val: v,
    }));

  const curPts = getCoords(curVals);
  const octPts = showOct ? getCoords(octVals) : [];
  const curPath = toSmoothPath(curPts);
  const curArea = curPts.length
    ? `${curPath} L ${curPts[curPts.length - 1].x.toFixed(1)} ${baseY} L ${curPts[0].x.toFixed(1)} ${baseY} Z`
    : '';
  const octPath = showOct ? toSmoothPath(octPts) : '';

  const selCur = curVals[selIdx] || 0;
  const selOct = showOct ? octVals[selIdx] || 0 : 0;
  const prevIdx = selIdx - 1;
  const prevSamePeriod = prevIdx >= 0 ? curVals[prevIdx] : null;

  const onSelectPoint = (idx: number) => {
    if (isMonth) {
      setSelectedMonthIdx(idx);
    } else {
      setSelectedWeekIdx(idx);
    }
  };

  const colW = svgW / labels.length;

  return (
    <div className="bg-white mx-5 mb-5 p-5 rounded-3xl border border-rose-200/80 shadow-xs">
      {/* Header with Title and Mode Switcher */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Spending
          </span>
          <div className="text-xl font-black text-slate-800 tracking-tight">
            {formatIDR(metrics.thisMonthTotal)}
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-rose-50/70 rounded-xl border border-rose-100">
          <button
            type="button"
            onClick={() => setChartMode('week')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all min-h-[36px] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-rose-500 ${
              !isMonth ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => setChartMode('month')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all min-h-[36px] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-rose-500 ${
              isMonth ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Comparison Toggle (Only in Week mode) */}
      {!isMonth && (
        <div className="flex items-center justify-between pb-2 mb-2 text-xs border-b border-rose-100/60">
          <span className="text-slate-500">Compare with October:</span>
          <button
            type="button"
            onClick={() => setCompareOct(!compareOct)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors min-h-[32px] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-rose-500 ${
              compareOct
                ? 'bg-rose-500 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            {compareOct ? 'Comparing Oct' : '+ Compare Oct'}
          </button>
        </div>
      )}

      {/* Chart Layout: Left Y-ticks + Center SVG */}
      <div className="relative flex">
        {/* Short Y-Axis Labels */}
        <div className="w-8 shrink-0 flex flex-col justify-between text-[11px] font-medium text-slate-400 py-1 select-none text-right pr-1">
          <span>{formatShortAxis(maxVal)}</span>
          <span>{formatShortAxis(midVal)}</span>
          <span>0</span>
        </div>

        {/* SVG Container with Callout */}
        <div className="relative flex-1">
          {/* Active Floating Callout */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 pointer-events-none inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-rose-200/80 bg-white/95 text-xs tabular-nums whitespace-nowrap shadow-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <strong className="text-slate-800">
              {labels[selIdx]}: {formatIDR(selCur)}
            </strong>
            {showOct ? (
              <span className="text-slate-400 ml-1">Oct {formatIDR(selOct)}</span>
            ) : prevSamePeriod !== null ? (
              <span
                className={`ml-1 font-semibold ${
                  selCur - prevSamePeriod <= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {selCur - prevSamePeriod > 0 ? '+' : ''}
                {prevSamePeriod > 0
                  ? (((selCur - prevSamePeriod) / prevSamePeriod) * 100).toFixed(1)
                  : 0}
                %
              </span>
            ) : null}
          </div>

          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="w-full h-[144px] block touch-manipulation"
            aria-label="Spending chart"
          >
            <defs>
              <linearGradient id="roseChartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid guide lines */}
            <line
              x1="0"
              y1={padTop}
              x2={svgW}
              y2={padTop}
              stroke="#fee2e2"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <line
              x1="0"
              y1={padTop + innerH / 2}
              x2={svgW}
              y2={padTop + innerH / 2}
              stroke="#fee2e2"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <line x1="0" y1={baseY} x2={svgW} y2={baseY} stroke="#fecdd3" strokeWidth="1" />

            {/* Oct curve if comparing */}
            {showOct && octPath && (
              <path
                d={octPath}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="1.75"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />
            )}

            {/* Area gradient fill */}
            {curArea && <path d={curArea} fill="url(#roseChartGrad)" />}

            {/* Main spline curve */}
            {curPath && (
              <path
                d={curPath}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Interactive Data Points and Click Zones */}
            {curPts.map((p, i) => {
              const isSelected = i === selIdx;
              return (
                <g
                  key={i}
                  onClick={() => onSelectPoint(i)}
                  className="cursor-pointer"
                  tabIndex={0}
                  role="button"
                  aria-label={`${labels[i]} ${formatIDR(p.val)}`}
                >
                  <rect
                    x={(i * colW).toFixed(1)}
                    y="0"
                    width={colW.toFixed(1)}
                    height={svgH}
                    fill="transparent"
                  />
                  {showOct && octPts[i] && (
                    <circle
                      cx={p.x.toFixed(1)}
                      cy={octPts[i].y.toFixed(1)}
                      r={isSelected ? 3.5 : 2.5}
                      fill="#ffffff"
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                    />
                  )}
                  {isSelected && (
                    <circle
                      cx={p.x.toFixed(1)}
                      cy={p.y.toFixed(1)}
                      r="9"
                      fill="#f43f5e"
                      fillOpacity="0.15"
                    />
                  )}
                  <circle
                    cx={p.x.toFixed(1)}
                    cy={p.y.toFixed(1)}
                    r={isSelected ? 5 : 3.5}
                    fill={isSelected ? '#f43f5e' : '#ffffff'}
                    stroke="#f43f5e"
                    strokeWidth="2"
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Bottom X-Axis Labels */}
      <div className="flex justify-between pl-8 pr-1 pt-1 text-xs font-semibold text-slate-400">
        {labels.map((lbl, idx) => {
          const isSelected = idx === selIdx;
          return (
            <button
              key={lbl}
              type="button"
              onClick={() => onSelectPoint(idx)}
              className={`min-h-[32px] px-2 py-0.5 rounded-md transition-colors ${
                isSelected ? 'text-rose-600 bg-rose-50 font-bold' : 'hover:text-slate-600'
              }`}
            >
              {lbl}
            </button>
          );
        })}
      </div>
    </div>
  );
};
