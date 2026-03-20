import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-2xl font-bold text-white">Not Found</h2>
      <p className="text-neutral-400">That page doesn&apos;t exist.</p>
      <Link
        href="/"
        className="mt-2 rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
      >
        Back to Games
      </Link>
    </div>
  );
}
