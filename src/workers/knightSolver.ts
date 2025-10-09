const knightMoves = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

// Helper function to check if a move is valid
const isValid = (r: number, c: number, boardSize: number, board: number[][]) => {
  return r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === 0;
};

// Helper function to get the number of valid moves from a given square (degree)
// This function needs to be aware of the current board state (visited squares)
const getDegree = (r: number, c: number, boardSize: number, currentBoard: number[][]) => {
  let count = 0;
  for (const [dr, dc] of knightMoves) {
    const nextR = r + dr;
    const nextC = c + dc;
    // A move is valid if it's within bounds and to an unvisited square
    if (nextR >= 0 && nextR < boardSize && nextC >= 0 && nextC < boardSize && currentBoard[nextR][nextC] === 0) {
      count++;
    }
  }
  return count;
};

/**
 * Finds a Knight's Tour path using Backtracking with Warnsdorff's Rule.
 * @param board The current state of the board (0 for unvisited, 1 for visited).
 * @param currentRow The current row of the knight.
 * @param currentCol The current column of the knight.
 * @param currentVisitedCount The number of squares visited so far in the current path.
 * @param path The current path of moves.
 * @param boardSize The size of the board.
 * @returns A path if a tour is found, otherwise null.
 */
const solveKnightTour = (
  board: number[][],
  currentRow: number,
  currentCol: number,
  currentVisitedCount: number,
  path: { row: number; col: number }[],
  boardSize: number
): { row: number; col: number }[] | null => {
  // Base case: If all squares are visited, a tour is found
  if (currentVisitedCount === boardSize * boardSize) {
    return path;
  }

  // Calculate all possible next moves and their degrees
  const possibleNextMoves: { row: number; col: number; degree: number }[] = [];
  for (const [dr, dc] of knightMoves) {
    const nextR = currentRow + dr;
    const nextC = currentCol + dc;

    if (isValid(nextR, nextC, boardSize, board)) {
      // Temporarily mark the square as visited to calculate its degree accurately
      // This is crucial because getDegree should not count moves back to the current path
      board[nextR][nextC] = 1; // Temporarily mark as visited
      const degree = getDegree(nextR, nextC, boardSize, board);
      board[nextR][nextC] = 0; // Revert for actual backtracking

      possibleNextMoves.push({ row: nextR, col: nextC, degree });
    }
  }

  // Sort moves based on Warnsdorff's Rule (lowest degree first)
  // Add a random tie-breaker to explore different paths if degrees are equal
  possibleNextMoves.sort((a, b) => {
    if (a.degree === b.degree) {
      return Math.random() - 0.5; // Random tie-breaker
    }
    return a.degree - b.degree;
  });

  // Try moves in the sorted order
  for (const move of possibleNextMoves) {
    const nextR = move.row;
    const nextC = move.col;

    // Make the move
    board[nextR][nextC] = 1; // Mark as visited
    path.push({ row: nextR, col: nextC });

    // Recursively try to find a tour from the new square
    const result = solveKnightTour(board, nextR, nextC, currentVisitedCount + 1, path, boardSize);

    if (result) {
      return result; // If a tour is found, return it
    }

    // Backtrack: Unmake the move if it didn't lead to a solution
    path.pop();
    board[nextR][nextC] = 0; // Mark as unvisited
  }

  return null; // No solution found from this path
};

/**
 * Checks if a Knight's Tour is possible from a given state.
 * Uses the solveKnightTour function once, as DFS is exhaustive.
 * @param board The current state of the board.
 * @param currentRow The current row of the knight.
 * @param currentCol The current column of the knight.
 * @param initialVisitedCount The number of moves made so far (including current position).
 * @param boardSize The size of the board.
 * @returns True if a tour is possible, false otherwise.
 */
const isTourPossible = (
  board: number[][],
  currentRow: number,
  currentCol: number,
  initialVisitedCount: number,
  boardSize: number
): boolean => {
  // Create a deep copy of the board to avoid modifying the original game state
  const tempBoard = board.map(row => [...row]);
  const initialPath = [{ row: currentRow, col: currentCol }];
  const result = solveKnightTour(tempBoard, currentRow, currentCol, initialVisitedCount, initialPath, boardSize);
  return result !== null;
};

/**
 * Finds the next best move using the solver.
 * @param board The current state of the board.
 * @param currentRow The current row of the knight.
 * @param currentCol The current column of the knight.
 * @param moveCount The number of moves made so far.
 * @param boardSize The size of the board.
 * @returns The next move if a tour is possible, otherwise null.
 */
const getHint = (
  board: number[][],
  currentRow: number,
  currentCol: number,
  moveCount: number,
  boardSize: number
): { row: number; col: number } | null => {
  // Create a deep copy of the board for the solver
  const tempBoard = board.map(row => [...row]);
  const path = solveKnightTour(tempBoard, currentRow, currentCol, moveCount, [{ row: currentRow, col: currentCol }], boardSize);
  if (path && path.length > 1) {
    return path[1]; // Return the second element in the path (the first move from current position)
  }
  return null;
};

// Listen for messages from the main thread
self.onmessage = (event: MessageEvent) => {
  const { type, board, knightPos, visitedCount, boardSize } = event.data;

  if (!knightPos) {
    self.postMessage({ type: `${type}_RESULT`, result: null, error: "Knight not placed." });
    return;
  }

  const { row, col } = knightPos;

  switch (type) {
    case 'GET_HINT':
      const hint = getHint(board, row, col, visitedCount, boardSize);
      self.postMessage({ type: 'GET_HINT_RESULT', result: hint });
      break;
    case 'CHECK_POSSIBLE':
      const possible = isTourPossible(board, row, col, visitedCount, boardSize);
      self.postMessage({ type: 'CHECK_POSSIBLE_RESULT', result: possible });
      break;
    default:
      console.warn('Unknown message type:', type);
  }
};