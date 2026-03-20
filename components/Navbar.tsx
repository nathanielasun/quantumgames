"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="border-b border-neutral-800 bg-neutral-950">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold text-white">
          Quantum Games
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 sm:flex">
          <Link
            href="/"
            className="text-sm text-neutral-400 transition hover:text-white"
          >
            Games
          </Link>
          <Link
            href="/docs"
            className="text-sm text-neutral-400 transition hover:text-white"
          >
            Docs
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded text-neutral-400 transition hover:bg-neutral-800 hover:text-white sm:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="border-t border-neutral-800 px-4 pb-3 pt-2 sm:hidden">
          <Link
            href="/"
            className="block rounded px-3 py-2 text-sm text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
            onClick={() => setMenuOpen(false)}
          >
            Games
          </Link>
          <Link
            href="/docs"
            className="block rounded px-3 py-2 text-sm text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
            onClick={() => setMenuOpen(false)}
          >
            Docs
          </Link>
        </div>
      )}
    </nav>
  );
}
