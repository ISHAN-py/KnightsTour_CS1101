"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Menu } from "lucide-react";
import HowToPlay from "./HowToPlay";
import LogicExplanationContent from "./LogicExplanation";
import ScoringRules from "./ScoringRules"; // Import the new ScoringRules component

interface GameInfoSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GameInfoSidebar: React.FC<GameInfoSidebarProps> = ({ open, onOpenChange }) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="absolute top-4 left-4 z-20">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Open game info</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="text-3xl font-bold">Game Information</SheetTitle>
        </SheetHeader>
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
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default GameInfoSidebar;