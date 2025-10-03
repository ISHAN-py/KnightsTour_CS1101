"use client";

import React, { useState, useEffect } from 'react';
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
  const [selectedBoardSize, setSelectedBoardSize] = useState<number | null>(null);
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | null>(null);

  // Initialize selectedTheme based on current theme from next-themes on mount
  useEffect(() => {
    if (theme) {
      setSelectedTheme(theme === 'dark' ? 'dark' : 'light');
    }
  }, [theme]);

  const handleStartClick = () => {
    setCurrentStep(2);
  };

  const handleBoardSizeChange = (value: string) => {
    setSelectedBoardSize(parseInt(value));
  };

  const handleThemeChange = (value: 'light' | 'dark') => {
    setSelectedTheme(value);
    setTheme(value); // Apply theme immediately
  };

  const handleNextStep = () => {
    if (currentStep === 2 && selectedBoardSize !== null) {
      setCurrentStep(3);
    } else if (currentStep === 3 && selectedTheme !== null) {
      onStartGame(selectedBoardSize!, selectedTheme!);
    }
  };

  const handleBackStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: `url('/chess-knights-background.jpg')` }}>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black opacity-60"></div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full">
        {currentStep === 1 && (
          <Card className="w-full max-w-sm bg-background/80 dark:bg-background/90 shadow-lg dark:shadow-xl rounded-lg p-6">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center mb-2">Knight's Tour</CardTitle>
              <CardDescription className="text-center text-muted-foreground">Embark on a classic chess puzzle!</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center mt-6">
              <Button onClick={handleStartClick} className="w-full py-3 text-lg">
                Start Game
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card className="w-full max-w-sm bg-background/80 dark:bg-background/90 shadow-lg dark:shadow-xl rounded-lg p-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold mb-2">Choose Board Size</CardTitle>
              <CardDescription className="text-muted-foreground">Select the challenge level.</CardDescription>
            </CardHeader>
            <CardContent className="mt-4">
              <RadioGroup
                value={selectedBoardSize?.toString() || ""}
                onValueChange={handleBoardSizeChange}
                className="flex flex-col space-y-3"
              >
                <div className="flex items-center space-x-3 p-2 border rounded-md hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="5" id="r1" />
                  <Label htmlFor="r1" className="text-base cursor-pointer">5x5 Board</Label>
                </div>
                <div className="flex items-center space-x-3 p-2 border rounded-md hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="6" id="r2" />
                  <Label htmlFor="r2" className="text-base cursor-pointer">6x6 Board</Label>
                </div>
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between mt-6">
              <Button onClick={handleBackStep} variant="outline" className="py-2 px-4">Back</Button>
              <Button onClick={handleNextStep} disabled={selectedBoardSize === null} className="py-2 px-4">Next</Button>
            </CardFooter>
          </Card>
        )}

        {currentStep === 3 && (
          <Card className="w-full max-w-sm bg-background/80 dark:bg-background/90 shadow-lg dark:shadow-xl rounded-lg p-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold mb-2">Choose Theme</CardTitle>
              <CardDescription className="text-muted-foreground">Personalize your experience.</CardDescription>
            </CardHeader>
            <CardContent className="mt-4">
              <RadioGroup
                value={selectedTheme || ""}
                onValueChange={handleThemeChange}
                className="flex flex-col space-y-3"
              >
                <div className="flex items-center space-x-3 p-2 border rounded-md hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="light" id="t1" />
                  <Label htmlFor="t1" className="text-base cursor-pointer">Light Mode</Label>
                </div>
                <div className="flex items-center space-x-3 p-2 border rounded-md hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="dark" id="t2" />
                  <Label htmlFor="t2" className="text-base cursor-pointer">Dark Mode</Label>
                </div>
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between mt-6">
              <Button onClick={handleBackStep} variant="outline" className="py-2 px-4">Back</Button>
              <Button onClick={handleNextStep} disabled={selectedTheme === null} className="py-2 px-4">Play!</Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StartMenu;