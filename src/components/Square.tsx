import React from 'react';
import { cn } from '@/lib/utils';

interface SquareProps {
  row: number;
  col: number;
  isVisited: boolean;
  isKnightHere: boolean;
  isPossibleMove: boolean;
  onClick: (row: number, col: number) => void;
}

const Square: React.FC<SquareProps> = ({
  row,
  col,
  isVisited,
  isKnightHere,
  isPossibleMove,
  onClick,
}) => {
  const handleClick = () => {
    onClick(row, col);
  };

  return (
    <div
      className={cn(
        "w-12 h-12 flex items-center justify-center text-sm font-medium",
        (row + col) % 2 === 0 ? "bg-gray-200 dark:bg-gray-700" : "bg-gray-100 dark:bg-gray-800",
        isVisited && "bg-blue-300 dark:bg-blue-600",
        isKnightHere && "bg-green-500 dark:bg-green-700 text-white",
        isPossibleMove && "bg-yellow-300 dark:bg-yellow-500 cursor-pointer hover:bg-yellow-400 dark:hover:bg-yellow-600",
        !isKnightHere && !isVisited && !isPossibleMove && "cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600",
        "transition-colors duration-150 ease-in-out"
      )}
      onClick={handleClick}
    >
      {isKnightHere && "♘"}
      {isVisited && !isKnightHere && (
        <span className="text-xs text-gray-700 dark:text-gray-300">
          {/* You can display move number here later if needed */}
        </span>
      )}
    </div>
  );
};

export default Square;