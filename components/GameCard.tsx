import Link from "next/link";
import { GameEntry, GameType } from "@/lib/types";

interface GameCardProps {
  game: GameEntry;
}

const TYPE_LABELS: Record<GameType, string> = {
  react: "React",
  python: "Python",
  "python-server": "Python Server",
  static: "Static",
};

const TYPE_COLORS: Record<GameType, string> = {
  react: "bg-sky-900/60 text-sky-300",
  python: "bg-emerald-900/60 text-emerald-300",
  "python-server": "bg-amber-900/60 text-amber-300",
  static: "bg-violet-900/60 text-violet-300",
};

export default function GameCard({ game }: GameCardProps) {
  return (
    <Link
      href={`/games/${game.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 transition hover:border-brand-600"
    >
      <div className="relative aspect-video w-full bg-neutral-800">
        {game.thumbnail && (
          <img
            src={`/games/${game.slug}/${game.thumbnail}`}
            alt={game.title}
            className="h-full w-full object-cover"
          />
        )}
        <span
          className={`absolute right-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TYPE_COLORS[game.type]}`}
        >
          {TYPE_LABELS[game.type]}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-white group-hover:text-brand-400">
          {game.title}
        </h3>
        <p className="mt-1 flex-1 text-sm text-neutral-400 line-clamp-2">
          {game.description}
        </p>
        {game.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {game.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
