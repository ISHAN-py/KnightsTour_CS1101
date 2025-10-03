import React, { useState, useEffect, useCallback } from 'react';
import Square from './Square';
import { showSuccess, showError } from '@/utils/toast';

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

  const initializeBoard = useCallback(() => {
    const newBoard: number[][] = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(0));
    setBoard(newBoard);
    setKnightPos(null);
    setVisitedCount(0);
    setPossibleMoves(new Set());
  }, []);

  useEffect(() => {
    initializeBoard();
  }, [initializeBoard]);

  const isValidMove = (row: number, col: number) => {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE && board[row][col] === 0;
  };

  const calculatePossibleMoves = useCallback((currentRow: number, currentCol: number) => {
    const moves = new Set<string>();
    for (const [dr, dc] of knightMoves) {
      const newRow = currentRow + dr;
      const newCol = currentCol + dc;
      if (isValidMove(newRow, newCol)) {
        moves.add(`${newRow},${newCol}`);
      }
    }
    setPossibleMoves(moves);
    return moves;
  }, [board]); // Depend on board to re-calculate when it changes

  const handleSquareClick = (row: number, col: number) => {
    if (!knightPos) {
      // First click, place the knight
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = 1; // Mark as visited
      setBoard(newBoard);
      setKnightPos({ row, col });
      setVisitedCount(1);
      calculatePossibleMoves(row, col);
      showSuccess("Knight placed! Make your first move.");
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

        const nextPossibleMoves = calculatePossibleMoves(row, col);

        if (newVisitedCount === BOARD_SIZE * BOARD_SIZE) {
          showSuccess("Congratulations! You completed the Knight's Tour!");
        } else if (nextPossibleMoves.size === 0) {
          showError("Game Over! No more legal moves from this position.");
        }
      } else {
        showError("Invalid move. Knights move in L-shapes and cannot land on visited squares.");
      }
    }
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
              isPossibleMove={possibleMoves.has(`${rowIndex},${colIndex}`)}
              onClick={handleSquareClick}
            />
          ))
        )}
      </div>
      <div className="mt-4 text-lg">
        Moves: {visitedCount} / {BOARD_SIZE * BOARD_SIZE}
      </div>
      <button
        onClick={initializeBoard}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        New Game
      </button>
    </div>
  );
};

export default Board;