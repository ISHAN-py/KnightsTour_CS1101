import React, { useState, useEffect, useCallback, useRef } from 'react';
import Square from './Square';
import Controls from './Controls';
import { showSuccess, showError } from '@/utils/toast';
import KnightSolverWorker from '../workers/knightSolver?worker'; // Import the worker

const BOARD_SIZE = 8;

const knightMoves = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

const Board: React.FC = () => {
  const [board, setBoard] = useState<number[][]>([]); // 0: unvisited, 1: visited, 2: knight
  const [knightPos, setKnightPos] = useState<{ row: number; col: number } | null>(null);
  const [visitedCount, setVisitedCount] = useState(0);
  const [possibleMoves, setPossibleMoves] = useState<Set<string>>(new Set());
  const [gameStatus, setGameStatus] = useState<string>("");
  const [hintMove, setHintMove] = useState<{ row: number; col: number } | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [isPossibleLoading, setIsPossibleLoading] = useState(false);

  const workerRef = useRef<Worker | null>(null);

  const initializeBoard = useCallback(() => {
    const newBoard: number[][] = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(0));
    setBoard(newBoard);
    setKnightPos(null);
    setVisitedCount(0);
    setPossibleMoves(new Set());
    setGameStatus("");
    setHintMove(null);
    setIsHintLoading(false);
    setIsPossibleLoading(false);
  }, []);

  useEffect(() => {
    initializeBoard();
  }, [initializeBoard]);

  useEffect(() => {
    workerRef.current = new KnightSolverWorker();

    workerRef.current.onmessage = (event: MessageEvent) => {
      const { type, result, error } = event.data;

      if (error) {
        showError(error);
        setGameStatus(error);
        setIsHintLoading(false);
        setIsPossibleLoading(false);
        return;
      }

      switch (type) {
        case 'GET_HINT_RESULT':
          if (result) {
            setHintMove(result);
            showSuccess(`Hint: Move to (${result.row}, ${result.col})`);
            setGameStatus(`Hint: Move to (${result.row}, ${result.col})`);
          } else {
            showError("No hint available. It might be a dead end or no solution from here.");
            setGameStatus("No hint available.");
          }
          setIsHintLoading(false);
          break;
        case 'CHECK_POSSIBLE_RESULT':
          if (result) {
            showSuccess("Yes, a Knight's Tour is possible from this position!");
            setGameStatus("A Knight's Tour is possible!");
          } else {
            showError("No, a Knight's Tour is NOT possible from this position.");
            setGameStatus("A Knight's Tour is NOT possible.");
          }
          setIsPossibleLoading(false);
          break;
        default:
          console.warn('Unknown message type from worker:', type);
      }
    };

    workerRef.current.onerror = (error) => {
      console.error("Worker error:", error);
      showError("An error occurred during calculation.");
      setGameStatus("Error during calculation.");
      setIsHintLoading(false);
      setIsPossibleLoading(false);
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const isValidMove = (row: number, col: number, currentBoard: number[][]) => {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE && currentBoard[row][col] === 0;
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
  }, []);

  useEffect(() => {
    if (knightPos) {
      calculatePossibleMoves(knightPos.row, knightPos.col, board);
    } else {
      setPossibleMoves(new Set());
    }
  }, [knightPos, board, calculatePossibleMoves]);

  const handleSquareClick = (row: number, col: number) => {
    if (gameStatus.includes("Game Over") || gameStatus.includes("Congratulations")) {
      showError("Game is over. Start a new game!");
      return;
    }

    if (!knightPos) {
      // First click, place the knight
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = 1; // Mark as visited
      setBoard(newBoard);
      setKnightPos({ row, col });
      setVisitedCount(1);
      setGameStatus("Knight placed! Make your first move.");
      setHintMove(null); // Clear hint when knight is placed
    } else {
      // Subsequent clicks, attempt to move the knight
      const isMovePossible = possibleMoves.has(`${row},${col}`);

      if (isMovePossible) {
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = 1; // Mark new position as visited
        setBoard(newBoard);
        setKnightPos({ row, col });
        const newVisitedCount = visitedCount + 1;
        setVisitedCount(newVisitedCount);
        setHintMove(null); // Clear hint after a move

        const nextPossibleMoves = calculatePossibleMoves(row, col, newBoard);

        if (newVisitedCount === BOARD_SIZE * BOARD_SIZE) {
          setGameStatus("Congratulations! You completed the Knight's Tour!");
          showSuccess("Congratulations! You completed the Knight's Tour!");
        } else if (nextPossibleMoves.size === 0) {
          setGameStatus("Game Over! No more legal moves from this position.");
          showError("Game Over! No more legal moves from this position.");
        } else {
          setGameStatus(`Moves: ${newVisitedCount} / ${BOARD_SIZE * BOARD_SIZE}`);
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
    if (isHintLoading || isPossibleLoading) {
      showError("Please wait for the current calculation to finish.");
      return;
    }
    setIsHintLoading(true);
    setGameStatus("Calculating hint...");
    workerRef.current?.postMessage({
      type: 'GET_HINT',
      board: board.map(r => [...r]), // Deep copy for worker
      knightPos,
      visitedCount,
    });
  };

  const handleCheckPossible = () => {
    if (!knightPos) {
      showError("Place the knight first to check possibility.");
      return;
    }
    if (isHintLoading || isPossibleLoading) {
      showError("Please wait for the current calculation to finish.");
      return;
    }
    setIsPossibleLoading(true);
    setGameStatus("Checking if tour is possible...");
    workerRef.current?.postMessage({
      type: 'CHECK_POSSIBLE',
      board: board.map(r => [...r]), // Deep copy for worker
      knightPos,
      visitedCount,
    });
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-2xl font-bold mb-4">Knight's Tour</h2>
      <div className="grid grid-cols-8 border border-gray-400 dark:border-gray-600">
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
      />
    </div>
  );
};

export default Board;