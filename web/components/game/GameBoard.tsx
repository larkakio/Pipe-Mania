'use client';

import { useCallback, useMemo, useRef } from 'react';
import type { CellTemplate, Rotation } from '@/lib/game/types';
import { PipeTile } from '@/components/game/PipeTile';
import { pathExists } from '@/lib/game/engine';

type Props = {
  grid: CellTemplate[][];
  rotations: Rotation[][];
  onRotate: (r: number, c: number, delta: 1 | -1) => void;
};

const SWIPE_MIN = 28;

export function GameBoard({ grid, rotations, onRotate }: Props) {
  const pointerRef = useRef<{
    x: number;
    y: number;
    r: number;
    c: number;
    id: number;
  } | null>(null);

  const flowing = useMemo(
    () => pathExists(grid, rotations),
    [grid, rotations],
  );

  const handlePointerDown = useCallback(
    (r: number, c: number, e: React.PointerEvent) => {
      if (grid[r][c].locked || grid[r][c].kind === 'block') return;
      pointerRef.current = {
        x: e.clientX,
        y: e.clientY,
        r,
        c,
        id: e.pointerId,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [grid],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const p = pointerRef.current;
      pointerRef.current = null;
      if (!p || e.pointerId !== p.id) return;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* capture already released */
      }
      const dx = e.clientX - p.x;
      const dy = e.clientY - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < SWIPE_MIN) {
        onRotate(p.r, p.c, 1);
        return;
      }
      if (Math.abs(dx) > Math.abs(dy)) {
        onRotate(p.r, p.c, dx > 0 ? 1 : -1);
      } else {
        onRotate(p.r, p.c, dy > 0 ? 1 : -1);
      }
    },
    [onRotate],
  );

  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  return (
    <div
      className="mx-auto w-full max-w-[min(100vw-2rem,520px)] touch-none select-none"
      style={{
        touchAction: 'none',
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: '6px',
      }}
    >
      {grid.map((row, r) =>
        row.map((cell, c) => (
          <button
            key={`${r}-${c}`}
            type="button"
            aria-label={`Pipe cell row ${r + 1} column ${c + 1}`}
            disabled={cell.kind === 'block'}
            className={`relative aspect-square rounded-xl border bg-black/35 p-1 transition-colors ${
              cell.kind === 'block'
                ? 'cursor-default border-transparent opacity-35'
                : cell.locked
                  ? 'cursor-default border-cyan-500/30'
                  : 'cursor-pointer border-cyan-400/35 hover:border-fuchsia-400/55 active:scale-[0.97]'
            }`}
            style={{
              boxShadow: flowing ? '0 0 22px rgba(34,211,238,0.18)' : undefined,
            }}
            onPointerDown={(e) => handlePointerDown(r, c, e)}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => {
              pointerRef.current = null;
            }}
          >
            <PipeTile
              kind={cell.kind}
              rotation={rotations[r][c]}
              glowAccent={(r + c) % 2 === 0 ? 'cyan' : 'magenta'}
              winningFlow={flowing && cell.kind !== 'block'}
            />
          </button>
        )),
      )}
    </div>
  );
}
