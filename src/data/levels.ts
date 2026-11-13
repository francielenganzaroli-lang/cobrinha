import { LevelConfig, Point } from '../types/game';

export const GRID_SIZE = 20;
export const POINTS_PER_FOOD = 10;

export const INITIAL_SNAKE: Point[] = [
  { x: 9, y: 10 },
  { x: 8, y: 10 },
  { x: 7, y: 10 },
];

export const INITIAL_DIRECTION = 'RIGHT' as const;

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    name: 'Campo Aberto',
    description: 'Arena livre para aquecer os reflexos.',
    minScore: 0,
    speedMs: 145,
    obstacles: [],
  },
  {
    level: 2,
    name: 'Quatro Pilares',
    description: 'Velocidade maior e blocos nos quadrantes.',
    minScore: 50,
    speedMs: 124,
    obstacles: [
      // Quadrante superior esquerdo
      { x: 4, y: 4 },
      { x: 5, y: 4 },
      { x: 4, y: 5 },
      { x: 5, y: 5 },
      // Quadrante superior direito
      { x: 14, y: 4 },
      { x: 15, y: 4 },
      { x: 14, y: 5 },
      { x: 15, y: 5 },
      // Quadrante inferior esquerdo
      { x: 4, y: 14 },
      { x: 5, y: 14 },
      { x: 4, y: 15 },
      { x: 5, y: 15 },
      // Quadrante inferior direito
      { x: 14, y: 14 },
      { x: 15, y: 14 },
      { x: 14, y: 15 },
      { x: 15, y: 15 },
    ],
  },
  {
    level: 3,
    name: 'Portões Laterais',
    description: 'Barreiras horizontais e laterais em ritmo ágil.',
    minScore: 100,
    speedMs: 106,
    obstacles: [
      // Barreira horizontal superior
      { x: 6, y: 4 },
      { x: 7, y: 4 },
      { x: 8, y: 4 },
      { x: 9, y: 4 },
      { x: 10, y: 4 },
      { x: 11, y: 4 },
      { x: 12, y: 4 },
      { x: 13, y: 4 },
      // Barreira horizontal inferior
      { x: 6, y: 15 },
      { x: 7, y: 15 },
      { x: 8, y: 15 },
      { x: 9, y: 15 },
      { x: 10, y: 15 },
      { x: 11, y: 15 },
      { x: 12, y: 15 },
      { x: 13, y: 15 },
      // Laterais esquerdas
      { x: 3, y: 6 },
      { x: 3, y: 7 },
      { x: 3, y: 12 },
      { x: 3, y: 13 },
      // Laterais direitas
      { x: 16, y: 6 },
      { x: 16, y: 7 },
      { x: 16, y: 12 },
      { x: 16, y: 13 },
    ],
  },
  {
    level: 4,
    name: 'Encruzilhada',
    description: 'Cantos fechados e pilares centrais exigem precisão.',
    minScore: 160,
    speedMs: 90,
    obstacles: [
      // Canto superior esquerdo
      { x: 3, y: 3 },
      { x: 4, y: 3 },
      { x: 5, y: 3 },
      { x: 3, y: 4 },
      { x: 3, y: 5 },
      // Canto superior direito
      { x: 14, y: 3 },
      { x: 15, y: 3 },
      { x: 16, y: 3 },
      { x: 16, y: 4 },
      { x: 16, y: 5 },
      // Canto inferior esquerdo
      { x: 3, y: 14 },
      { x: 3, y: 15 },
      { x: 3, y: 16 },
      { x: 4, y: 16 },
      { x: 5, y: 16 },
      // Canto inferior direito
      { x: 16, y: 14 },
      { x: 16, y: 15 },
      { x: 16, y: 16 },
      { x: 14, y: 16 },
      { x: 15, y: 16 },
      // Pilares centrais
      { x: 9, y: 6 },
      { x: 10, y: 6 },
      { x: 9, y: 13 },
      { x: 10, y: 13 },
    ],
  },
  {
    level: 5,
    name: 'Arena Mestre',
    description: 'Circuito interno em alta velocidade.',
    minScore: 230,
    speedMs: 76,
    obstacles: [
      // Cantoneiras internas superiores
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 7, y: 5 },
      { x: 5, y: 6 },
      { x: 5, y: 7 },
      { x: 12, y: 5 },
      { x: 13, y: 5 },
      { x: 14, y: 5 },
      { x: 14, y: 6 },
      { x: 14, y: 7 },
      // Cantoneiras internas inferiores
      { x: 5, y: 12 },
      { x: 5, y: 13 },
      { x: 5, y: 14 },
      { x: 6, y: 14 },
      { x: 7, y: 14 },
      { x: 14, y: 12 },
      { x: 14, y: 13 },
      { x: 14, y: 14 },
      { x: 12, y: 14 },
      { x: 13, y: 14 },
      // Protetores internos norte e sul
      { x: 9, y: 7 },
      { x: 10, y: 7 },
      { x: 9, y: 12 },
      { x: 10, y: 12 },
    ],
  },
];

export function getLevelForScore(score: number): LevelConfig {
  let matched = LEVELS[0];
  for (const lvl of LEVELS) {
    if (score >= lvl.minScore) {
      matched = lvl;
    }
  }
  return matched;
}

export function getNextLevel(currentLevelNumber: number): LevelConfig | null {
  return LEVELS.find((lvl) => lvl.level === currentLevelNumber + 1) ?? null;
}
