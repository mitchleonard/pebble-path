import { useEffect, useRef, useState } from 'react';

type AnimatedConfettiCheckProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  emoji?: string; // override confetti emoji
};

export function AnimatedConfettiCheck({ checked, onChange, label = 'Done', emoji }: AnimatedConfettiCheckProps) {
  const [burstId, setBurstId] = useState(0);
  const prev = useRef(checked);

  useEffect(() => {
    if (!prev.current && checked) {
      setBurstId((id) => id + 1);
    }
    prev.current = checked;
  }, [checked]);

  const colors = ['#7C4DFF', '#34d399', '#fbbf24', '#E6D9FF', '#FFD7C2', '#CFF3DA'];
  const pieces = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const distance = 28 + (i % 3) * 8;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance * 0.8;
    const color = colors[i % colors.length];
    return { dx, dy, color, id: i };
  });

  return (
    <button
      type="button"
      className="inline-flex items-center gap-2"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
    >
      <span className="relative inline-flex items-center justify-center" style={{ width: 28, height: 28 }}>
        <span className={`inline-flex items-center justify-center rounded-full border-2 ${checked ? 'bg-primary border-primary text-white' : 'border-slate-400 bg-white'} size-7 transition-colors`}> 
          {checked && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
        </span>
        {checked && (
          <span key={burstId} className="pointer-events-none absolute inset-0">
            {pieces.map((p) => (
              emoji ? (
                <span
                  key={`${burstId}-${p.id}`}
                  className="confetti-piece"
                  style={{
                    left: '50%',
                    top: '50%',
                    background: 'transparent',
                    // @ts-expect-error CSS var inline
                    ['--dx']: `${p.dx}px`,
                    // @ts-expect-error CSS var inline
                    ['--dy']: `${p.dy}px`,
                  } as any}
                >{emoji}</span>
              ) : (
                <span
                  key={`${burstId}-${p.id}`}
                  className="confetti-piece"
                  style={{
                    left: '50%',
                    top: '50%',
                    background: p.color,
                    // @ts-expect-error CSS var inline
                    ['--dx']: `${p.dx}px`,
                    // @ts-expect-error CSS var inline
                    ['--dy']: `${p.dy}px`,
                  } as any}
                />
              )
            ))}
          </span>
        )}
      </span>
      <span className="select-none">{label}</span>
    </button>
  );
}


