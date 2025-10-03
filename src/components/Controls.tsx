import React from 'react';
import { Button } from '@/components/ui/button'; // Keep for Main Menu
import { GlassButton } from './GlassButton'; // Import the new GlassButton
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
      <div className="flex flex-wrap justify-center gap-4 w-full">
        <GlassButton
          onClick={onNewGame}
          className="px-6 py-2"
        >
          <RotateCcw className="mr-2 h-4 w-4" /> New Game
        </GlassButton>
        <GlassButton
          onClick={onHint}
          disabled={!knightPlaced || isHintLoading || isPossibleLoading || hintsRemaining <= 0 || isGameOverState}
          className="px-6 py-2"
        >
          {isHintLoading ? "Calculating..." : <><Lightbulb className="mr-2 h-4 w-4" /> Hint ({hintsRemaining})</>}
        </GlassButton>
        <GlassButton
          onClick={onCheckPossible}
          disabled={!knightPlaced || isPossibleLoading || isHintLoading || isGameOverState}
          className="px-6 py-2"
        >
          {isPossibleLoading ? "Checking..." : <><HelpCircle className="mr-2 h-4 w-4" /> Is possible?</>}
        </GlassButton>
        <Button
          onClick={onReturnToMenu}
          variant="outline"
          className="px-6 py-2 rounded-full border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 ease-in-out"
        >
          <Home className="mr-2 h-4 w-4" /> Main Menu
        </Button>
      </div>
    </div>
  );
};

export default Controls;