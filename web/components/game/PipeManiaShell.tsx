'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LEVELS } from '@/lib/game/levels';
import {
  initialRotations,
  pathExists,
  rotateCell,
} from '@/lib/game/engine';
import {
  loadProgress,
  nextProgressAfterWin,
  saveProgress,
  type GameProgress,
} from '@/lib/game/progress';
import { GameBoard } from '@/components/game/GameBoard';

type Screen = 'menu' | 'select' | 'play';

export default function PipeManiaShell() {
  const total = LEVELS.length;
  const [mounted, setMounted] = useState(false);
  const [screen, setScreen] = useState<Screen>('menu');
  const [levelIdx, setLevelIdx] = useState(0);
  const [progress, setProgress] = useState<GameProgress>({
    maxUnlockedLevel: 1,
  });
  const [rotations, setRotations] = useState(() =>
    initialRotations(LEVELS[0].grid),
  );
  const [won, setWon] = useState(false);
  const winRecordedRef = useRef(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    setProgress(loadProgress(total));
  }, [mounted, total]);

  const level = LEVELS[levelIdx];

  useEffect(() => {
    setRotations(initialRotations(level.grid));
    setWon(false);
    winRecordedRef.current = false;
  }, [level]);

  useEffect(() => {
    if (won || winRecordedRef.current) return;
    if (!pathExists(level.grid, rotations)) return;
    winRecordedRef.current = true;
    setWon(true);
    setProgress((prev) => {
      const next = nextProgressAfterWin(level.id, prev, total);
      saveProgress(next);
      return next;
    });
  }, [level, rotations, won, total]);

  const openLevel = useCallback((idx: number) => {
    const lv = LEVELS[idx];
    if (lv.id > progress.maxUnlockedLevel) return;
    setLevelIdx(idx);
    setRotations(initialRotations(lv.grid));
    setWon(false);
    setScreen('play');
  }, [progress.maxUnlockedLevel]);

  const handleRotate = useCallback(
    (r: number, c: number, delta: 1 | -1) => {
      if (won) return;
      const next = rotateCell(level.grid, rotations, r, c, delta);
      if (next) setRotations(next);
    },
    [level.grid, rotations, won],
  );

  const subtitle = useMemo(
    () =>
      'Swipe any unlocked neon hex to rotate pipes. Short tap rotates clockwise. Route plasma from Source (●) to Sink (□).',
    [],
  );

  if (!mounted) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-white/50">
        Loading grid…
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col gap-4 px-4 pb-8 pt-4">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(rgba(56,189,248,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(232,121,249,0.25)_1px,transparent_1px)] [background-size:24px_24px]" />

      {screen === 'menu' ? (
        <div className="mx-auto flex max-w-md flex-col gap-6 text-center">
          <h1 className="font-display text-3xl tracking-[0.08em] text-transparent sm:text-4xl bg-gradient-to-br from-cyan-300 via-white to-fuchsia-400 bg-clip-text">
            PIPE MANIA
          </h1>
          <p className="text-sm leading-relaxed text-white/65">{subtitle}</p>
          <button
            type="button"
            className="rounded-2xl border border-cyan-400/40 bg-gradient-to-r from-cyan-600/40 to-fuchsia-600/35 px-6 py-4 font-display text-lg tracking-[0.25em] text-white hover:brightness-110"
            onClick={() => setScreen('select')}
          >
            ENTER ARCADE
          </button>
          <button
            type="button"
            className="text-xs uppercase tracking-[0.35em] text-white/40 hover:text-white/70"
            onClick={() => openLevel(Math.min(progress.maxUnlockedLevel - 1, total - 1))}
          >
            Resume sector {Math.min(progress.maxUnlockedLevel, total)}
          </button>
        </div>
      ) : null}

      {screen === 'select' ? (
        <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              className="text-xs uppercase tracking-[0.25em] text-cyan-300/90 hover:text-white"
              onClick={() => setScreen('menu')}
            >
              ← Back
            </button>
            <span className="font-display text-[10px] uppercase tracking-[0.45em] text-fuchsia-300/90">
              Levels
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {LEVELS.map((lv, idx) => {
              const locked = lv.id > progress.maxUnlockedLevel;
              return (
                <button
                  key={lv.id}
                  type="button"
                  disabled={locked}
                  onClick={() => openLevel(idx)}
                  className={`flex flex-col rounded-xl border px-3 py-4 text-left transition-all ${
                    locked
                      ? 'cursor-not-allowed border-white/10 bg-white/[0.03] opacity-45'
                      : 'border-cyan-400/35 bg-black/45 hover:border-fuchsia-400/55 hover:shadow-[0_0_22px_rgba(232,121,249,0.22)]'
                  }`}
                >
                  <span className="font-display text-[10px] text-white/45">
                    Sector {lv.id}
                  </span>
                  <span className="font-display text-sm tracking-wide text-white">
                    {lv.title}
                  </span>
                  {locked ? (
                    <span className="mt-2 text-[10px] uppercase tracking-[0.3em] text-white/35">
                      Locked
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {screen === 'play' ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              className="text-xs uppercase tracking-[0.25em] text-cyan-300/90 hover:text-white"
              onClick={() => setScreen('select')}
            >
              ← Levels
            </button>
            <div className="text-right">
              <div className="font-display text-[10px] uppercase tracking-[0.35em] text-fuchsia-400">
                Sector {level.id}
              </div>
              <div className="font-display text-lg text-white">{level.title}</div>
            </div>
          </div>
          <p className="text-center text-[11px] text-white/50">{subtitle}</p>
          <GameBoard grid={level.grid} rotations={rotations} onRotate={handleRotate} />

          {won ? (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="win-title"
              className="fixed inset-0 z-[8000] flex items-center justify-center bg-black/75 p-6 backdrop-blur-sm"
            >
              <div className="max-w-sm rounded-3xl border border-cyan-400/45 bg-[#090c22] p-8 text-center shadow-[0_0_60px_rgba(236,72,153,0.35)]">
                <h2 id="win-title" className="font-display text-2xl tracking-[0.12em] text-cyan-200">
                  FLOW STABILIZED
                </h2>
                <p className="mt-3 text-sm text-white/65">
                  Plasma locked onto Base relays. Sector {level.id} cleared.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  {levelIdx + 1 < total ? (
                    <button
                      type="button"
                      className="rounded-2xl bg-gradient-to-r from-cyan-500 to-fuchsia-600 px-4 py-3 font-display text-sm uppercase tracking-[0.3em] text-black"
                      onClick={() => {
                        const nextIdx = levelIdx + 1;
                        setWon(false);
                        winRecordedRef.current = false;
                        setLevelIdx(nextIdx);
                      }}
                    >
                      Next sector
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="rounded-2xl border border-white/15 px-4 py-3 text-xs uppercase tracking-[0.35em] text-white/75 hover:bg-white/5"
                    onClick={() => setScreen('select')}
                  >
                    Level map
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
