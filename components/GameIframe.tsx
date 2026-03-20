"use client";

interface GameIframeProps {
  slug: string;
  /** For python-server type: external URL. For static type: /games/<slug>/index.html */
  src?: string;
}

export default function GameIframe({ slug, src }: GameIframeProps) {
  const iframeSrc = src ?? `/games/${slug}/index.html`;

  return (
    <iframe
      src={iframeSrc}
      title={slug}
      className="aspect-video w-full rounded-lg border border-neutral-800 sm:aspect-auto sm:h-[calc(100vh-12rem)]"
      sandbox="allow-scripts allow-same-origin allow-popups"
      allow="gamepad; autoplay"
    />
  );
}
