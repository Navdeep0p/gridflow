export type Direction = 'U' | 'D' | 'L' | 'R';

export interface Cell {
  row: number;
  col: number;
  direction: Direction;
  isObstacle: boolean;
  isTrigger: boolean;
  isTarget: boolean;
  rotationAngle: number; // Keep track of cumulative degrees (e.g. 0, 90, 180, 270, 360, etc.)
}

export interface LevelData {
  levelNumber: number;
  gridSize: number;
  grid: Cell[][];
  movesAllowed: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export type GameStatus = 'IDLE' | 'SIMULATING' | 'SUCCESS' | 'FAILURE';
