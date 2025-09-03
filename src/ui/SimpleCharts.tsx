import { useMemo } from 'react';

type LinePoint = { x: number; y: number; rawY: number; label?: string };

function buildPath(points: LinePoint[]): string {
  if (points.length === 0) return '';
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
}

export function SimpleLineChart({
  data,
  color = '#7C4DFF',
  height = 160,
  grid = true,
  dotRadius = 3,
  xLabels,
  yLabel,
  minTickPx = 60,
}: {
  data: number[]; // values at equal spacing, NaN/undefined skipped
  color?: string;
  height?: number;
  grid?: boolean;
  dotRadius?: number;
  xLabels?: string[]; // same length as data (e.g., dates)
  yLabel?: string;
  minTickPx?: number;
}) {
  const paddingLeft = 44; // extra for y-axis labels
  const paddingRight = 24;
  const paddingTop = 28;
  const paddingBottom = 32; // extra so bottom labels don't clip
  const width = 600; // static width; labels are sparsified below
  const innerW = width - paddingLeft - paddingRight;
  const innerH = height - paddingTop - paddingBottom;
  const xs = data.map((_, i) => paddingLeft + (i * innerW) / Math.max(1, data.length - 1));
  const valid: { i: number; v: number }[] = data
    .map((v, i) => ({ i, v }))
    .filter((d) => typeof d.v === 'number' && !Number.isNaN(d.v));
  const min = Math.min(...valid.map((d) => d.v));
  const max = Math.max(...valid.map((d) => d.v));
  const range = max - min || 1;
  const points: LinePoint[] = valid.map(({ i, v }) => ({
    x: xs[i],
    y: paddingTop + (1 - (v - min) / range) * innerH,
    rawY: v,
    label: xLabels?.[i],
  }));
  const pathD = buildPath(points);

  // Tooltip state
  // Determine which x labels to show based on available spacing
  const labelIdxs = useMemo(() => {
    if (!xLabels || xLabels.length === 0) return [] as number[];
    const idxs: number[] = [];
    let lastX = -Infinity;
    for (let i = 0; i < xs.length; i++) {
      const x = xs[i];
      if (x - lastX >= minTickPx || i === 0 || i === xs.length - 1) {
        idxs.push(i);
        lastX = x;
      }
    }
    // ensure last included; if too close, replace last
    if (idxs[idxs.length - 1] !== xs.length - 1) {
      if (xs[xs.length - 1] - xs[idxs[idxs.length - 1]] < minTickPx && idxs.length > 1) {
        idxs[idxs.length - 1] = xs.length - 1;
      } else {
        idxs.push(xs.length - 1);
      }
    }
    return idxs;
  }, [xLabels, xs, minTickPx]);

  function formatLabel(label?: string): string | undefined {
    if (!label) return label;
    if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
      const d = new Date(label + 'T00:00:00');
      return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    }
    return label;
  }

  return (
    <svg className="w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={yLabel ? `${yLabel} trend` : 'line chart'}>
      {grid && (
        <g stroke="#e5e7eb">
          {Array.from({ length: 4 }).map((_, r) => (
            <line key={r} x1={paddingLeft} x2={width - paddingRight} y1={paddingTop + (r * innerH) / 3} y2={paddingTop + (r * innerH) / 3} />
          ))}
        </g>
      )}
      {/* Y-axis tick labels (min → max) */}
      <g>
        {Array.from({ length: 4 }).map((_, r) => {
          const frac = r / 3;
          const val = (min + (1 - frac) * (max - min)).toFixed(Number.isInteger(max - min) ? 0 : 1);
          const y = paddingTop + frac * innerH;
          return (
            <text key={r} x={paddingLeft - 10} y={y + 3} fontSize={10} textAnchor="end" fill="#64748b">{val}</text>
          );
        })}
      </g>
      <path d={pathD} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
      {points.map((p, idx) => (
        <circle key={idx} cx={p.x} cy={p.y} r={dotRadius} fill="#fff" stroke={color} strokeWidth={2} />
      ))}
      {xLabels && labelIdxs.map((i) => (
        <text key={i} x={xs[i]} y={height - 8} fontSize={10} textAnchor="middle" fill="#64748b">{formatLabel(xLabels[i])}</text>
      ))}
    </svg>
  );
}

