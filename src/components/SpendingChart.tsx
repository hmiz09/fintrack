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

  const diff = metrics.thisMonthTotal - metrics.lastMonthTotal;
  const diffPct = metrics.lastMonthTotal > 0 ? (diff / metrics.lastMonthTotal) * 100 : 0;
  const isSaving = diff <= 0;

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

  const n = labels.length;
  const colW = svgW / n;

  const calloutStyle =
    selIdx === 0
      ? { left: 0 }
      : selIdx === n - 1
      ? { right: 0 }
      : selIdx < n / 2
      ? { left: `${Math.max(4, Math.round((selIdx / (n - 1)) * 22))}%` }
      : { right: `${Math.max(4, Math.round(((n - 1 - selIdx) / (n - 1)) * 22))}%` };

  const selectPoint = (i: number) => {
    if (isMonth) {
      setSelectedMonthIdx(i);
    } else {
      setSelectedWeekIdx(i);
    }
  };

  const topPct = (padTop / svgH) * 100;
  const midPct = ((padTop + innerH / 2) / svgH) * 100;
  const botPct = (baseY / svgH) * 100;

  return (
    <section
      aria-label="Monthly spending comparison"
      className="rounded-2xl p-4 border space-y-3.5"
      style={{
        background: 'var(--pk-card)',
        borderColor: 'var(--pk-border)',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--pk-muted)' }}
          >
            SPENDING
          </p>
          <p className="text-2xl font-bold tabular-nums tracking-tight mt-0.5 leading-snug">
            {formatIDR(metrics.thisMonthTotal)}
          </p>
        </div>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-lg tabular-nums shrink-0"
          style={{
            background: isSaving ? 'var(--pk-success-soft)' : 'var(--pk-error-soft)',
            color: isSaving ? 'var(--pk-success-text)' : 'var(--pk-error-text)',
          }}
        >
          {isSaving ? 'Down' : 'Up'} {Math.abs(diffPct).toFixed(1)}%
        </span>
      </div>

      {/* Comparison Strip */}
      <div
        className="flex items-center justify-between gap-2 text-xs py-2.5 px-3 rounded-xl"
        style={{ background: 'var(--pk-soft)' }}
      >
        <span style={{ color: 'var(--pk-muted)' }}>
          Last month:{' '}
          <strong className="tabular-nums font-semibold" style={{ color: 'var(--pk-text)' }}>
            {formatIDR(metrics.lastMonthTotal)}
          </strong>
        </span>
        <span
          className="font-semibold tabular-nums shrink-0"
          style={{
            color: isSaving ? 'var(--pk-success-text)' : 'var(--pk-error-text)',
          }}
        >
          {isSaving ? '-' : '+'}
          {formatIDR(Math.abs(diff))}
        </span>
      </div>

      {/* Chart Block */}
      <div className="pt-1 space-y-2.5">
        <div className="flex items-center justify-between gap-2 h-7">
          <h3 className="text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--pk-text)' }}>
            {isMonth ? 'Monthly Trend' : 'Weekly Trend'}
          </h3>
          {!isMonth ? (
            <button
              type="button"
              onClick={() => setCompareOct(!compareOct)}
              className="week-tab h-7 inline-flex items-center px-2.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
              style={{
                background: showOct ? 'var(--pk-primary-soft)' : 'var(--pk-soft)',
                color: showOct ? 'var(--pk-primary-text)' : 'var(--pk-muted)',
              }}
            >
              {showOct ? 'Showing vs Oct' : '+ vs Oct'}
            </button>
          ) : (
            <span
              className="h-7 inline-flex items-center px-2.5 rounded-full text-xs font-medium whitespace-nowrap"
              style={{ background: 'var(--pk-soft)', color: 'var(--pk-muted)' }}
            >
              6 months
            </span>
          )}
        </div>

        {/* Mode Switcher: Week | Month */}
        <div className="p-1 rounded-xl grid grid-cols-2 gap-1" style={{ background: 'var(--pk-soft)' }}>
          <button
            type="button"
            onClick={() => setChartMode('week')}
            className={`week-tab py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              !isMonth ? 'is-active' : ''
            }`}
            style={{
              background: !isMonth ? 'var(--pk-card)' : 'transparent',
              color: !isMonth ? 'var(--pk-text)' : 'var(--pk-muted)',
              boxShadow: !isMonth ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => setChartMode('month')}
            className={`week-tab py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isMonth ? 'is-active' : ''
            }`}
            style={{
              background: isMonth ? 'var(--pk-card)' : 'transparent',
              color: isMonth ? 'var(--pk-primary-text)' : 'var(--pk-muted)',
              boxShadow: isMonth ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            Month
          </button>
        </div>

        {/* Wide Grid-Locked Chart (Ultra-compact Y-axis + edge-to-edge plot) */}
        <div className="grid grid-cols-[28px_1fr] gap-x-0.5 -mx-1 pt-1">
          <div
            className="relative h-[144px] text-right text-xs tabular-nums leading-none whitespace-nowrap select-none"
            style={{ color: 'var(--pk-muted)' }}
          >
            <span className="absolute right-0.5 -translate-y-1/2" style={{ top: `${topPct}%` }}>
              {formatShortAxis(maxVal)}
            </span>
            <span className="absolute right-0.5 -translate-y-1/2" style={{ top: `${midPct}%` }}>
              {formatShortAxis(midVal)}
            </span>
            <span className="absolute right-0.5 -translate-y-1/2" style={{ top: `${botPct}%` }}>
              0
            </span>
          </div>

          <div className="relative">
            {/* Callout */}
            <div
              className="absolute top-0 z-10 pointer-events-none inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs tabular-nums whitespace-nowrap shadow-xs"
              style={{
                background: 'rgba(255, 249, 251, 0.96)',
                borderColor: 'var(--pk-border)',
                ...calloutStyle,
              }}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--pk-primary)' }} />
              <strong style={{ color: 'var(--pk-text)' }}>
                {labels[selIdx]}: {formatIDR(selCur)}
              </strong>
              {showOct ? (
                <span style={{ color: 'var(--pk-muted)' }}>Oct {formatIDR(selOct)}</span>
              ) : prevSamePeriod !== null ? (
                <span
                  className="font-semibold"
                  style={{
                    color:
                      selCur - prevSamePeriod <= 0 ? 'var(--pk-success-text)' : 'var(--pk-error-text)',
                  }}
                >
                  {selCur - prevSamePeriod > 0 ? '+' : ''}
                  {prevSamePeriod > 0
                    ? (((selCur - prevSamePeriod) / prevSamePeriod) * 100).toFixed(1)
                    : 0}
                  % vs {labels[prevIdx]}
                </span>
              ) : (
                <span style={{ color: 'var(--pk-muted)' }}>{isMonth ? 'Baseline' : 'Start of Nov'}</span>
              )}
            </div>

            {/* SVG Plot */}
            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              className="w-full h-[144px] block touch-manipulation"
              aria-label="Spending comparison chart"
            >
              <defs>
                <linearGradient id="roseAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c81e68" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#c81e68" stopOpacity="0" />
                </linearGradient>
              </defs>

              <line
                x1="0"
                y1={padTop}
                x2={svgW}
                y2={padTop}
                stroke="#f1dde7"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <line
                x1="0"
                y1={padTop + innerH / 2}
                x2={svgW}
                y2={padTop + innerH / 2}
                stroke="#f1dde7"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <line x1="0" y1={baseY} x2={svgW} y2={baseY} stroke="#ead4df" strokeWidth="1" />

              {showOct && octPath && (
                <path
                  d={octPath}
                  fill="none"
                  stroke="#9a7d8c"
                  strokeWidth="1.75"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
              )}

              {curArea && <path d={curArea} fill="url(#roseAreaGrad)" />}

              {curPath && (
                <path
                  d={curPath}
                  fill="none"
                  stroke="#c81e68"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {curPts.map((p, i) => (
                <g
                  key={i}
                  onClick={() => selectPoint(i)}
                  className="cursor-pointer"
                  aria-hidden="true"
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
                      r={i === selIdx ? 3.5 : 2.75}
                      fill="#ffffff"
                      stroke="#9a7d8c"
                      strokeWidth="1.5"
                    />
                  )}
                  {i === selIdx && (
                    <circle
                      cx={p.x.toFixed(1)}
                      cy={p.y.toFixed(1)}
                      r="9.5"
                      fill="#c81e68"
                      fillOpacity="0.14"
                    />
                  )}
                  <circle
                    cx={p.x.toFixed(1)}
                    cy={p.y.toFixed(1)}
                    r={i === selIdx ? 5 : 3.25}
                    fill={i === selIdx ? '#c81e68' : '#ffffff'}
                    stroke="#c81e68"
                    strokeWidth="2"
                  />
                </g>
              ))}
            </svg>
          </div>

          <div />
          <div className="flex items-center justify-between h-9 mt-1">
            {labels.map((lbl, i) => {
              const active = i === selIdx;
              return (
                <button
                  key={lbl}
                  type="button"
                  onClick={() => selectPoint(i)}
                  className={`week-tab w-8 h-9 rounded-full text-xs tabular-nums whitespace-nowrap flex items-center justify-center transition-colors ${
                    active ? 'is-active font-bold' : 'font-medium'
                  }`}
                  style={{
                    background: active ? 'var(--pk-primary-soft)' : 'transparent',
                    color: active ? 'var(--pk-primary-text)' : 'var(--pk-muted)',
                  }}
                >
                  {lbl}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
