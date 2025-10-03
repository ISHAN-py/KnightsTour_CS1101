import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ControlsProps {
  onNewGame: () => void;
  onHint: () => void;
  onCheckPossible: () => void;
  gameStatus: string;
  knightPlaced: boolean;
  isHintLoading: boolean;
  isPossibleLoading: boolean;
  hintsRemaining: number; // New prop for hints remaining
  onReturnToMenu: () => void; // New prop for returning to main menu
}

const Controls: React.FC<ControlsProps> = ({
  onNewGame,
  onHint,
  onCheckPossible,
  gameStatus,
  knightPlaced,
  isHintLoading,
  isPossibleLoading,
  hintsRemaining, // Destructure new prop
  onReturnToMenu, // Destructure new prop
}) => {
  const isGameOverState = gameStatus.includes("No Knight's Tour possible") || gameStatus.includes("Game Over") || gameStatus.includes("Congratulations");

  return (
    <div className="mt-6 flex flex-col items-center space-y-4">
      {gameStatus && (
        <div className="text-xl font-semibold text-center">
          {gameStatus}
        </div>
      )}
      <div className="flex flex-wrap justify-center gap-2 sm:space-x-4"> {/* Adjusted for responsiveness */}
        <Button onClick={onNewGame} variant="default">
          New Game
        </Button>
        <Button
          onClick={onHint}
          disabled={!knightPlaced || isHintLoading || isPossibleLoading || hintsRemaining <= 0 || isGameOverState}
          variant="secondary"
        >
          {isHintLoading ? "Calculating..." : `Hint (${hintsRemaining})`}
        </Button>
        <Button
          onClick={onCheckPossible}
          disabled={!knightPlaced || isPossibleLoading || isHintLoading || isGameOverState}
          variant="secondary"
        >
          {isPossibleLoading ? "Checking..." : "Is this possible?"}
        </Button>
        <Button onClick={onReturnToMenu} variant="outline">
          Main Menu
        </Button>
      </div>
    </div>
  );
};

export default Controls;