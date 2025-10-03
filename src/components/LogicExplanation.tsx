"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LogicExplanationProps {
  children: React.ReactNode;
}

const LogicExplanation: React.FC<LogicExplanationProps> = ({ children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto"> {/* Adjusted max-w for responsiveness */}
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Knight's Tour Solver Logic</DialogTitle>
          <DialogDescription>
            An in-depth look at the algorithms and techniques used to solve the Knight's Tour puzzle.
          </DialogDescription>
        </DialogHeader>
        <div className="prose dark:prose-invert max-w-none text-sm">
          <h3 className="text-lg font-semibold mt-4">1. The Knight's Tour Problem</h3>
          <p>
            The Knight's Tour is a classic chess problem where a knight must visit every square on a chessboard exactly once.
            Finding a solution, especially for larger boards, requires a systematic approach. Our solver uses a combination of
            backtracking and an optimization called Warnsdorff's Rule.
          </p>

          <h3 className="text-lg font-semibold mt-4">2. Backtracking Algorithm</h3>
          <p>
            Backtracking is a general algorithmic technique for solving problems recursively by trying to build a solution
            incrementally. If a partial solution cannot be completed into a valid solution, it "backtracks" to an earlier
            state and tries a different path.
          </p>
          <p>
            In the Knight's Tour, this means:
          </p>
          <ol className="list-decimal list-inside ml-4">
            <li>Start at a given square.</li>
            <li>Mark the current square as visited.</li>
            <li>For each possible next move:
              <ul className="list-disc list-inside ml-4">
                <li>If the move is valid (within bounds and unvisited), make the move.</li>
                <li>Recursively try to find a tour from the new square.</li>
                <li>If the recursive call finds a solution, propagate it back.</li>
                <li>If the recursive call fails, "backtrack": unmark the current square and undo the move, then try the next possible move.</li>
              </ul>
            </li>
            <li>If all squares are visited, a solution is found.</li>
            <li>If no valid moves lead to a solution from the current square, return failure.</li>
          </ol>

          <h4 className="text-md font-semibold mt-3">Warnsdorff's Rule Optimization</h4>
          <p>
            Pure backtracking can be very slow. Warnsdorff's Rule is a heuristic that significantly speeds up the search.
            It states that at each step, the knight should move to the square from which it has the fewest onward moves.
            This strategy helps to avoid creating dead ends too early in the tour.
          </p>
          <p>
            Our `solveKnightTour` function implements this by:
          </p>
          <ul className="list-disc list-inside ml-4">
            <li>Calculating all valid next moves.</li>
            <li>For each valid next move, temporarily "visiting" it and counting how many valid moves are possible *from that next square* (its "degree").</li>
            <li>Sorting the possible moves by their degree in ascending order.</li>
            <li>Trying the moves in this sorted order.</li>
          </ul>

          <h4 className="text-md font-semibold mt-3">Code Snippet: `solveKnightTour` (simplified)</h4>
          <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto text-xs">
            <code>
{`const solveKnightTour = (board, r, c, moveCount, path, boardSize) => {
  if (moveCount === boardSize * boardSize) {
    return path; // Tour found!
  }

  const possibleNextMoves = [];
  // Calculate and sort moves by Warnsdorff's Rule
  for (const [dr, dc] of knightMoves) {
    const nextR = r + dr;
    const nextC = c + dc;
    if (isValid(nextR, nextC, boardSize, board)) {
      board[nextR][nextC] = 1; // Temporarily mark
      const degree = countValidMoves(nextR, nextC, boardSize, board);
      board[nextR][nextC] = 0; // Unmark
      possibleNextMoves.push({ row: nextR, col: nextC, degree });
    }
  }
  possibleNextMoves.sort((a, b) => a.degree - b.degree);

  for (const move of possibleNextMoves) {
    const { row: nextR, col: nextC } = move;
    board[nextR][nextC] = 1; // Make move
    path.push({ row: nextR, col: nextC });

    const result = solveKnightTour(board, nextR, nextC, moveCount + 1, path, boardSize);
    if (result) return result; // Solution found

    path.pop(); // Backtrack
    board[nextR][nextC] = 0; // Unmake move
  }
  return null; // No solution from this path
};`}
            </code>
          </pre>

          <h3 className="text-lg font-semibold mt-4">3. Web Worker Logic</h3>
          <p>
            The Knight's Tour solver, especially for larger boards, can be computationally intensive. If this logic were run
            directly on the main thread (where the UI renders), it would cause the application to freeze and become
            unresponsive until the calculation is complete.
          </p>
          <p>
            To prevent this, we offload the heavy computation to a <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Web Worker</a>.
            A Web Worker runs scripts in a background thread, separate from the main execution thread of the web page.
          </p>
          <p>
            Here's how it works in our application:
          </p>
          <ul className="list-disc list-inside ml-4">
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

          <h4 className="text-md font-semibold mt-3">Code Snippet: `knightSolver.ts` (Worker's `onmessage`)</h4>
          <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto text-xs">
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
      </DialogContent>
    </Dialog>
  );
};

export default LogicExplanation;