import { CSSProperties } from 'react';

type FancySliderProps = {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  labels?: (string | JSX.Element)[];
  ariaLabel?: string;
  color?: string; // any CSS color for the fill
  labelClassName?: string;
};

export function FancySlider({ min, max, step = 1, value, onChange, labels, ariaLabel, color = '#7C4DFF', labelClassName = '' }: FancySliderProps) {
  const total = max - min;
  const clamped = Math.min(max, Math.max(min, value));
  const percent = ((clamped - min) / (total || 1)) * 100;

  const cssVars: CSSProperties & Record<string, string> = {
    ['--percent']: `${percent}%`,
    ['--color-from']: color,
  } as unknown as CSSProperties & Record<string, string>;

  return (
    <div className="space-y-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamped}
        aria-label={ariaLabel}
        onChange={(e) => onChange(Number(e.target.value))}
        className="fancy-range"
        style={cssVars}
      />
      {labels && (
        <div className="relative mt-1 text-xs text-slate-600" style={{ height: 28 }}>
          {labels.map((l, i) => {
            const leftPercent = (i / (labels.length - 1)) * 100;
            const translate = i === 0 ? '0%' : i === labels.length - 1 ? '-100%' : '-50%';
            return (
              <button
                type="button"
                key={i}
                className={`absolute top-0 px-1 rounded-md hover:bg-slate-100 ${labelClassName}`}
                style={{ left: `${leftPercent}%`, transform: `translateX(${translate})` }}
                onClick={() => onChange(min + i)}
              >
                {l}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}


