import Link from "next/link";

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="border-b border-neutral-800 bg-neutral-900/50">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-400 transition hover:text-white"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
            Back to Games
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
