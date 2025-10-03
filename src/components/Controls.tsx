import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Lightbulb, HelpCircle, Home } from 'lucide-react'; // Import icons

interface ControlsProps {
  onNewGame: () => void;
  onHint: () => void;
  onCheckPossible: () => void;
  gameStatus: string;
  knightPlaced: boolean;
  isHintLoading: boolean;
  isPossibleLoading: boolean;
  hintsRemaining: number;
  onReturnToMenu: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  onNewGame,
  onHint,
  onCheckPossible,
  gameStatus,
  knightPlaced,
  isHintLoading,
  isPossibleLoading,
  hintsRemaining,
  onReturnToMenu,
}) => {
  const isGameOverState = gameStatus.includes("No Knight's Tour possible") || gameStatus.includes("Game Over") || gameStatus.includes("Congratulations");

  return (
    <div className="mt-6 flex flex-col items-center space-y-4 w-full max-w-md">
      {gameStatus && (
        <div className="text-xl font-semibold text-center p-2 rounded-md bg-muted dark:bg-muted-foreground/20 w-full">
          {gameStatus}
        </div>
      )}
      <div className="flex flex-wrap justify-center gap-2 sm:space-x-4 w-full">
        <Button
          onClick={onNewGame}
          variant="secondary" // Changed to secondary variant
          className="flex-1 min-w-[120px] sm:min-w-0 rounded-full shadow-md hover:shadow-lg transition-all duration-200 ease-in-out"
        >
          <RotateCcw className="mr-2 h-4 w-4" /> New Game
        </Button>
        <Button
          onClick={onHint}
          disabled={!knightPlaced || isHintLoading || isPossibleLoading || hintsRemaining <= 0 || isGameOverState}
          variant="secondary" // Changed to secondary variant
          className="flex-1 min-w-[120px] sm:min-w-0 rounded-full shadow-md hover:shadow-lg transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isHintLoading ? "Calculating..." : <><Lightbulb className="mr-2 h-4 w-4" /> Hint ({hintsRemaining})</>}
        </Button>
        <Button
          onClick={onCheckPossible}
          disabled={!knightPlaced || isPossibleLoading || isHintLoading || isGameOverState}
          variant="secondary" // Changed to secondary variant
          className="flex-1 min-w-[120px] sm:min-w-0 rounded-full shadow-md hover:shadow-lg transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPossibleLoading ? "Checking..." : <><HelpCircle className="mr-2 h-4 w-4" /> Is possible?</>}
        </Button>
        <Button
          onClick={onReturnToMenu}
          variant="outline"
          className="flex-1 min-w-[120px] sm:min-w-0 rounded-full border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 ease-in-out"
        >
          <Home className="mr-2 h-4 w-4" /> Main Menu
        </Button>
      </div>
    </div>
  );
};

export default Controls;