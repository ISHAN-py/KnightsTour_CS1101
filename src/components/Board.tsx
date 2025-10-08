import React, { useState, useEffect, useCallback, useRef } from 'react';
import Square from './Square';
import Controls from './Controls';
import GameProgress from './GameProgress';
import { showSuccess, showError } from '@/utils/toast';
import KnightSolverWorker from '../workers/knightSolver?worker';
import GameInfoSidebar from './GameInfoSidebar';
import AnimatedKnight from './AnimatedKnight';
import { cn } from '@/lib/utils';
import { VALID_STARTING_POINTS } from '@/utils/knightTourConfig';
import { supabase } from '@/integrations/supabase/client';

interface BoardProps {
  boardSize: number;
  onReturnToMenu: () => void;
  initialHints: number;
  underglowColorClass: string;
  difficulty: 'easy' | 'medium' | 'hard';
  playerName: string; // New prop for player name
}

const knightMoves = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

const Board: React.FC<BoardProps> = ({ boardSize, onReturnToMenu, initialHints, underglowColorClass, difficulty, playerName }) => {
  const [board, setBoard] = useState<number[][]>([]);
  const [knightPos, setKnightPos] = useState<{ row: number; col: number } | null>(null);
  const [visitedCount, setVisitedCount] = useState(0);
  const [possibleMoves, setPossibleMoves] = useState<Set<string>>(new Set());
  const [gameStatus, setGameStatus] = useState<string>("");
  const [hintMove, setHintMove] = useState<{ row: number; col: number } | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [isPossibleLoading, setIsPossibleLoading] = useState(false);
  const [pathHistory, setPathHistory] = useState<{ row: number; col: number }[]>([]);
  const [hintsRemaining, setHintsRemaining] = useState(initialHints);
  const [isPossibleCheckCount, setIsPossibleCheckCount] = useState(0);
  const [isTracingBack, setIsTracingBack] = useState(false);
  const [tracebackIndex, setTracebackIndex] = useState(0);

  // Animation states
  const [animatingKnightFrom, setAnimatingKnightFrom] = useState<{ row: number; col: number } | null>(null);
  const [animatingKnightTo, setAnimatingKnightTo] = useState<{ row: number; col: number } | null>(null);
  const [isAnimatingMove, setIsAnimatingMove] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const tracebackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hintRequestStartTime = useRef<number>(0);
  const possibleRequestStartTime = useRef<number>(0);

  const getDifficultyMultiplier = (diff: 'easy' | 'medium' | 'hard') => {
    switch (diff) {
      case 'easy': return 1.0;
      case 'medium': return 1.2;
      case 'hard': return 1.5;
      default: return 1.0;
    }
  };

  const calculateAndSubmitScore = useCallback(async (finalVisitedCount: number, finalHintsRemaining: number, gameOutcome: 'win' | 'lose') => {
    const baseScore = (finalVisitedCount * 100) - (isPossibleCheckCount * 20) + (finalHintsRemaining * 10);
    const multiplier = getDifficultyMultiplier(difficulty);
    const finalScore = Math.max(0, Math.round(baseScore * multiplier));

    showSuccess(`Final Score: ${finalScore} (Base: ${baseScore}, Multiplier: ${multiplier.toFixed(1)})`);

    try {
      const tableName = `high_scores_${boardSize}x${boardSize}`;
      const { data, error } = await supabase
        .from(tableName)
        .insert([
          {
            player_name: playerName, // Use the player name from props
            score: finalScore,
            difficulty_multiplier: multiplier,
            board_size: boardSize,
          },
        ]);

      if (error) {
        console.error('Error submitting high score:', error);
        showError('Failed to submit high score.');
      } else {
        console.log('High score submitted:', data);
        showSuccess('High score submitted successfully!');
      }
    } catch (err) {
      console.error('Exception submitting high score:', err);
      showError('An unexpected error occurred while submitting high score.');
    }
  }, [boardSize, difficulty, isPossibleCheckCount, playerName]); // Add playerName to dependencies

  const initializeBoard = useCallback(() => {
    const newBoard: number[][] = Array(boardSize).fill(0).map(() => Array(boardSize).fill(0));

    const possibleStarts = VALID_STARTING_POINTS[boardSize];

    let initialKnightRow = 0;
    let initialKnightCol = 0;

    if (possibleStarts && possibleStarts.length > 0) {
      const randomIndex = Math.floor(Math.random() * possibleStarts.length);
      initialKnightRow = possibleStarts[randomIndex].row;
      initialKnightCol = possibleStarts[randomIndex].col;
    } else {
      console.error(`No valid starting points defined for board size ${boardSize}. Defaulting to (0,0).`);
    }

    newBoard[initialKnightRow][initialKnightCol] = 1;

    setBoard(newBoard);
    setKnightPos({ row: initialKnightRow, col: initialKnightCol });
    setVisitedCount(1);
    setPossibleMoves(new Set());
    setGameStatus(`Knight placed at (${initialKnightRow}, ${initialKnightCol}). Make your first move!`);
    setHintMove(null);
    setIsHintLoading(false);
    setIsPossibleLoading(false);
    setPathHistory([{ row: initialKnightRow, col: initialKnightCol }]);
    setHintsRemaining(initialHints);
    setIsPossibleCheckCount(0);
    setIsTracingBack(false);
    setTracebackIndex(0);
    setAnimatingKnightFrom(null);
    setAnimatingKnightTo(null);
    setIsAnimatingMove(false);
    if (tracebackTimeoutRef.current) {
      clearTimeout(tracebackTimeoutRef.current);
      tracebackTimeoutRef.current = null;
    }
  }, [boardSize, initialHints]);

  useEffect(() => {
    initializeBoard();
  }, [initializeBoard]);

  useEffect(() => {
    workerRef.current = new KnightSolverWorker();

    workerRef.current.onmessage = (event: MessageEvent) => {
      const { type, result, error } = event.data;
      const currentTime = Date.now();
      console.log(`Received message from worker: ${type}`); // Debug log

      const handleResponse = (
        isLoadingSetter: React.Dispatch<React.SetStateAction<boolean>>,
        startTimeRef: React.MutableRefObject<number>,
        callback: () => void
      ) => {
        const elapsedTime = currentTime - startTimeRef.current;
        const remainingDelay = Math.max(0, 1000 - elapsedTime);

        setTimeout(() => {
          callback();
          isLoadingSetter(false);
          console.log(`Loading state reset for type: ${type}`); // Debug log
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
              setHintsRemaining(prev => Math.max(0, prev - 1));
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
              setGameStatus("No Knight's Tour possible from here. Please start a new game.");
            }
          });
          break;
        default:
          console.warn('Unknown message type from worker:', type);
      }
    };

    workerRef.current.onerror = (error) => {
      console.error("Worker error:", error);
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
  }, [isHintLoading, isPossibleLoading]);

  useEffect(() => {
    if (isTracingBack && tracebackIndex < pathHistory.length) {
      tracebackTimeoutRef.current = setTimeout(() => {
        setKnightPos(pathHistory[tracebackIndex]);
        setTracebackIndex(prev => prev + 1);
      }, 200);
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
  }, [boardSize]);

  useEffect(() => {
    if (knightPos && !isTracingBack && !isAnimatingMove) {
      calculatePossibleMoves(knightPos.row, knightPos.col, board);
    } else if (!knightPos && !isTracingBack && !isAnimatingMove) {
      setPossibleMoves(new Set());
    }
  }, [knightPos, board, calculatePossibleMoves, isTracingBack, isAnimatingMove]);

  const handleAnimationEnd = useCallback(() => {
    if (animatingKnightTo) {
      const newBoard = board.map(r => [...r]);
      newBoard[animatingKnightTo.row][animatingKnightTo.col] = 1;

      setBoard(newBoard);
      setKnightPos(animatingKnightTo);
      setPathHistory(prev => [...prev, animatingKnightTo]);
      const newVisitedCount = visitedCount + 1;
      setVisitedCount(newVisitedCount);
      setHintMove(null);

      const nextPossibleMoves = calculatePossibleMoves(animatingKnightTo.row, animatingKnightTo.col, newBoard);

      if (newVisitedCount === boardSize * boardSize) {
        setGameStatus("Congratulations! You completed the Knight's Tour! Tracing back...");
        showSuccess("Congratulations! You completed the Knight's Tour!");
        calculateAndSubmitScore(newVisitedCount, hintsRemaining, 'win');
        setIsTracingBack(true);
        setTracebackIndex(0);
      } else if (nextPossibleMoves.size === 0) {
        setGameStatus("Game Over! No more legal moves from this position.");
        showError("Game Over! No more legal moves from this position.");
        calculateAndSubmitScore(newVisitedCount, hintsRemaining, 'lose');
      } else {
        setGameStatus(`Moves: ${newVisitedCount} / ${boardSize * boardSize}`);
      }

      setAnimatingKnightFrom(null);
      setAnimatingKnightTo(null);
      setIsAnimatingMove(false);
    }
  }, [animatingKnightTo, board, boardSize, calculatePossibleMoves, visitedCount, hintsRemaining, calculateAndSubmitScore]);


  const handleSquareClick = (row: number, col: number) => {
    if (isTracingBack || gameStatus.includes("Game Over") || gameStatus.includes("Congratulations") || gameStatus.includes("No Knight's Tour possible") || isAnimatingMove) {
      showError("Game is over, tracing back, or animating. Start a new game or wait!");
      return;
    }

    if (knightPos) {
      const isMovePossible = possibleMoves.has(`${row},${col}`);

      if (isMovePossible) {
        setAnimatingKnightFrom(knightPos);
        setAnimatingKnightTo({ row, col });
        setIsAnimatingMove(true);
        setKnightPos(null);
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
    if (isHintLoading || isPossibleLoading || isTracingBack || gameStatus.includes("No Knight's Tour possible") || isAnimatingMove) {
      showError("Please wait for the current action to finish or start a new game.");
      return;
    }
    setIsHintLoading(true);
    setGameStatus("Calculating hint... this might take a moment for larger boards."); // Updated message
    hintRequestStartTime.current = Date.now();
    console.log("Sending GET_HINT message to worker."); // Debug log
    workerRef.current?.postMessage({
      type: 'GET_HINT',
      board: board.map(r => [...r]),
      knightPos,
      visitedCount,
      boardSize,
    });
  };

  const handleCheckPossible = () => {
    if (!knightPos) {
      showError("Place the knight first to check possibility.");
      return;
    }
    if (isHintLoading || isPossibleLoading || isTracingBack || gameStatus.includes("No Knight's Tour possible") || isAnimatingMove) {
      showError("Please wait for the current action to finish or start a new game.");
      return;
    }
    setIsPossibleLoading(true);
    setGameStatus("Checking if tour is possible... this might take a moment for larger boards."); // Updated message
    setIsPossibleCheckCount(prev => prev + 1);
    possibleRequestStartTime.current = Date.now();
    console.log("Sending CHECK_POSSIBLE message to worker."); // Debug log
    workerRef.current?.postMessage({
      type: 'CHECK_POSSIBLE',
      board: board.map(r => [...r]),
      knightPos,
      visitedCount,
      boardSize,
    });
  };

  return (
    <div className="flex flex-col items-center p-4 relative">
      <GameInfoSidebar />
      <h2 className="text-2xl font-bold mb-4">Knight's Tour</h2>
      <div className={cn(
        `relative grid grid-cols-${boardSize} border border-gray-400 dark:border-gray-600 transition-shadow duration-300 ease-in-out`,
        underglowColorClass
      )}>
        {board.map((rowArr, rowIndex) =>
          rowArr.map((_, colIndex) => (
            <Square
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              col={colIndex}
              isVisited={board[rowIndex][colIndex] === 1}
              isKnightHere={knightPos?.row === rowIndex && knightPos?.col === colIndex}
              isPossibleMove={possibleMoves.has(`${rowIndex},${colIndex}`)}
              onClick={handleSquareClick}
              hintMove={hintMove}
            />
          ))
        )}
        {isAnimatingMove && animatingKnightFrom && animatingKnightTo && (
          <AnimatedKnight
            from={animatingKnightFrom}
            to={animatingKnightTo}
            boardSize={boardSize}
            onAnimationEnd={handleAnimationEnd}
          />
        )}
      </div>
      <GameProgress visitedCount={visitedCount} boardSize={boardSize} />
      <Controls
        onNewGame={initializeBoard}
        onHint={handleHint}
        onCheckPossible={handleCheckPossible}
        gameStatus={gameStatus}
        knightPlaced={knightPos !== null}
        isHintLoading={isHintLoading}
        isPossibleLoading={isPossibleLoading}
        hintsRemaining={hintsRemaining}
        onReturnToMenu={onReturnToMenu}
      />
    </div>
  );
};

export default Board;