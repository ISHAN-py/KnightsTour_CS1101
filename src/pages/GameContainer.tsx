"use client";

import React, { useState, useEffect } from 'react';
import Board from '@/components/Board';
import StartMenu from '@/components/StartMenu';
import HighScoreTable from '@/components/HighScoreTable'; // Import HighScoreTable
import { useTheme } from 'next-themes';

const GameContainer: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [boardSize, setBoardSize] = useState(6); // Default to 6x6
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>(theme === 'dark' ? 'dark' : 'light');
  const [initialHints, setInitialHints] = useState(3); // Default to medium hints
  const [underglowColorClass, setUnderglowColorClass] = useState<string>(''); // New state for underglow color
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium'); // New state for difficulty

  useEffect(() => {
    // Ensure the theme from next-themes is reflected in local state
    if (theme) {
      setSelectedTheme(theme as 'light' | 'dark');
    }
  }, [theme]);

  const handleStartGame = (size: number, chosenTheme: 'light' | 'dark', hints: number, glowClass: string, selectedDifficulty: 'easy' | 'medium' | 'hard') => {
    setBoardSize(size);
    setSelectedTheme(chosenTheme);
    setTheme(chosenTheme); // Apply theme if not already set by StartMenu
    setInitialHints(hints);
    setUnderglowColorClass(glowClass); // Set the underglow color class
    setDifficulty(selectedDifficulty); // Set the difficulty
    setGameStarted(true);
  };

  const handleReturnToMenu = () => {
    setGameStarted(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-around p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {!gameStarted ? (
        <StartMenu onStartGame={handleStartGame} />
      ) : (
        <>
          <Board boardSize={boardSize} onReturnToMenu={handleReturnToMenu} initialHints={initialHints} underglowColorClass={underglowColorClass} difficulty={difficulty} />
          <HighScoreTable boardSize={boardSize} />
        </>
      )}
    </div>
  );
};

export default GameContainer;