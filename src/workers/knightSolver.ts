const knightMoves = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

// Helper function to check if a move is valid
const isValid = (r: number, c: number, boardSize: number, board: number[][]) => {
  return r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === 0;
};

// Helper to count valid moves from a given square
const countValidMoves = (r: number, c: number, boardSize: number, board: number[][]) => {
  let count = 0;
  for (const [dr, dc] of knightMoves) {
    const nextR = r + dr;
    const nextC = c + dc;
    if (isValid(nextR, nextC, boardSize, board)) {
      count++;
    }
  }
  return count;
};

/**
 * Finds a Knight's Tour path using backtracking, optimized with Warnsdorff's Rule.
 * @param board The current state of the board (0 for unvisited, 1 for visited).
 * @param currentRow The current row of the knight.
 * @param currentCol The current column of the knight.
 * @param moveCount The number of moves made so far (length of the path).
 * @param path The current path of moves.
 * @param boardSize The size of the board.
 * @returns A path if a tour is found, otherwise null.
 */
const solveKnightTour = (
  board: number[][],
  currentRow: number,
  currentCol: number,
  moveCount: number, // This should be path.length
  path: { row: number; col: number }[],
  boardSize: number
): { row: number; col: number }[] | null => {
  // Base case: If all squares are visited, a tour is found
  if (moveCount === boardSize * boardSize) {
    return path;
  }

  // Calculate possible next moves and their "degree" (number of subsequent moves)
  const possibleNextMoves: { row: number; col: number; degree: number }[] = [];
  for (const [dr, dc] of knightMoves) {
    const nextR = currentRow + dr;
    const nextC = currentCol + dc;

    if (isValid(nextR, nextC, boardSize, board)) {
      // Temporarily mark the square as visited to calculate its degree
      // This is crucial for Warnsdorff's rule to work correctly
      board[nextR][nextC] = 1;
      const degree = countValidMoves(nextR, nextC, boardSize, board);
      board[nextR][nextC] = 0; // Unmark it immediately

      possibleNextMoves.push({ row: nextR, col: nextC, degree });
    }
  }

  // Sort moves by degree (Warnsdorff's Rule: prioritize moves with fewer subsequent options)
  // Added a random tie-breaker to improve robustness
  possibleNextMoves.sort((a, b) => {
    if (a.degree === b.degree) {
      return Math.random() - 0.5; // Randomize order if degrees are equal
    }
    return a.degree - b.degree;
  });

  // Try moves in the sorted order
  for (const move of possibleNextMoves) {
    const { row: nextRow, col: nextCol } = move;

    // Make the move
    board[nextRow][nextCol] = 1; // Mark as visited
    path.push({ row: nextRow, col: nextCol });

    // Recur for the next move
    const result = solveKnightTour(board, nextRow, nextCol, moveCount + 1, path, boardSize);

    if (result) {
      return result; // If a tour is found, return it
    }

    // Backtrack: Unmake the move if it didn't lead to a solution
    path.pop();
    board[nextRow][nextCol] = 0; // Mark as unvisited
  }

  return null; // No solution found from this path
};

/**
 * Checks if a Knight's Tour is possible from a given state by trying multiple times.
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
  const MAX_ATTEMPTS = 5; // Number of times to try finding a tour

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    // Create a deep copy of the board for each attempt
    const tempBoard = board.map(row => [...row]);
    const initialPath = [{ row: currentRow, col: currentCol }];
    const result = solveKnightTour(tempBoard, currentRow, currentCol, initialVisitedCount, initialPath, boardSize);
    if (result) {
      return true; // Found a tour in this attempt
    }
  }
  return false; // No tour found after all attempts
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
  // The current position is already marked as visited in the board passed from main thread
  // and moveCount already includes it.
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