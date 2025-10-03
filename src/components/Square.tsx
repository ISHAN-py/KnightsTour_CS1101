import React from 'react';
import { cn } from '@/lib/utils';

interface SquareProps {
  row: number;
  col: number;
  isVisited: boolean;
  isKnightHere: boolean;
  isPossibleMove: boolean;
  onClick: (row: number, col: number) => void;
  hintMove: { row: number; col: number } | null; // New prop for hint glow
}

const Square: React.FC<SquareProps> = ({
  row,
  col,
  isVisited,
  isKnightHere,
  isPossibleMove,
  onClick,
  hintMove,
}) => {
  const handleClick = () => {
    onClick(row, col);
  };

  const isHintSquare = hintMove?.row === row && hintMove?.col === col;

  return (
    <div
      className={cn(
        "w-12 h-12 sm:w-16 sm:h-16 flex flex-col items-center justify-center text-sm font-medium relative", // Adjusted size for mobile, then sm:w-16 sm:h-16
        (row + col) % 2 === 0 ? "bg-gray-200 dark:bg-gray-700" : "bg-gray-100 dark:bg-gray-800",
        isVisited && "bg-blue-300 dark:bg-blue-600",
        isKnightHere && "bg-green-500 dark:bg-green-700 text-white",
        isPossibleMove && "bg-yellow-300 dark:bg-yellow-500 cursor-pointer hover:bg-yellow-400 dark:hover:bg-yellow-600",
        isPossibleMove && isHintSquare && "animate-neon-pulse relative", // Apply neon glow to hint square
        !isKnightHere && !isVisited && !isPossibleMove && "cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600",
        "transition-colors duration-150 ease-in-out"
      )}
      onClick={handleClick}
    >
      <span className="absolute top-0 left-0 p-0.5 text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400"> {/* Adjusted font size */}
        ({row},{col})
      </span>
      {isKnightHere && <span className="text-xl sm:text-3xl">♘</span>} {/* Adjusted knight icon size */}
      {isVisited && !isKnightHere && (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {/* You can display move number here later if needed */}
        </span>
      )}
    </div>
  );
};

export default Square;