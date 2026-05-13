const STORAGE_KEY = 'pipemania.progress';

export type GameProgress = {
  maxUnlockedLevel: number;
};

export function clampLevelIndex(maxUnlocked: number, totalLevels: number): number {
  return Math.min(Math.max(1, maxUnlocked), totalLevels);
}

export function loadProgress(totalLevels: number): GameProgress {
  if (typeof window === 'undefined') {
    return { maxUnlockedLevel: 1 };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    const obj = parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
    const n = Number(obj.maxUnlockedLevel);
    return {
      maxUnlockedLevel: clampLevelIndex(Number.isFinite(n) ? n : 1, totalLevels),
    };
  } catch {
    return { maxUnlockedLevel: 1 };
  }
}

export function saveProgress(progress: GameProgress): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

/** After completing level number `completedLevel` (1-based), bump unlock ceiling */
export function nextProgressAfterWin(
  completedLevel: number,
  prev: GameProgress,
  totalLevels: number,
): GameProgress {
  const candidate = completedLevel + 1;
  const merged = Math.max(prev.maxUnlockedLevel, candidate);
  return {
    maxUnlockedLevel: clampLevelIndex(merged, totalLevels),
  };
}
