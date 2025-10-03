"use client";

import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedKnightProps {
  from: { row: number; col: number };
  to: { row: number; col: number };
  boardSize: number;
  onAnimationEnd: () => void;
}

const ANIMATION_DURATION_MS = 500; // ms
const SQUARE_SIZE_SM = 64; // px for sm:w-16
const SQUARE_SIZE_BASE = 48; // px for w-12

const AnimatedKnight: React.FC<AnimatedKnightProps> = ({ from, to, boardSize, onAnimationEnd }) => {
  const [squareSize, setSquareSize] = useState(SQUARE_SIZE_BASE);
  const knightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 640px)');
    const updateSquareSize = () => {
      setSquareSize(mediaQuery.matches ? SQUARE_SIZE_SM : SQUARE_SIZE_BASE);
    };

    updateSquareSize();
    mediaQuery.addEventListener('change', updateSquareSize);

    return () => mediaQuery.removeEventListener('change', updateSquareSize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationEnd();
    }, ANIMATION_DURATION_MS);

    return () => clearTimeout(timer);
  }, [from, to, onAnimationEnd]);

  // Calculate start and end positions in pixels
  const startX = from.col * squareSize;
  const startY = from.row * squareSize;
  const endX = to.col * squareSize;
  const endY = to.row * squareSize;

  return (
    <div
      ref={knightRef}
      className="absolute z-10 flex items-center justify-center"
      style={{
        left: `${startX}px`,
        top: `${startY}px`,
        width: `${squareSize}px`,
        height: `${squareSize}px`,
        transform: `translate(${endX - startX}px, ${endY - startY}px)`,
        transition: `transform ${ANIMATION_DURATION_MS}ms ease-in-out`,
      }}
    >
      <span
        className={cn(
          "text-xl sm:text-3xl",
          "animate-knight-jump"
        )}
        style={{ animationDuration: `${ANIMATION_DURATION_MS}ms` }}
      >
        ♘
      </span>
    </div>
  );
};

export default AnimatedKnight;