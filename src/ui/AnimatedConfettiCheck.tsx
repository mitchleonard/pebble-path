import { useEffect, useRef, useState } from 'react';

export type AnimationVariant = 'confetti' | 'calm' | 'plain';

type AnimatedConfettiCheckProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  emoji?: string;
  variant?: AnimationVariant;
};

const CONFETTI_COLORS = ['#7C4DFF', '#34d399', '#fbbf24', '#E6D9FF', '#FFD7C2', '#CFF3DA'];
const CALM_COLORS = ['#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#CFF3DA', '#E6D9FF'];

export function AnimatedConfettiCheck({
  checked,
  onChange,
  label = 'Done',
  emoji,
  variant = 'confetti',
}: AnimatedConfettiCheckProps) {
  const [burstId, setBurstId] = useState(0);
  const prev = useRef(checked);

  useEffect(() => {
    if (!prev.current && checked) {
      setBurstId((id) => id + 1);
    }
    prev.current = checked;
  }, [checked]);

  // Confetti: 12 pieces in a radial burst
  const confettiPieces = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const distance = 28 + (i % 3) * 8;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance * 0.8;
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    return { dx, dy, color, id: i };
  });

  // Calm: 6 soft dots drifting upward
  const calmPieces = Array.from({ length: 6 }, (_, i) => {
    const spread = (i - 2.5) * 10; // spread horizontally: -25 to +25
    const dy = -(20 + (i % 3) * 8);
    const color = CALM_COLORS[i % CALM_COLORS.length];
    return { dx: spread, dy, color, id: i };
  });

  // Checked circle color varies by variant
  const checkedBg = variant === 'calm' ? 'bg-emerald-400 border-emerald-400' : 'bg-primary border-primary';

  return (
    <button
      type="button"
      className="inline-flex items-center gap-2"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
    >
      <span className="relative inline-flex items-center justify-center" style={{ width: 28, height: 28 }}>
        <span
          className={`inline-flex items-center justify-center rounded-full border-2 ${
            checked ? `${checkedBg} text-white` : 'border-slate-400 bg-white'
          } size-7 transition-colors ${variant === 'calm' && checked ? 'calm-check-pulse' : ''}`}
        >
          {checked && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
        </span>

        {/* Confetti burst */}
        {variant === 'confetti' && checked && (
          <span key={burstId} className="pointer-events-none absolute inset-0">
            {confettiPieces.map((p) => (
              emoji ? (
                <span
                  key={`${burstId}-${p.id}`}
                  className="confetti-piece"
                  style={{
                    left: '50%',
                    top: '50%',
                    background: 'transparent',
                    ['--dx' as any]: `${p.dx}px`,
                    ['--dy' as any]: `${p.dy}px`,
                  }}
                >{emoji}</span>
              ) : (
                <span
                  key={`${burstId}-${p.id}`}
                  className="confetti-piece"
                  style={{
                    left: '50%',
                    top: '50%',
                    background: p.color,
                    ['--dx' as any]: `${p.dx}px`,
                    ['--dy' as any]: `${p.dy}px`,
                  }}
                />
              )
            ))}
          </span>
        )}

        {/* Calm drift — soft dots float upward */}
        {variant === 'calm' && checked && (
          <span key={burstId} className="pointer-events-none absolute inset-0">
            {calmPieces.map((p) => (
              emoji ? (
                <span
                  key={`${burstId}-${p.id}`}
                  className="calm-piece"
                  style={{
                    left: '50%',
                    top: '50%',
                    background: 'transparent',
                    fontSize: '10px',
                    ['--dx' as any]: `${p.dx}px`,
                    ['--dy' as any]: `${p.dy}px`,
                    animationDelay: `${p.id * 80}ms`,
                  }}
                >{emoji}</span>
              ) : (
                <span
                  key={`${burstId}-${p.id}`}
                  className="calm-piece"
                  style={{
                    left: '50%',
                    top: '50%',
                    background: p.color,
                    ['--dx' as any]: `${p.dx}px`,
                    ['--dy' as any]: `${p.dy}px`,
                    animationDelay: `${p.id * 80}ms`,
                  }}
                />
              )
            ))}
          </span>
        )}

        {/* plain: no animation pieces */}
      </span>
      <span className="select-none">{label}</span>
    </button>
  );
}
