"use client";

import React from 'react';
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const HowToPlay: React.FC = () => {
  return (
    <div>
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">How to Play Knight's Tour</DialogTitle>
        <DialogDescription>
          Master the moves and complete the ultimate chess puzzle!
        </DialogDescription>
      </DialogHeader>
      <div className="prose dark:prose-invert max-w-none mt-6">
        <h3 className="text-xl font-semibold mb-3">The Goal</h3>
        <p className="mb-3">
          The objective of the Knight's Tour is to move a knight on a chessboard such that it visits every square exactly once.
          The game ends when all squares are visited (a successful tour) or when the knight has no more legal moves (a failed tour).
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Knight's Movement</h3>
        <p className="mb-3">
          The knight moves in an "L" shape:
        </p>
        <ul className="list-disc list-inside ml-4 mb-3">
          <li>Two squares in one cardinal direction (horizontally or vertically).</li>
          <li>Then one square in a perpendicular direction.</li>
        </ul>
        <p className="mb-3">
          This means from any square, a knight can have up to 8 possible moves.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Game Rules</h3>
        <ol className="list-decimal list-inside ml-4 mb-3">
          <li>
            <strong>Starting Position:</strong> The game begins with the knight placed at (0,0).
          </li>
          <li>
            <strong>Valid Moves:</strong>
            <ul className="list-disc list-inside ml-4">
              <li>The move must be in an "L" shape.</li>
              <li>The destination square must be within the board boundaries.</li>
              <li>The destination square must not have been visited before.</li>
            </ul>
          </li>
          <li>
            <strong>Making a Move:</strong> Click on any highlighted yellow square to move the knight to that position.
          </li>
          <li>
            <strong>Winning:</strong> Complete the tour by visiting all squares on the board exactly once.
          </li>
          <li>
            <strong>Losing:</strong> If the knight reaches a point where there are no more legal moves, and not all squares have been visited, the game is over.
          </li>
        </ol>

        <h3 className="text-xl font-semibold mt-6 mb-3">Controls & Features</h3>
        <ul className="list-disc list-inside ml-4 mb-3">
          <li>
            <strong>New Game:</strong> Start a fresh game with a new board.
          </li>
          <li>
            <strong>Hint:</strong> Get a suggestion for the next optimal move. You have a limited number of hints.
          </li>
          <li>
            <strong>Is Possible?:</strong> Check if a Knight's Tour is still possible from your current position. This uses a background solver to determine feasibility without revealing the full path.
          </li>
          <li>
            <strong>Main Menu:</strong> Return to the start screen to choose a different board size or theme.
          </li>
        </ul>
        <p className="mt-4">
          Good luck, and enjoy the challenge!
        </p>
      </div>
    </div>
  );
};

export default HowToPlay;