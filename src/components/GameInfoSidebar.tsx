"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"; // Import SheetClose
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Menu, X } from "lucide-react"; // Import X icon
import HowToPlay from "./HowToPlay";
import LogicExplanationContent from "./LogicExplanation";
import ScoringRules from "./ScoringRules"; // Import the new ScoringRules component
import { CustomSheetContent } from './CustomSheetContent'; // Import the new CustomSheetContent

interface GameInfoSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalEntries: number | null; // New prop for total entries
}

const GameInfoSidebar: React.FC<GameInfoSidebarProps> = ({ open, onOpenChange, totalEntries }) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="absolute top-4 left-4 z-20">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Open game info</span>
        </Button>
      </SheetTrigger>
      <CustomSheetContent side="left" className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="text-3xl font-bold">Game Information</SheetTitle>
        </SheetHeader>
        {/* The single, larger close button */}
        <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
          <X className="h-6 w-6" /> {/* Increased icon size */}
          <span className="sr-only">Close</span>
        </SheetClose>
        <Tabs defaultValue="how-to-play" className="flex flex-col flex-grow overflow-hidden">
          <TabsList className="grid w-full grid-cols-3 rounded-none border-b bg-background p-0 px-6">
            <TabsTrigger value="how-to-play" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
              How to Play
            </TabsTrigger>
            <TabsTrigger value="logic-explanation" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
              Logic Explanation
            </TabsTrigger>
            <TabsTrigger value="scoring-rules" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
              Scoring Rules
            </TabsTrigger>
          </TabsList>
          <div className="flex-grow overflow-y-auto p-6">
            <TabsContent value="how-to-play">
              <HowToPlay />
            </TabsContent>
            <TabsContent value="logic-explanation">
              <LogicExplanationContent />
            </TabsContent>
            <TabsContent value="scoring-rules">
              <ScoringRules />
            </TabsContent>
            {totalEntries !== null && (
              <div className="mt-6 p-4 bg-muted/50 dark:bg-muted-foreground/10 rounded-md text-center">
                <p className="text-sm text-muted-foreground">
                  Number of tourists that tried before you: <span className="font-bold text-primary">{totalEntries}</span>
                </p>
              </div>
            )}
          </div>
        </Tabs>
      </CustomSheetContent>
    </Sheet>
  );
};

export default GameInfoSidebar;