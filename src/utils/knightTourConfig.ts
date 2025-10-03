interface BoardStartingPoints {
  [boardSize: number]: { row: number; col: number }[];
}

/**
 * Pre-computed valid starting points for Knight's Tour for different board sizes.
 * For a 5x5 board, a Knight's Tour is only possible from specific squares.
 * For a 6x6 board, a Knight's Tour is possible from any square.
 */
export const VALID_STARTING_POINTS: BoardStartingPoints = {
  5: [
    { row: 0, col: 0 }, { row: 0, col: 4 },
    { row: 4, col: 0 }, { row: 4, col: 4 },
    { row: 1, col: 2 }, { row: 2, col: 1 },
    { row: 2, col: 3 }, { row: 3, col: 2 },
  ],
  6: Array.from({ length: 6 }, (_, r) =>
    Array.from({ length: 6 }, (_, c) => ({ row: r, col: c }))
  ).flat(),
  // Add other board sizes here if needed, with their specific valid starting points
};