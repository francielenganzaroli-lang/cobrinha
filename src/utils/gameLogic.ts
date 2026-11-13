import { Direction, Point } from '../types/game';

export function pointsEqual(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

export function isOppositeDirection(current: Direction, next: Direction): boolean {
  return (
    (current === 'UP' && next === 'DOWN') ||
    (current === 'DOWN' && next === 'UP') ||
    (current === 'LEFT' && next === 'RIGHT') ||
    (current === 'RIGHT' && next === 'LEFT')
  );
}

export function getNextHead(head: Point, direction: Direction): Point {
  switch (direction) {
    case 'UP':
      return { x: head.x, y: head.y - 1 };
    case 'DOWN':
      return { x: head.x, y: head.y + 1 };
    case 'LEFT':
      return { x: head.x - 1, y: head.y };
    case 'RIGHT':
      return { x: head.x + 1, y: head.y };
  }
}

export function isOutOfBounds(point: Point, gridSize: number): boolean {
  return point.x < 0 || point.x >= gridSize || point.y < 0 || point.y >= gridSize;
}

export function spawnFood(
  snake: Point[],
  obstacles: Point[],
  gridSize: number
): Point {
  const occupied = new Set<string>();
  for (const seg of snake) {
    occupied.add(`${seg.x},${seg.y}`);
  }
  for (const obs of obstacles) {
    occupied.add(`${obs.x},${obs.y}`);
  }

  const available: Point[] = [];
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (!occupied.has(`${x},${y}`)) {
        available.push({ x, y });
      }
    }
  }

  if (available.length === 0) {
    return { x: 0, y: 0 };
  }

  const index = Math.floor(Math.random() * available.length);
  return available[index];
}
