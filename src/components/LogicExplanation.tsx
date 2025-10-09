"use client";

import React from 'react';
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LogicExplanationContentProps {
  // No children prop needed anymore as it's just content
}

const LogicExplanationContent: React.FC<LogicExplanationContentProps> = () => {
  return (
    <div>
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">Knight's Tour Solver Logic</DialogTitle>
        <DialogDescription>
          An in-depth look at the algorithms and techniques used to solve the Knight's Tour puzzle.
        </DialogDescription>
      </DialogHeader>
      <div className="prose dark:prose-invert max-w-none">
        <h3 className="text-xl font-semibold mt-6 mb-3">1. The Knight's Tour Problem</h3>
        <p className="mb-3">
          The Knight's Tour is a classic chess problem where a knight must visit every square on a chessboard exactly once.
          Finding a solution, especially for larger boards, requires a systematic approach. Our solver now uses a robust
          **Backtracking with Warnsdorff's Rule** algorithm to efficiently find a solution if one exists.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">2. Current Algorithm: Backtracking with Warnsdorff's Rule</h3>
        <p className="mb-3">
          We've re-integrated **Warnsdorff's Rule** as a primary optimization within a **Backtracking Depth-First Search (DFS)** algorithm.
          Backtracking is a general algorithmic technique for solving problems recursively by trying to build a solution
          incrementally. If a partial solution cannot be completed into a valid solution, it "backtracks" to an earlier
          state and tries a different path.
        </p>
        <p className="mb-3">
          Warnsdorff's Rule is a heuristic that guides this search. It suggests that at each step, the knight should move to the square from which it has the fewest onward moves. The idea is to prioritize moves that lead to squares with fewer escape routes, thus preventing the knight from getting trapped too early and often leading to a solution much faster than a pure DFS.
        </p>
        <p className="mb-3">
          In the Knight's Tour, this means:
        </p>
        <ol className="list-decimal list-inside ml-4 mb-3">
          <li>Start at a given square and mark it as visited.</li>
          <li>From the current square, calculate all 8 possible knight moves.</li>
          <li>For each valid potential next move (i.e., within board bounds and not yet visited):
            <ul className="list-disc list-inside ml-4">
              <li>Temporarily consider moving to that square.</li>
              <li>Calculate the "degree" of that square: the number of valid moves *from that square* to *unvisited* squares.</li>
            </ul>
          </li>
          <li>Sort these potential moves based on their calculated degree, prioritizing moves with the lowest degree. A random tie-breaker is used for moves with equal degrees to encourage varied paths.</li>
          <li>Try moves in this sorted order:
            <ul className="list-disc list-inside ml-4">
              <li>Mark the new square as visited.</li>
              <li>Add the new square to the current path.</li>
              <li>Recursively call the solver from this new square.</li>
              <li>If the recursive call successfully finds a tour (meaning all squares are visited), propagate this success back up.</li>
              <li>If the recursive call fails, "backtrack": remove the square from the current path and unmark it as visited, then try the next possible move from the previous square.</li>
            </ul>
          </li>
          <li>If all squares are visited, a solution (the current path) is found.</li>
          <li>If all possible moves from the current square have been tried and none led to a solution, return failure.</li>
        </ol>
        <p className="mb-3">
          This combined approach leverages the efficiency of Warnsdorff's Rule to quickly find a path, while the backtracking ensures that if the heuristic leads to a dead end, the solver can still explore other options to guarantee finding a solution if one exists.
        </p>

        <h4 className="text-lg font-semibold mt-4 mb-2">Code Snippet: `solveKnightTour` (simplified)</h4>
        <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto text-sm mb-3">
          <code>
{`const solveKnightTour = (board, r, c, moveCount, path, boardSize) => {
  if (moveCount === boardSize * boardSize) return path;

  const possibleNextMoves = [];
  for (const [dr, dc] of knightMoves) {
    const nextR = r + dr;
    const nextC = c + dc;
    if (isValid(nextR, nextC, boardSize, board)) {
      board[nextR][nextC] = 1; // Temporarily mark for degree calc
      const degree = getDegree(nextR, nextC, boardSize, board);
      board[nextR][nextC] = 0; // Revert
      possibleNextMoves.push({ row: nextR, col: nextC, degree });
    }
  }

  possibleNextMoves.sort((a, b) => a.degree - b.degree || Math.random() - 0.5);

  for (const move of possibleNextMoves) {
    board[move.row][move.col] = 1;
    path.push({ row: move.row, col: move.col });

    const result = solveKnightTour(board, move.row, move.col, moveCount + 1, path, boardSize);
    if (result) return result;

    path.pop();
    board[move.row][move.col] = 0;
  }
  return null;
};`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mt-6 mb-3">3. Why Warnsdorff's Rule is Effective</h3>
        <p className="mb-3">
          Warnsdorff's Rule is particularly effective for the Knight's Tour because it helps navigate the search space more intelligently. By prioritizing moves to squares with fewer escape routes, it tends to push the knight into the "corners" or more constrained areas of the board early on. This prevents the knight from getting trapped later in the game when it's surrounded by already visited squares, which is a common pitfall for simpler search strategies. While it's a heuristic and not a guarantee on its own, when combined with backtracking, it significantly prunes the search tree, leading to faster discovery of solutions.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">4. Web Worker Logic</h3>
        <p className="mb-3">
          The Knight's Tour solver, especially for larger boards, can still be computationally intensive even with Warnsdorff's Rule. If this logic were run
          directly on the main thread (where the UI renders), it would cause the application to freeze and become
          unresponsive until the calculation is complete.
        </p>
        <p className="mb-3">
          To prevent this, we offload the heavy computation to a <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Web Worker</a>.
          A Web Worker runs scripts in a background thread, separate from the main execution thread of the web page.
        </p>
        <p className="mb-3">
          Here's how it works in our application:
        </p>
        <ul className="list-disc list-inside ml-4 mb-3">
          <li>
            The main React component (`Board.tsx`) creates an instance of `KnightSolverWorker`.
            This worker script (`src/workers/knightSolver.ts`) contains the `solveKnightTour` logic.
          </li>
          <li>
            When a hint or possibility check is requested, the main thread sends a message to the worker using `worker.postMessage()`,
            passing the current board state, knight position, etc.
          </li>
          <li>
            The worker listens for messages using `self.onmessage`. When it receives a message, it performs the calculation
            (e.g., `getHint` or `isTourPossible`).
          </li>
          <li>
            Once the worker completes its task, it sends the result back to the main thread using `self.postMessage()`.
          </li>
          <li>
            The main thread's `worker.onmessage` handler receives this result and updates the UI accordingly (e.g., displays the hint, shows a toast).
          </li>
        </ul>

        <h4 className="text-lg font-semibold mt-4 mb-2">Code Snippet: `knightSolver.ts` (Worker's `onmessage`)</h4>
        <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto text-sm mb-3">
          <code>
{`self.onmessage = (event) => {
  const { type, board, knightPos, visitedCount, boardSize } = event.data;

  if (!knightPos) {
    self.postMessage({ type: \\\`\\\${type}_RESULT\\\`, result: null, error: "Knight not placed." });
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
};`}
          </code>
        </pre>
        <p className="mt-4">
          This separation ensures a smooth user experience, even when complex calculations are happening in the background.
        </p>
      </div>
    </div>
  );
};

export default LogicExplanationContent;