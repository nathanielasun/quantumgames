import { notFound } from "next/navigation";
import { gameRegistry } from "@/lib/game-registry";
import GameShell from "@/components/GameShell";
import ReactGameLoader from "@/components/ReactGameLoader";
import GameIframe from "@/components/GameIframe";
import PyodideRunner from "@/components/PyodideRunner";

interface GamePageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return gameRegistry.map((game) => ({ slug: game.slug }));
}

export function generateMetadata({ params }: GamePageProps) {
  const game = gameRegistry.find((g) => g.slug === params.slug);
  if (!game) return { title: "Game Not Found" };
  return {
    title: `${game.title} — Quantum Games`,
    description: game.description,
  };
}

export default function GamePage({ params }: GamePageProps) {
  const game = gameRegistry.find((g) => g.slug === params.slug);

  if (!game) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-white sm:text-2xl">{game.title}</h1>
        <p className="mt-1 text-xs text-neutral-400 sm:text-sm">{game.description}</p>
      </div>

      <GameShell gameName={game.title}>
        {game.type === "react" && <ReactGameLoader slug={game.slug} />}

        {game.type === "python" && (
          <PyodideRunner slug={game.slug} entry={game.entry} />
        )}

        {game.type === "static" && <GameIframe slug={game.slug} />}

        {game.type === "python-server" && (
          <GameIframe slug={game.slug} src={game.serverUrl} />
        )}
      </GameShell>
    </div>
  );
}
