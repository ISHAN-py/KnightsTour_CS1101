interface BoardStartingPoints {
  [boardSize: number]: { row: number; col: number }[];
}

/**
 * Pre-computed valid starting points for Knight's Tour for different board sizes.
 * For 5x5 and 6x6 boards, a Knight's Tour is known to be possible from any square.
 * This data would typically be generated once by a solver and stored.
 */
export const VALID_STARTING_POINTS: BoardStartingPoints = {
  5: Array.from({ length: 5 }, (_, r) =>
    Array.from({ length: 5 }, (_, c) => ({ row: r, col: c }))
  ).flat(),
  6: Array.from({ length: 6 }, (_, r) =>
    Array.from({ length: 6 }, (_, c) => ({ row: r, col: c }))
  ).flat(),
  // Add other board sizes here if needed, with their specific valid starting points
};