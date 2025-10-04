"use client";

import React, { useState, useEffect } from 'react';
import Board from '@/components/Board';
import StartMenu from '@/components/StartMenu';
import HighScoreTable from '@/components/HighScoreTable';
import { useTheme } from 'next-themes';

const GameContainer: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [boardSize, setBoardSize] = useState(6);
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>(theme === 'dark' ? 'dark' : 'light');
  const [initialHints, setInitialHints] = useState(3);
  const [underglowColorClass, setUnderglowColorClass] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [playerName, setPlayerName] = useState<string>('Guest'); // New state for player name, default to 'Guest'

  useEffect(() => {
    // Ensure the theme from next-themes is reflected in local state
    if (theme) {
      setSelectedTheme(theme as 'light' | 'dark');
    }
  }, [theme]);

  const handleStartGame = (size: number, chosenTheme: 'light' | 'dark', hints: number, glowClass: string, selectedDifficulty: 'easy' | 'medium' | 'hard', name: string) => {
    setBoardSize(size);
    setSelectedTheme(chosenTheme);
    setTheme(chosenTheme); // Apply theme if not already set by StartMenu
    setInitialHints(hints);
    setUnderglowColorClass(glowClass);
    setDifficulty(selectedDifficulty);
    setPlayerName(name); // Set the player name
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
          <Board
            boardSize={boardSize}
            onReturnToMenu={handleReturnToMenu}
            initialHints={initialHints}
            underglowColorClass={underglowColorClass}
            difficulty={difficulty}
            playerName={playerName} // Pass player name to Board
          />
          <HighScoreTable boardSize={boardSize} />
        </>
      )}
    </div>
  );
};

export default GameContainer;