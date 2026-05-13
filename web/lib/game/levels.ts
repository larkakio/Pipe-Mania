import type { CellTemplate, LevelDef } from './types';

function rowOfBlocks(w: number): CellTemplate[] {
  return Array.from({ length: w }, () => ({
    kind: 'block' as const,
    rotation: 0 as const,
    locked: true,
  }));
}

/** Horizontal conduit — one straight pipe starts vertical (`wrongCol` is column index). */
function spineHorizontal(id: number, title: string, wrongCol: number): LevelDef {
  const w = 7;
  const pipeRow: CellTemplate[] = [
    { kind: 'block', rotation: 0, locked: true },
    { kind: 'block', rotation: 0, locked: true },
    { kind: 'source', rotation: 3, locked: true },
    { kind: 'straight', rotation: wrongCol === 3 ? 0 : 1, locked: wrongCol === 3 },
    { kind: 'straight', rotation: wrongCol === 4 ? 0 : 1, locked: wrongCol === 4 },
    { kind: 'straight', rotation: wrongCol === 5 ? 0 : 1, locked: wrongCol === 5 },
    { kind: 'sink', rotation: 3, locked: true },
  ];
  const grid: CellTemplate[][] = [
    rowOfBlocks(w),
    rowOfBlocks(w),
    pipeRow,
    rowOfBlocks(w),
    rowOfBlocks(w),
  ];
  return { id, title, grid };
}

/** Horizontal spine with two tiles flipped — rotate both back to EW to win */
function spineHorizontalDual(id: number, title: string): LevelDef {
  const w = 8;
  const pipeRow: CellTemplate[] = [
    { kind: 'block', rotation: 0, locked: true },
    { kind: 'block', rotation: 0, locked: true },
    { kind: 'source', rotation: 3, locked: true },
    { kind: 'straight', rotation: 0, locked: false },
    { kind: 'straight', rotation: 1, locked: false },
    { kind: 'straight', rotation: 0, locked: false },
    { kind: 'straight', rotation: 1, locked: false },
    { kind: 'sink', rotation: 3, locked: true },
  ];
  const grid: CellTemplate[][] = [
    rowOfBlocks(w),
    rowOfBlocks(w),
    pipeRow,
    rowOfBlocks(w),
    rowOfBlocks(w),
  ];
  return { id, title, grid };
}

/** Vertical conduit framed in blocks */
function spineVertical(id: number, title: string, wrongRow: number): LevelDef {
  const h = 7;
  const w = 7;
  const grid: CellTemplate[][] = Array.from({ length: h }, () => rowOfBlocks(w));
  const col = 3;
  grid[1][col] = { kind: 'sink', rotation: 0, locked: true };
  grid[2][col] = {
    kind: 'straight',
    rotation: wrongRow === 2 ? 1 : 0,
    locked: wrongRow === 2,
  };
  grid[3][col] = {
    kind: 'straight',
    rotation: wrongRow === 3 ? 1 : 0,
    locked: wrongRow === 3,
  };
  grid[4][col] = {
    kind: 'straight',
    rotation: wrongRow === 4 ? 1 : 0,
    locked: wrongRow === 4,
  };
  grid[5][col] = {
    kind: 'straight',
    rotation: wrongRow === 5 ? 1 : 0,
    locked: wrongRow === 5,
  };
  grid[6][col] = { kind: 'source', rotation: 2, locked: true };
  return { id, title, grid };
}

/** Vertical spine — two segments horizontal until rotated */
function spineVerticalDual(id: number, title: string): LevelDef {
  const h = 8;
  const w = 7;
  const grid: CellTemplate[][] = Array.from({ length: h }, () => rowOfBlocks(w));
  const col = 3;
  grid[1][col] = { kind: 'sink', rotation: 0, locked: true };
  grid[2][col] = { kind: 'straight', rotation: 1, locked: false };
  grid[3][col] = { kind: 'straight', rotation: 0, locked: false };
  grid[4][col] = { kind: 'straight', rotation: 1, locked: false };
  grid[5][col] = { kind: 'straight', rotation: 0, locked: false };
  grid[6][col] = { kind: 'straight', rotation: 0, locked: false };
  grid[7][col] = { kind: 'source', rotation: 2, locked: true };
  return { id, title, grid };
}

export const LEVELS: LevelDef[] = [
  spineHorizontal(1, 'Boot Sequence', 4),
  spineHorizontal(2, 'Mirror Line', 5),
  spineHorizontal(3, 'Triple Fault', 3),
  spineVertical(4, 'Sky Shaft', 3),
  spineVertical(5, 'Hyper Column', 4),
  spineHorizontalDual(6, 'Twin Fault'),
  spineHorizontalDual(7, 'Echo Spine'),
  spineVerticalDual(8, 'Twin Shaft'),
];
