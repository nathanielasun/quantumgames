import GameCatalog from "@/components/GameCatalog";
import { gameRegistry } from "@/lib/game-registry";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Games</h1>
        <p className="mt-2 text-sm text-neutral-400 sm:text-base">
          Pick a game to play.
        </p>
      </div>

      {gameRegistry.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-800 p-12 text-center">
          <p className="text-neutral-500">
            No games registered yet. Add a game submodule to <code>games/</code>{" "}
            and run <code>npm run build:games</code>.
          </p>
        </div>
      ) : (
        <GameCatalog games={gameRegistry} />
      )}
    </div>
  );
}
