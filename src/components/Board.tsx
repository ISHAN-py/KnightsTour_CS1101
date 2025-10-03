import React, { useState, useEffect, useCallback, useRef } from 'react';
import Square from './Square';
import Controls from './Controls';
import { showSuccess, showError } from '@/utils/toast';
import KnightSolverWorker from '../workers/knightSolver?worker'; // Import the worker
import LogicExplanation from './LogicExplanation'; // Import the new component
import { Button } from '@/components/ui/button'; // <--- ADDED THIS IMPORT

interface BoardProps {
  boardSize: number;
  onReturnToMenu: () => void; // New prop
}

const knightMoves = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

const Board: React.FC<BoardProps> = ({ boardSize, onReturnToMenu }) => {
  const [board, setBoard] = useState<number[][]>([]); // 0: unvisited, 1: visited
  const [knightPos, setKnightPos] = useState<{ row: number; col: number } | null>(null);
  const [visitedCount, setVisitedCount] = useState(0);
  const [possibleMoves, setPossibleMoves] = useState<Set<string>>(new Set());
  const [gameStatus, setGameStatus] = useState<string>("");
  const [hintMove, setHintMove] = useState<{ row: number; col: number } | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [isPossibleLoading, setIsPossibleLoading] = useState(false);
  const [pathHistory, setPathHistory] = useState<{ row: number; col: number }[]>([]); // Stores the path
  const [hintsRemaining, setHintsRemaining] = useState(10); // Max 10 hints
  const [isTracingBack, setIsTracingBack] = useState(false);
  const [tracebackIndex, setTracebackIndex] = useState(0);

  const workerRef = useRef<Worker | null>(null);
  const tracebackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hintRequestStartTime = useRef<number>(0);
  const possibleRequestStartTime = useRef<number>(0);

  const initializeBoard = useCallback(() => {
    const newBoard: number[][] = Array(boardSize).fill(0).map(() => Array(boardSize).fill(0));
    const initialKnightRow = 0; // Starting position (0,0)
    const initialKnightCol = 0;

    newBoard[initialKnightRow][initialKnightCol] = 1; // Mark as visited

    setBoard(newBoard);
    setKnightPos({ row: initialKnightRow, col: initialKnightCol });
    setVisitedCount(1);
    setPossibleMoves(new Set()); // Clear possible moves
    setGameStatus(`Knight placed at (${initialKnightRow}, ${initialKnightCol}). Make your first move!`);
    setHintMove(null);
    setIsHintLoading(false);
    setIsPossibleLoading(false);
    setPathHistory([{ row: initialKnightRow, col: initialKnightCol }]); // Initialize path history
    setHintsRemaining(10); // Reset hints
    setIsTracingBack(false);
    setTracebackIndex(0);
    if (tracebackTimeoutRef.current) {
      clearTimeout(tracebackTimeoutRef.current);
      tracebackTimeoutRef.current = null;
    }
  }, [boardSize]); // Depend on boardSize

  useEffect(() => {
    initializeBoard();
  }, [initializeBoard, boardSize]); // Re-initialize if boardSize changes

  useEffect(() => {
    workerRef.current = new KnightSolverWorker();

    workerRef.current.onmessage = (event: MessageEvent) => {
      const { type, result, error } = event.data;
      const currentTime = Date.now();

      const handleResponse = (
        isLoadingSetter: React.Dispatch<React.SetStateAction<boolean>>,
        startTimeRef: React.MutableRefObject<number>,
        callback: () => void
      ) => {
        const elapsedTime = currentTime - startTimeRef.current;
        const remainingDelay = Math.max(0, 1000 - elapsedTime); // Ensure at least 1 second loading

        setTimeout(() => {
          callback();
          isLoadingSetter(false);
        }, remainingDelay);
      };

      if (error) {
        handleResponse(
          type === 'GET_HINT_RESULT' ? setIsHintLoading : setIsPossibleLoading,
          type === 'GET_HINT_RESULT' ? hintRequestStartTime : possibleRequestStartTime,
          () => {
            showError(error);
            setGameStatus(error);
          }
        );
        return;
      }

      switch (type) {
        case 'GET_HINT_RESULT':
          handleResponse(setIsHintLoading, hintRequestStartTime, () => {
            if (result) {
              setHintMove(result);
              showSuccess(`Hint: Move to (${result.row}, ${result.col})`);
              setGameStatus(`Hint: Move to (${result.row}, ${result.col})`);
              setHintsRemaining(prev => Math.max(0, prev - 1)); // Decrement hint count
            } else {
              showError("No hint available. It might be a dead end or no solution from here.");
              setGameStatus("No hint available.");
            }
          });
          break;
        case 'CHECK_POSSIBLE_RESULT':
          handleResponse(setIsPossibleLoading, possibleRequestStartTime, () => {
            if (result) {
              showSuccess("Yes, a Knight's Tour is possible from this position!");
              setGameStatus("A Knight's Tour is possible!");
            } else {
              showError("No, a Knight's Tour is NOT possible from this position.");
              setGameStatus("No Knight's Tour possible from here. Please start a new game."); // Updated status
            }
          });
          break;
        default:
          console.warn('Unknown message type from worker:', type);
      }
    };

    workerRef.current.onerror = (error) => {
      console.error("Worker error:", error);
      // This error handler might not have the 'type' info, so we'll assume it's for the currently active loading state
      if (isHintLoading) {
        setIsHintLoading(false);
      }
      if (isPossibleLoading) {
        setIsPossibleLoading(false);
      }
      showError("An error occurred during calculation.");
      setGameStatus("Error during calculation.");
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []); // Removed isHintLoading, isPossibleLoading from dependencies

  // Effect for traceback animation
  useEffect(() => {
    if (isTracingBack && tracebackIndex < pathHistory.length) {
      tracebackTimeoutRef.current = setTimeout(() => {
        setKnightPos(pathHistory[tracebackIndex]);
        setTracebackIndex(prev => prev + 1);
      }, 200); // Adjust speed of traceback here
    } else if (isTracingBack && tracebackIndex >= pathHistory.length) {
      setIsTracingBack(false);
      setGameStatus("Congratulations! Tour traced back. Start a new game!");
    }

    return () => {
      if (tracebackTimeoutRef.current) {
        clearTimeout(tracebackTimeoutRef.current);
      }
    };
  }, [isTracingBack, tracebackIndex, pathHistory]);


  const isValidMove = (row: number, col: number, currentBoard: number[][]) => {
    return row >= 0 && row < boardSize && col >= 0 && col < boardSize && currentBoard[row][col] === 0;
  };

  const calculatePossibleMoves = useCallback((currentRow: number, currentCol: number, currentBoard: number[][]) => {
    const moves = new Set<string>();
    for (const [dr, dc] of knightMoves) {
      const newRow = currentRow + dr;
      const newCol = currentCol + dc;
      if (isValidMove(newRow, newCol, currentBoard)) {
        moves.add(`${newRow},${newCol}`);
      }
    }
    setPossibleMoves(moves);
    return moves;
  }, [boardSize]); // Depend on boardSize

  useEffect(() => {
    if (knightPos && !isTracingBack) { // Only calculate if not tracing back
      calculatePossibleMoves(knightPos.row, knightPos.col, board);
    } else if (!knightPos && !isTracingBack) {
      setPossibleMoves(new Set());
    }
  }, [knightPos, board, calculatePossibleMoves, isTracingBack]);

  const handleSquareClick = (row: number, col: number) => {
    if (isTracingBack || gameStatus.includes("Game Over") || gameStatus.includes("Congratulations") || gameStatus.includes("No Knight's Tour possible")) {
      showError("Game is over or tracing back. Start a new game!");
      return;
    }

    // If knight is already placed, handle subsequent moves
    if (knightPos) {
      const isMovePossible = possibleMoves.has(`${row},${col}`);

      if (isMovePossible) {
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = 1; // Mark new position as visited
        setBoard(newBoard);
        setKnightPos({ row, col });
        setPathHistory(prev => [...prev, { row, col }]); // Add to path history
        const newVisitedCount = visitedCount + 1;
        setVisitedCount(newVisitedCount);
        setHintMove(null); // Clear hint after a move

        const nextPossibleMoves = calculatePossibleMoves(row, col, newBoard);

        if (newVisitedCount === boardSize * boardSize) {
          setGameStatus("Congratulations! You completed the Knight's Tour! Tracing back...");
          showSuccess("Congratulations! You completed the Knight's Tour!");
          setIsTracingBack(true); // Start traceback
          setTracebackIndex(0); // Reset traceback index
        } else if (nextPossibleMoves.size === 0) {
          setGameStatus("Game Over! No more legal moves from this position.");
          showError("Game Over! No more legal moves from this position.");
        } else {
          setGameStatus(`Moves: ${newVisitedCount} / ${boardSize * boardSize}`);
        }
      } else {
        showError("Invalid move. Knights move in L-shapes and cannot land on visited squares.");
      }
    }
  };

  const handleHint = () => {
    if (!knightPos) {
      showError("Place the knight first to get a hint.");
      return;
    }
    if (hintsRemaining <= 0) {
      showError("No hints remaining!");
      return;
    }
    if (isHintLoading || isPossibleLoading || isTracingBack || gameStatus.includes("No Knight's Tour possible")) {
      showError("Please wait for the current action to finish or start a new game.");
      return;
    }
    setIsHintLoading(true);
    setGameStatus("Calculating hint...");
    hintRequestStartTime.current = Date.now(); // Record start time
    workerRef.current?.postMessage({
      type: 'GET_HINT',
      board: board.map(r => [...r]), // Deep copy for worker
      knightPos,
      visitedCount,
      boardSize, // Pass boardSize to worker
    });
  };

  const handleCheckPossible = () => {
    if (!knightPos) {
      showError("Place the knight first to check possibility.");
      return;
    }
    if (isHintLoading || isPossibleLoading || isTracingBack || gameStatus.includes("No Knight's Tour possible")) {
      showError("Please wait for the current action to finish or start a new game.");
      return;
    }
    setIsPossibleLoading(true);
    setGameStatus("Checking if tour is possible...");
    possibleRequestStartTime.current = Date.now(); // Record start time
    workerRef.current?.postMessage({
      type: 'CHECK_POSSIBLE',
      board: board.map(r => [...r]), // Deep copy for worker
      knightPos,
      visitedCount,
      boardSize, // Pass boardSize to worker
    });
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-2xl font-bold mb-4">Knight's Tour</h2>
      <div className={`grid grid-cols-${boardSize} border border-gray-400 dark:border-gray-600`}> {/* Dynamic grid-cols */}
        {board.map((rowArr, rowIndex) =>
          rowArr.map((_, colIndex) => (
            <Square
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              col={colIndex}
              isVisited={board[rowIndex][colIndex] === 1}
              isKnightHere={knightPos?.row === rowIndex && knightPos?.col === colIndex}
              isPossibleMove={possibleMoves.has(`${rowIndex},${colIndex}`) || (hintMove?.row === rowIndex && hintMove?.col === colIndex)}
              onClick={handleSquareClick}
            />
          ))
        )}
      </div>
      <Controls
        onNewGame={initializeBoard}
        onHint={handleHint}
        onCheckPossible={handleCheckPossible}
        gameStatus={gameStatus}
        knightPlaced={knightPos !== null}
        isHintLoading={isHintLoading}
        isPossibleLoading={isPossibleLoading}
        hintsRemaining={hintsRemaining} // Pass hints remaining
        onReturnToMenu={onReturnToMenu} // Pass the new prop
      />
      {/* Logic Explanation Dialog */}
      <div className="mt-4">
        <LogicExplanation>
          <Button variant="outline">Explain Logic</Button>
        </LogicExplanation>
      </div>
    </div>
  );
};

export default Board;