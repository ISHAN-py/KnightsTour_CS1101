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
  hintsRemaining: number;
  disableActions: boolean; // New prop to disable hint/possible buttons
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
  disableActions, // Destructure new prop
}) => {
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
          disabled={!knightPlaced || isHintLoading || isPossibleLoading || hintsRemaining <= 0 || disableActions} // Disable if disableActions is true
          variant="secondary"
        >
          {isHintLoading ? "Calculating..." : `Hint (${hintsRemaining})`}
        </Button>
        <Button
          onClick={onCheckPossible}
          disabled={!knightPlaced || isPossibleLoading || isHintLoading || disableActions} // Disable if disableActions is true
          variant="secondary"
        >
          {isPossibleLoading ? "Checking..." : "Is this possible?"}
        </Button>
      </div>
    </div>
  );
};

export default Controls;