export function SimpleBarChart({
  data,
  labels,
  color = '#7C4DFF',
  height = 180,
}: {
  data: number[];
  labels: string[];
  color?: string;
  height?: number;
}) {
  const padding = 24;
  const gap = 16;
  const desiredBarsOnScreen = Math.min(7, Math.max(5, labels.length));
  const availableWidth = 600 - padding * 2;
  const barWidth = Math.max(28, Math.floor((availableWidth - gap * (desiredBarsOnScreen - 1)) / desiredBarsOnScreen));
  const contentWidth = padding * 2 + labels.length * (barWidth + gap) - gap;
  const max = Math.max(1, ...data);
  
  function wrapLabel(name: string): string[] {
    const maxLen = 10;
    const words = name.split(' ');
    const lines: string[] = [];
    let line = '';
    for (const w of words) {
      if ((line + (line ? ' ' : '') + w).length <= maxLen) {
        line = line ? line + ' ' + w : w;
      } else {
        if (line) lines.push(line);
        line = w;
      }
      if (lines.length === 1 && line.length > maxLen) {
        lines.push(line.slice(0, maxLen - 1) + '…');
        return lines;
      }
    }
    if (line) lines.push(line);
    if (lines.length > 2) {
      return [lines[0], lines.slice(1).join(' ').slice(0, maxLen - 1) + '…'];
    }
    return lines;
  }
  
  const fits = labels.length <= desiredBarsOnScreen;
  
  function onWheel(e: React.WheelEvent<HTMLDivElement>) {
    if (fits) return;
    e.preventDefault();
    const container = e.currentTarget;
    container.scrollLeft += e.deltaY;
  }
  
  return (
    <div className="relative">
      {!fits && (
        <>
          <div className="absolute inset-y-0 left-0 w-8 pointer-events-none bg-gradient-to-r from-white to-transparent" />
          <div className="absolute inset-y-0 right-0 w-8 pointer-events-none bg-gradient-to-l from-white to-transparent" />
        </>
      )}
      <div 
        className="bar-chart-scroll-container"
        style={{ 
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingBottom: '8px'
        }} 
        onWheel={onWheel}
      >
        <div style={{ width: contentWidth, minWidth: contentWidth }}>
          <svg width={contentWidth} height={height} viewBox={`0 0 ${contentWidth} ${height}`} role="img" aria-label="bar chart">
            <g>
              {data.map((v, i) => {
                const h = ((height - padding * 2) * v) / max;
                const x = padding + i * (barWidth + gap);
                const y = height - padding - h;
                const name = labels[i] ?? '';
                return (
                  <g key={i}>
                    <rect x={x} y={y} width={barWidth} height={h} rx={8} fill={color} opacity={0.85} style={{ transformOrigin: `${x + barWidth / 2}px ${height - padding}px`, transform: 'scaleY(0)', animation: 'grow 500ms ease forwards' }} />
                    <text x={x + barWidth / 2} y={height - padding + 10} fontSize={10} textAnchor="middle" fill="#64748b">
                      {wrapLabel(name).map((ln, li) => (
                        <tspan key={li} x={x + barWidth / 2} dy={li === 0 ? 0 : 10}>{ln}</tspan>
                      ))}
                    </text>
                    <text x={x + barWidth / 2} y={y - 6} fontSize={10} textAnchor="middle" fill="#334155">{v}</text>
                  </g>
                );
              })}
            </g>
            <style>{`@keyframes grow { to { transform: scaleY(1); } }`}</style>
          </svg>
        </div>
      </div>
      {labels.length > 5 && (
        <div className="mt-2 flex items-center justify-center text-xs text-slate-600 select-none bg-slate-50 rounded-lg py-2 px-3">
          <span className="mr-2">📊</span>
          {fits ? 'All items visible' : 'Drag or scroll to see more ⇠⇢'}
        </div>
      )}
    </div>
  );
}


