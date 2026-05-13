'use client';

import { maskFor } from '@/lib/game/engine';
import type { PipeKind, Rotation } from '@/lib/game/types';

type Props = {
  kind: PipeKind;
  rotation: Rotation;
  glowAccent: 'cyan' | 'magenta';
  winningFlow: boolean;
};

const ACCENTS = {
  cyan: {
    stroke: '#22d3ee',
    dim: 'rgba(34,211,238,0.45)',
    pulse: '#67e8f9',
  },
  magenta: {
    stroke: '#e879f9',
    dim: 'rgba(232,121,249,0.45)',
    pulse: '#f0abfc',
  },
} as const;

export function PipeTile({ kind, rotation, glowAccent, winningFlow }: Props) {
  const accent = ACCENTS[glowAccent];
  const mask = maskFor(kind, rotation);

  const PORT_N = 1;
  const PORT_E = 2;
  const PORT_S = 4;
  const PORT_W = 8;

  const cx = 50;
  const cy = 50;
  const arm = 42;

  const lines: [number, number, number, number][] = [];
  if (mask & PORT_N) lines.push([cx, cy, cx, cy - arm]);
  if (mask & PORT_E) lines.push([cx, cy, cx + arm, cy]);
  if (mask & PORT_S) lines.push([cx, cy, cx, cy + arm]);
  if (mask & PORT_W) lines.push([cx, cy, cx - arm, cy]);

  const cls =
    winningFlow && kind !== 'block'
      ? 'animate-pulseGlow'
      : '';

  return (
    <svg
      viewBox="0 0 100 100"
      className={`h-full w-full ${cls}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{
        filter: winningFlow
          ? `drop-shadow(0 0 14px ${accent.pulse})`
          : `drop-shadow(0 0 10px ${accent.dim})`,
      }}
    >
      <polygon
        points="50,6 88,26 88,74 50,94 12,74 12,26"
        fill="rgba(12,14,36,0.92)"
        stroke={accent.dim}
        strokeWidth={1}
      />
      {kind === 'block' ? null : (
        <g strokeLinecap="round" strokeWidth={8}>
          {lines.map(([x1, y1, x2, y2], i) => (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={winningFlow ? accent.pulse : accent.stroke}
              opacity={kind === 'sink' || kind === 'source' ? 1 : 0.92}
            />
          ))}
        </g>
      )}
      {kind === 'source' ? (
        <circle cx={cx} cy={cy} r={10} fill={accent.stroke} opacity={0.85} />
      ) : null}
      {kind === 'sink' ? (
        <rect
          x={cx - 11}
          y={cy - 11}
          width={22}
          height={22}
          rx={4}
          fill="none"
          stroke={accent.stroke}
          strokeWidth={4}
          opacity={0.95}
        />
      ) : null}
    </svg>
  );
}
