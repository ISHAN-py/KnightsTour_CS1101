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
}) => {
  const isGameOverState = gameStatus.includes("No Knight's Tour possible") || gameStatus.includes("Game Over") || gameStatus.includes("Congratulations");

  return (
    <div className="mt-6 flex flex-col items-center space-y-4">
      {gameStatus && (
        <div className="text-xl font-semibold text-center">
          {gameStatus}
        </div>
      )}
      <div className="flex space-x-4">
        <Button onClick={onNewGame} variant="default">
          New Game
        </Button>
        <Button
          onClick={onHint}
          disabled={!knightPlaced || isHintLoading || isPossibleLoading || hintsRemaining <= 0 || isGameOverState} // Disable if no hints left or game over
          variant="secondary"
        >
          {isHintLoading ? "Calculating..." : `Hint (${hintsRemaining})`} {/* Display hints remaining */}
        </Button>
        <Button
          onClick={onCheckPossible}
          disabled={!knightPlaced || isPossibleLoading || isHintLoading || isGameOverState} // Disable if game over
          variant="secondary"
        >
          {isPossibleLoading ? "Checking..." : "Is this possible?"}
        </Button>
      </div>
    </div>
  );
};

export default Controls;