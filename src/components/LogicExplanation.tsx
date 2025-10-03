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
          **Backtracking with Depth-First Search (DFS)** algorithm to guarantee finding a solution if one exists.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">2. Current Algorithm: Backtracking with Depth-First Search (DFS)</h3>
        <p className="mb-3">
          Backtracking is a general algorithmic technique for solving problems recursively by trying to build a solution
          incrementally. If a partial solution cannot be completed into a valid solution, it "backtracks" to an earlier
          state and tries a different path. This approach, combined with Depth-First Search, ensures that every possible
          path is explored until a complete tour is found.
        </p>
        <p className="mb-3">
          In the Knight's Tour, this means:
        </p>
        <ol className="list-decimal list-inside ml-4 mb-3">
          <li>Start at a given square and mark it as visited (e.g., with move number 1, or simply '1').</li>
          <li>From the current square, try all 8 possible knight moves in a predefined order.</li>
          <li>For each valid move (i.e., the destination square is within board bounds and has not been visited yet):
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
          This is an exhaustive search algorithm, meaning it is guaranteed to find a Knight's Tour if one exists from the starting position.
        </p>

        <h4 className="text-lg font-semibold mt-4 mb-2">Code Snippet: `solveKnightTour` (simplified)</h4>
        <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto text-sm mb-3">
          <code>
{`const solveKnightTour = (board, r, c, moveCount, path, boardSize) => {
  if (moveCount === boardSize * boardSize) {
    return path; // Tour found!
  }

  for (const [dr, dc] of knightMoves) {
    const nextR = r + dr;
    const nextC = c + dc;
    if (isValid(nextR, nextC, boardSize, board)) {
      board[nextR][nextC] = 1; // Make move (mark as visited)
      path.push({ row: nextR, col: nextC });

      const result = solveKnightTour(board, nextR, nextC, moveCount + 1, path, boardSize);
      if (result) return result; // Solution found

      path.pop(); // Backtrack (unmake move)
      board[nextR][nextC] = 0; // Unmark move
    }
  }
  return null; // No solution from this path
};`}
          </code>
        </pre>

        <h3 className="text-xl font-semibold mt-6 mb-3">3. History: Previous Algorithm (Warnsdorff's Rule)</h3>
        <p className="mb-3">
          Initially, the solver incorporated **Warnsdorff's Rule** as an optimization alongside backtracking. This heuristic suggests that at each step, the knight should move to the square from which it has the fewest onward moves. The idea is to prioritize moves that lead to squares with fewer escape routes, thus preventing the knight from getting trapped too early.
        </p>
        <p className="mb-3">
          **How it worked:**
        </p>
        <ul className="list-disc list-inside ml-4 mb-3">
          <li>At each step, all valid next moves were calculated.</li>
          <li>For each potential next move, the number of valid moves *from that square* (its "degree") was counted.</li>
          <li>Moves were then sorted, prioritizing those with the lowest degree.</li>
          <li>A random tie-breaker was also introduced for moves with equal degrees to encourage exploration.</li>
        </ul>
        <p className="mb-3">
          **Pitfalls and Why We Switched:**
        </p>
        <ul className="list-disc list-inside ml-4 mb-3">
          <li>
            **Heuristic Limitations:** While often effective for finding *a* tour quickly, Warnsdorff's Rule is a heuristic, not a guarantee. It doesn't always find a solution even if one exists, especially on certain board configurations or when the "optimal" path isn't strictly the one with the fewest onward moves.
          </li>
          <li>
            **False Negatives for "Is Possible?":** This limitation became particularly problematic for the "Is possible?" feature. If the heuristic-driven solver failed to find a path on its first (or even several random) attempts, it would incorrectly report that no tour was possible, even when a valid tour existed. The random tie-breaker, while intended to help, sometimes exacerbated this by leading the solver down unproductive paths.
          </li>
          <li>
            **Complexity for Guarantee:** To guarantee a solution with Warnsdorff's Rule, one would still need to implement a full backtracking mechanism that explores all branches, effectively negating the heuristic's primary benefit for a "guaranteed" check.
          </li>
        </ul>
        <p className="mt-4">
          By switching to a pure DFS backtracking approach, we ensure that the solver will always find a Knight's Tour if one exists, making the "Is possible?" feature and hints completely reliable, albeit potentially at the cost of slightly longer computation times for very complex scenarios (which are offloaded to a Web Worker).
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">4. Web Worker Logic</h3>
        <p className="mb-3">
          The Knight's Tour solver, especially for larger boards, can be computationally intensive. If this logic were run
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