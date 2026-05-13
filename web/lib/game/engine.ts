import type { CellTemplate, PipeKind, Rotation } from './types';

export const PORT_N = 1;
export const PORT_E = 2;
export const PORT_S = 4;
export const PORT_W = 8;

const OPP: Record<number, number> = {
  [PORT_N]: PORT_S,
  [PORT_S]: PORT_N,
  [PORT_E]: PORT_W,
  [PORT_W]: PORT_E,
};

const DELTA: Record<number, [number, number]> = {
  [PORT_N]: [-1, 0],
  [PORT_E]: [0, 1],
  [PORT_S]: [1, 0],
  [PORT_W]: [0, -1],
};

const BASE_MASK: Record<PipeKind, number> = {
  straight: PORT_N | PORT_S,
  elbow: PORT_N | PORT_E,
  cross: PORT_N | PORT_E | PORT_S | PORT_W,
  source: PORT_S,
  sink: PORT_N,
  block: 0,
};

export function rotateMaskCw(mask: number): number {
  let out = 0;
  if (mask & PORT_N) out |= PORT_E;
  if (mask & PORT_E) out |= PORT_S;
  if (mask & PORT_S) out |= PORT_W;
  if (mask & PORT_W) out |= PORT_N;
  return out;
}

export function maskFor(kind: PipeKind, rotation: number): number {
  let m = BASE_MASK[kind];
  const steps = ((rotation % 4) + 4) % 4;
  for (let i = 0; i < steps; i++) m = rotateMaskCw(m);
  return m;
}

/** Clone initial rotations from level template */
export function initialRotations(grid: CellTemplate[][]): Rotation[][] {
  return grid.map((row) => row.map((cell) => cell.rotation));
}

export function pathExists(grid: CellTemplate[][], rotations: Rotation[][]): boolean {
  const h = grid.length;
  const w = grid[0]?.length ?? 0;
  let sr = -1;
  let sc = -1;
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      if (grid[r][c].kind === 'source') {
        sr = r;
        sc = c;
      }
    }
  }
  if (sr < 0) return false;

  const queue: [number, number][] = [[sr, sc]];
  const seen = new Set<string>();

  while (queue.length) {
    const [r, c] = queue.shift()!;
    const key = `${r},${c}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const cell = grid[r][c];
    const mask = maskFor(cell.kind, rotations[r][c]);

    for (const port of [PORT_N, PORT_E, PORT_S, PORT_W]) {
      if (!(mask & port)) continue;
      const [dr, dc] = DELTA[port];
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= h || nc < 0 || nc >= w) continue;
      const neighbor = grid[nr][nc];
      const nmask = maskFor(neighbor.kind, rotations[nr][nc]);
      const opp = OPP[port];
      if (!(nmask & opp)) continue;
      if (neighbor.kind === 'sink') return true;
      const nk = `${nr},${nc}`;
      if (!seen.has(nk)) queue.push([nr, nc]);
    }
  }

  return false;
}

export function rotateCell(
  grid: CellTemplate[][],
  rotations: Rotation[][],
  r: number,
  c: number,
  delta: 1 | -1,
): Rotation[][] | null {
  if (grid[r][c].locked) return null;
  const next = rotations.map((row) => [...row]);
  next[r][c] = ((((rotations[r][c] + delta) % 4) + 4) % 4) as Rotation;
  return next;
}
