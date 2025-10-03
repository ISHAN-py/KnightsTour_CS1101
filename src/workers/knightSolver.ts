const BOARD_SIZE = 6; // Changed from 5 to 6
const knightMoves = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

// Helper function to check if a move is valid
const isValid = (r: number, c: number, board: number[][]) => {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === 0;
};

// Helper to count valid moves from a given square
const countValidMoves = (r: number, c: number, board: number[][]) => {
  let count = 0;
  for (const [dr, dc] of knightMoves) {
    const nextR = r + dr;
    const nextC = c + dc;
    if (isValid(nextR, nextC, board)) {
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
 * @param moveCount The number of moves made so far.
 * @param path The current path of moves.
 * @returns A path if a tour is found, otherwise null.
 */
const solveKnightTour = (
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

  // Calculate possible next moves and their "degree" (number of subsequent moves)
  const possibleNextMoves: { row: number; col: number; degree: number }[] = [];
  for (const [dr, dc] of knightMoves) {
    const nextRow = currentRow + dr;
    const nextCol = currentCol + dc;

    if (isValid(nextRow, nextCol, board)) {
      // Temporarily mark the square as visited to calculate its degree
      // This is crucial for Warnsdorff's rule to work correctly
      board[nextRow][nextCol] = 1;
      const degree = countValidMoves(nextRow, nextCol, board);
      board[nextRow][nextCol] = 0; // Unmark it immediately

      possibleNextMoves.push({ row: nextRow, col: nextCol, degree });
    }
  }

  // Sort moves by degree (Warnsdorff's Rule: prioritize moves with fewer subsequent options)
  possibleNextMoves.sort((a, b) => a.degree - b.degree);

  // Try moves in the sorted order
  for (const move of possibleNextMoves) {
    const { row: nextRow, col: nextCol } = move;

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
const isTourPossible = (
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
const getHint = (
  board: number[][],
  currentRow: number,
  currentCol: number,
  moveCount: number
): { row: number; col: number } | null => {
  // Create a deep copy of the board for the solver
  const tempBoard = board.map(row => [...row]);
  tempBoard[currentRow][currentCol] = 1; // Mark current knight position as visited for the solver

  const path = solveKnightTour(tempBoard, currentRow, currentCol, moveCount, [{ row: currentRow, col: currentCol }]);
  if (path && path.length > 1) {
    return path[1]; // Return the second element in the path (the first move from current position)
  }
  return null;
};

// Listen for messages from the main thread
self.onmessage = (event: MessageEvent) => {
  const { type, board, knightPos, visitedCount } = event.data;

  if (!knightPos) {
    self.postMessage({ type: `${type}_RESULT`, result: null, error: "Knight not placed." });
    return;
  }

  const { row, col } = knightPos;

  switch (type) {
    case 'GET_HINT':
      const hint = getHint(board, row, col, visitedCount);
      self.postMessage({ type: 'GET_HINT_RESULT', result: hint });
      break;
    case 'CHECK_POSSIBLE':
      const possible = isTourPossible(board, row, col, visitedCount);
      self.postMessage({ type: 'CHECK_POSSIBLE_RESULT', result: possible });
      break;
    default:
      console.warn('Unknown message type:', type);
  }
};