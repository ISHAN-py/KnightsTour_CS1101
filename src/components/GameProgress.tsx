"use client";

import React from 'react';
import { Progress } from '@/components/ui/progress';

interface GameProgressProps {
  visitedCount: number;
  boardSize: number;
}

const GameProgress: React.FC<GameProgressProps> = ({ visitedCount, boardSize }) => {
  const totalSquares = boardSize * boardSize;
  const progressPercentage = (visitedCount / totalSquares) * 100;

  return (
    <div className="w-full max-w-md mt-4 flex flex-col items-center space-y-2">
      <div className="text-lg font-medium">
        Progress: {visitedCount} / {totalSquares} squares visited
      </div>
      <Progress value={progressPercentage} className="w-full h-3 bg-gray-200 dark:bg-gray-700" indicatorClassName="bg-green-500 dark:bg-green-400" />
    </div>
  );
};

export default GameProgress;