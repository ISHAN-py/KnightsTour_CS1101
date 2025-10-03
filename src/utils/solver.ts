const BOARD_SIZE = 8;
const knightMoves = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

// Helper function to check if a move is valid
const isValid = (r: number, c: number, board: number[][]) => {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === 0;
};

/**
 * Finds a Knight's Tour path using backtracking.
 * @param board The current state of the board (0 for unvisited, 1 for visited).
 * @param currentRow The current row of the knight.
 * @param currentCol The current column of the knight.
 * @param moveCount The number of moves made so far.
 * @param path The current path of moves.
 * @returns A path if a tour is found, otherwise null.
 */
export const solveKnightTour = (
  board: number[][],
  currentRow: number,
  currentCol: number,
  moveCount: number,
  path: { row: number; col: number }[]
): { row: number; col: number }[] | null => {
  // Base case: If all squares are visited, a tour is found
  if (moveCount === BOARD_SIZE * BOARD_SIZE) {
    return path;
  }

  // Try all possible knight moves from the current position
  for (const [dr, dc] of knightMoves) {
    const nextRow = currentRow + dr;
    const nextCol = currentCol + dc;

    if (isValid(nextRow, nextCol, board)) {
      // Make the move
      board[nextRow][nextCol] = 1; // Mark as visited
      path.push({ row: nextRow, col: nextCol });

      // Recur for the next move
      const result = solveKnightTour(board, nextRow, nextCol, moveCount + 1, path);

      if (result) {
        return result; // If a tour is found, return it
      }

      // Backtrack: Unmake the move if it didn't lead to a solution
      path.pop();
      board[nextRow][nextCol] = 0; // Mark as unvisited
    }
  }

  return null; // No solution found from this path
};

/**
 * Checks if a Knight's Tour is possible from a given state.
 * @param board The current state of the board.
 * @param currentRow The current row of the knight.
 * @param currentCol The current column of the knight.
 * @param moveCount The number of moves made so far.
 * @returns True if a tour is possible, false otherwise.
 */
export const isTourPossible = (
  board: number[][],
  currentRow: number,
  currentCol: number,
  moveCount: number
): boolean => {
  // Create a deep copy of the board to avoid modifying the original game state
  const tempBoard = board.map(row => [...row]);
  tempBoard[currentRow][currentCol] = 1; // Mark current position as visited for the solver

  const result = solveKnightTour(tempBoard, currentRow, currentCol, moveCount, [{ row: currentRow, col: currentCol }]);
  return result !== null;
};

/**
 * Finds the next best move using the solver.
 * @param board The current state of the board.
 * @param currentRow The current row of the knight.
 * @param currentCol The current column of the knight.
 * @param moveCount The number of moves made so far.
 * @returns The next move if a tour is possible, otherwise null.
 */
export const getHint = (
  board: number[][],
  currentRow: number,
  currentCol: number,
  moveCount: number
): { row: number; col: number } | null => {
  // Create a deep copy of the board for the solver
  const tempBoard = board.map(row => [...row]);
  tempBoard[currentRow][currentCol] = 1; // Mark current position as visited for the solver

  const path = solveKnightTour(tempBoard, currentRow, currentCol, moveCount, [{ row: currentRow, col: currentCol }]);
  if (path && path.length > 1) {
    return path[1]; // Return the second element in the path (the first move from current position)
  }
  return null;
};