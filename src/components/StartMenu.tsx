"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface StartMenuProps {
  onStartGame: (boardSize: number, theme: 'light' | 'dark') => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ onStartGame }) => {
  const [currentStep, setCurrentStep] = useState(1); // 1: Start, 2: Board Size, 3: Theme
  const [selectedBoardSize, setSelectedBoardSize] = useState<number>(6);
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>(theme === 'dark' ? 'dark' : 'light');

  const handleStartClick = () => {
    setCurrentStep(2);
  };

  const handleBoardSizeSelect = (size: number) => {
    setSelectedBoardSize(size);
    setCurrentStep(3);
  };

  const handleThemeSelect = (newTheme: 'light' | 'dark') => {
    setSelectedTheme(newTheme);
    setTheme(newTheme); // Apply theme immediately
    setCurrentStep(4); // Move to final step (or directly start game)
  };

  const handleFinalStartGame = () => {
    onStartGame(selectedBoardSize, selectedTheme);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {currentStep === 1 && (
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Knight's Tour</CardTitle>
            <CardDescription>Embark on a classic chess puzzle!</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={handleStartClick} className="w-full">
              Start Game
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Choose Board Size</CardTitle>
            <CardDescription>Select the challenge level.</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              defaultValue={selectedBoardSize.toString()}
              onValueChange={(value) => handleBoardSizeSelect(parseInt(value))}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5" id="r1" />
                <Label htmlFor="r1">5x5 Board</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="6" id="r2" />
                <Label htmlFor="r2">6x6 Board</Label>
              </div>
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={() => setCurrentStep(1)} variant="outline">Back</Button>
          </CardFooter>
        </Card>
      )}

      {currentStep === 3 && (
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Choose Theme</CardTitle>
            <CardDescription>Personalize your experience.</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              defaultValue={selectedTheme}
              onValueChange={(value: 'light' | 'dark') => handleThemeSelect(value)}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="t1" />
                <Label htmlFor="t1">Light Mode</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="t2" />
                <Label htmlFor="t2">Dark Mode</Label>
              </div>
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={() => setCurrentStep(2)} variant="outline">Back</Button>
            <Button onClick={handleFinalStartGame}>Play!</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default StartMenu;