"use client";

import { useState, useMemo } from "react";
import { GameEntry } from "@/lib/types";
import GameCard from "./GameCard";

interface GameCatalogProps {
  games: GameEntry[];
}

export default function GameCatalog({ games }: GameCatalogProps) {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    for (const game of games) {
      for (const tag of game.tags) {
        tags.add(tag);
      }
    }
    return Array.from(tags).sort();
  }, [games]);

  // Filter games by search + tags
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return games.filter((game) => {
      // Text search
      if (q) {
        const haystack =
          `${game.title} ${game.description} ${game.tags.join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      // Tag filter
      if (selectedTags.size > 0) {
        if (!game.tags.some((t) => selectedTags.has(t))) return false;
      }
      return true;
    });
  }, [games, search, selectedTags]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }

  return (
    <div>
      {/* Search bar */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search games..."
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-brand-600"
        />
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {allTags.map((tag) => {
            const active = selectedTags.has(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  active
                    ? "bg-brand-600 text-white"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-300"
                }`}
              >
                {tag}
              </button>
            );
          })}
          {selectedTags.size > 0 && (
            <button
              onClick={() => setSelectedTags(new Set())}
              className="rounded-full px-3 py-1 text-xs font-medium text-neutral-500 transition hover:text-neutral-300"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-800 p-12 text-center">
          <p className="text-neutral-500">
            No games match your search.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
