"use client";

import React from 'react';
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ScoringRules: React.FC = () => {
  return (
    <div>
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">Scoring Rules</DialogTitle>
        <DialogDescription>
          Understand how your performance translates into a high score!
        </DialogDescription>
      </DialogHeader>
      <div className="prose dark:prose-invert max-w-none mt-6">
        <h3 className="text-xl font-semibold mb-3">How Your Score is Calculated</h3>
        <p className="mb-3">
          Your final score is a reflection of how efficiently and skillfully you complete the Knight's Tour. It's based on several factors:
        </p>

        <h4 className="text-lg font-semibold mt-4 mb-2">1. Base Score Components:</h4>
        <ul className="list-disc list-inside ml-4 mb-3">
          <li>
            <strong>Squares Visited:</strong> Each square you visit contributes positively to your score. The more squares you cover, the higher your base score.
            <ul className="list-disc list-inside ml-6">
              <li><span className="font-semibold">Formula:</span> `Visited Squares * 100`</li>
            </ul>
          </li>
          <li>
            <strong>Hints Used:</strong> Using hints reduces your score. Try to solve as much as you can without assistance!
            <ul className="list-disc list-inside ml-6">
              <li><span className="font-semibold">Formula:</span> `Hints Used * -10`</li>
            </ul>
          </li>
          <li>
            <strong>"Is Possible?" Checks:</strong> Each time you ask the solver if a tour is possible, it incurs a small penalty.
            <ul className="list-disc list-inside ml-6">
              <li><span className="font-semibold">Formula:</span> `Is Possible Checks * -20`</li>
            </ul>
          </li>
          <li>
            <strong>Hints Remaining:</strong> If you finish the game with hints left, you get bonus points!
            <ul className="list-disc list-inside ml-6">
              <li><span className="font-semibold">Formula:</span> `Hints Remaining * 10`</li>
            </ul>
          </li>
        </ul>
        <p className="mb-3">
          The sum of these components forms your initial base score.
        </p>

        <h4 className="text-lg font-semibold mt-4 mb-2">2. Difficulty Multiplier:</h4>
        <p className="mb-3">
          The difficulty you choose at the start of the game significantly impacts your final score through a multiplier:
        </p>
        <ul className="list-disc list-inside ml-4 mb-3">
          <li>
            <strong>Easy:</strong> `1.0x` multiplier (5 hints)
          </li>
          <li>
            <strong>Medium:</strong> `1.2x` multiplier (3 hints)
          </li>
          <li>
            <strong>Hard:</strong> `1.5x` multiplier (1 hint)
          </li>
        </ul>
        <p className="mb-3">
          Your base score is multiplied by this factor to get your raw final score.
        </p>

        <h4 className="text-lg font-semibold mt-4 mb-2">3. Final Score Calculation:</h4>
        <p className="mb-3">
          The final score is calculated as:
        </p>
        <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto text-sm mb-3">
          <code>
{`Final Score = MAX(0, (
  (Visited Squares * 100) -
  (Is Possible Checks * 20) +
  (Hints Remaining * 10)
) * Difficulty Multiplier)`}
          </code>
        </pre>
        <p className="mb-3">
          The score is always a non-negative number, meaning it will not go below zero.
        </p>

        <p className="mt-4">
          Aim for a high score by completing the tour, using fewer hints, and minimizing "Is Possible?" checks, especially on harder difficulties!
        </p>
      </div>
    </div>
  );
};

export default ScoringRules;