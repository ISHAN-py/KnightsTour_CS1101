const knightMoves = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

// Checks if a square is within board boundaries and unvisited
const isValidMoveForSolver = (r: number, c: number, boardSize: number, board: number[][]): boolean => {
  return r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === 0;
};

// Calculates the number of valid, unvisited moves from a given square
const getDegreeForSolver = (r: number, c: number, boardSize: number, currentBoard: number[][]): number => {
  let count = 0;
  for (const [dr, dc] of knightMoves) {
    const nextR = r + dr;
    const nextC = c + dc;
    if (isValidMoveForSolver(nextR, nextC, boardSize, currentBoard)) {
      count++;
    }
  }
  return count;
};

/**
 * Finds a Knight's Tour path using Backtracking with Warnsdorff's Rule.
 * @param board The current state of the board (0 for unvisited, 1 for visited). This is a mutable copy.
 * @param currentRow The current row of the knight.
 * @param currentCol The current column of the knight.
 * @param currentVisitedCount The number of squares visited so far in the current path.
 * @param path The current path of moves. This is a mutable array.
 * @param boardSize The size of the board.
 * @returns A path if a tour is found, otherwise null.
 */
const findKnightTourPath = (
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

  const possibleNextMovesWithDegrees: { row: number; col: number; degree: number }[] = [];
  for (const [dr, dc] of knightMoves) {
    const nextR = currentRow + dr;
    const nextC = currentCol + dc;

    if (isValidMoveForSolver(nextR, nextC, boardSize, board)) {
      // Temporarily mark the square as visited to calculate its degree accurately
      // This is crucial because getDegreeForSolver should not count moves back to the current path
      board[nextR][nextC] = 1; // Temporarily mark as visited for degree calculation
      const degree = getDegreeForSolver(nextR, nextC, boardSize, board);
      board[nextR][nextC] = 0; // Revert for actual backtracking
      possibleNextMovesWithDegrees.push({ row: nextR, col: nextC, degree });
    }
  }

  // Sort moves based on Warnsdorff's Rule (lowest degree first)
  // Add a random tie-breaker to explore different paths if degrees are equal
  possibleNextMovesWithDegrees.sort((a, b) => {
    if (a.degree === b.degree) {
      return Math.random() - 0.5; // Random tie-breaker for exploration
    }
    return a.degree - b.degree;
  });

  // Try moves in the sorted order
  for (const move of possibleNextMovesWithDegrees) {
    const nextR = move.row;
    const nextC = move.col;

    // Make the move
    board[nextR][nextC] = 1; // Mark as visited on the board
    path.push({ row: nextR, col: nextC }); // Add to current path

    // Recursively try to find a tour from the new square
    const result = findKnightTourPath(board, nextR, nextC, currentVisitedCount + 1, path, boardSize);

    if (result) {
      return result; // If a tour is found, return it
    }

    // Backtrack: Unmake the move if it didn't lead to a solution
    path.pop(); // Remove from path
    board[nextR][nextC] = 0; // Mark as unvisited on the board
  }

  return null; // No solution found from this path
};

/**
 * Checks if a Knight's Tour is possible from a given state.
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
  // The initial path starts with the current knight position
  const initialPath = [{ row: currentRow, col: currentCol }];
  const result = findKnightTourPath(tempBoard, currentRow, currentCol, initialVisitedCount, initialPath, boardSize);
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
  // The initial path starts with the current knight position
  const path = findKnightTourPath(tempBoard, currentRow, currentCol, moveCount, [{ row: currentRow, col: currentCol }], boardSize);
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

  console.log(`Worker received request: ${type} for board size ${boardSize} at (${row},${col})`);

  switch (type) {
    case 'GET_HINT':
      const hint = getHint(board, row, col, visitedCount, boardSize);
      console.log(`Worker finished GET_HINT. Result: ${hint ? `(${hint.row},${hint.col})` : 'null'}`);
      self.postMessage({ type: 'GET_HINT_RESULT', result: hint });
      break;
    case 'CHECK_POSSIBLE':
      const possible = isTourPossible(board, row, col, visitedCount, boardSize);
      console.log(`Worker finished CHECK_POSSIBLE. Result: ${possible}`);
      self.postMessage({ type: 'CHECK_POSSIBLE_RESULT', result: possible });
      break;
    default:
      console.warn('Worker: Unknown message type:', type);
  }
};