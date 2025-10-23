import { Coord } from './tangram.types';

// Tangram piece definitions
export const PIECE_DEFINITIONS: Coord[][] = [
  [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]],
  [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]],
  [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]],
  [[0, 0], [0, 1], [0, 2], [1, 2]],
  [[0, 0], [0, 1], [0, 2], [1, 0], [1, 2]],
  [[0, 0], [0, 1], [0, 2], [0, 3]],
  [[0, 0], [0, 1], [0, 2], [1, 1], [1, 2]],
  [[0, 0], [0, 1], [1, 1], [1, 2]],
  [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2]],
  [[0, 0], [0, 1], [0, 2], [1, 2], [1, 3]]
];

// Grid constants
export const MONTH_LOCATIONS = new Map<number, Coord>([
  [0, [0, 0]], [1, [1, 0]], [2, [2, 0]], [3, [3, 0]], [4, [4, 0]], [5, [5, 0]],
  [6, [0, 1]], [7, [1, 1]], [8, [2, 1]], [9, [3, 1]], [10, [4, 1]], [11, [5, 1]]
]);

const dayEntries: [number, Coord][] = Array.from({ length: 31 }, (_, index) => {
  const day = index + 1;
  const row = Math.floor(index / 7) + 2;
  const col = index % 7;
  return [day, [col, row]];
});

export const DAY_LOCATIONS = new Map<number, Coord>(dayEntries);

export const DAY_OF_WEEK_LOCATIONS = new Map<number, Coord>([
  [0, [3, 6]], [1, [4, 6]], [2, [5, 6]], [3, [6, 6]],
                 [4, [4, 7]], [5, [5, 7]], [6, [6, 7]]
]);
