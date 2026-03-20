"use client";

import React, { useState, useCallback } from "react";

interface ExampleGameProps {
  onExit?: () => void;
}

export default function ExampleGame({ onExit }: ExampleGameProps) {
  const [count, setCount] = useState(0);
  const [clicks, setClicks] = useState<{ x: number; y: number; id: number }[]>(
    []
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCount((c) => c + 1);
      setClicks((prev) => [...prev.slice(-19), { x, y, id: Date.now() }]);
    },
    []
  );

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white">Click Counter</h2>
        <p className="mt-1 text-sm text-neutral-400">
          Click anywhere in the box below. Score: {count}
        </p>
      </div>

      <div
        onClick={handleClick}
        className="relative h-[400px] w-full max-w-2xl cursor-crosshair overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900"
      >
        {clicks.map((click) => (
          <div
            key={click.id}
            className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-brand-500"
            style={{ left: click.x, top: click.y }}
          />
        ))}
        {clicks.length === 0 && (
          <div className="flex h-full items-center justify-center text-neutral-600">
            Click anywhere
          </div>
        )}
      </div>

      {onExit && (
        <button
          onClick={onExit}
          className="rounded bg-neutral-800 px-4 py-2 text-sm text-neutral-300 transition hover:bg-neutral-700"
        >
          Back to Catalog
        </button>
      )}
    </div>
  );
}
