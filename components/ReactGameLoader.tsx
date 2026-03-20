"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

interface GameProps {
  onExit?: () => void;
}

interface ReactGameLoaderProps {
  slug: string;
}

export default function ReactGameLoader({ slug }: ReactGameLoaderProps) {
  const router = useRouter();

  const GameComponent = useMemo(
    () =>
      dynamic<GameProps>(
        () =>
          import(`@/games/${slug}/src/index`).catch(() => {
            return {
              default: ({ onExit }: GameProps) => (
                <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                  <p className="text-neutral-400">
                    Failed to load game: <code>{slug}</code>
                  </p>
                  {onExit && (
                    <button
                      onClick={onExit}
                      className="text-sm text-brand-400 hover:underline"
                    >
                      Back to Games
                    </button>
                  )}
                </div>
              ),
            };
          }),
        { ssr: false }
      ),
    [slug]
  );

  return <GameComponent onExit={() => router.push("/")} />;
}
