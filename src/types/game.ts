export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameState =
  | 'TITLE_MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_UP'
  | 'GAME_OVER';

export interface Point {
  x: number;
  y: number;
}

export interface LevelConfig {
  level: number;
  name: string;
  description: string;
  minScore: number;
  speedMs: number;
  obstacles: Point[];
}

export interface RankingEntry {
  id: string;
  playerName: string;
  score: number;
  level: number;
  playedAt: string;
}
