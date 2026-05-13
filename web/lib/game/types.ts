export type PipeKind =
  | 'straight'
  | 'elbow'
  | 'cross'
  | 'source'
  | 'sink'
  | 'block';

export type Rotation = 0 | 1 | 2 | 3;

export interface CellTemplate {
  kind: PipeKind;
  rotation: Rotation;
  locked?: boolean;
}

export interface LevelDef {
  id: number;
  title: string;
  /** Row-major grid: rows[r][c] */
  grid: CellTemplate[][];
}
