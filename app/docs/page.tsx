import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Game Author Guide — Quantum Games",
  description: "How to build and submit a game for Quantum Games.",
};

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="mb-4 text-xl font-bold text-white">{title}</h2>
      {children}
    </section>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-neutral-800 px-1.5 py-0.5 text-sm text-brand-300">
      {children}
    </code>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-neutral-900 p-4 text-sm text-neutral-300">
      {children}
    </pre>
  );
}

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
        Game Author Guide
      </h1>
      <p className="mb-10 text-neutral-400">
        Everything you need to build and submit a game for Quantum Games.
      </p>

      {/* Table of contents */}
      <nav className="mb-12 rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          On this page
        </p>
        <ol className="space-y-1 text-sm">
          {[
            ["overview", "Overview"],
            ["game-config", "Game Config"],
            ["react-games", "React / TypeScript Games"],
            ["python-games", "Python (Pyodide) Games"],
            ["static-games", "Static Engine Games"],
            ["server-games", "Python Server Games"],
            ["submitting", "Submitting Your Game"],
            ["updating", "Updating a Game"],
          ].map(([id, label]) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className="text-neutral-400 transition hover:text-brand-400"
              >
                {label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="space-y-12 text-neutral-300 [&_p]:leading-relaxed">
        {/* --- Overview --- */}
        <Section id="overview" title="Overview">
          <p>
            Each game is an independent Git repository integrated into the main
            site as a{" "}
            <a
              href="https://git-scm.com/book/en/v2/Git-Tools-Submodules"
              className="text-brand-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              git submodule
            </a>
            . The site supports four game types:
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-left text-neutral-400">
                  <th className="pb-2 pr-4 font-medium">Type</th>
                  <th className="pb-2 pr-4 font-medium">How it runs</th>
                  <th className="pb-2 font-medium">Entry file</th>
                </tr>
              </thead>
              <tbody className="text-neutral-300">
                <tr className="border-b border-neutral-800/50">
                  <td className="py-2 pr-4"><Code>react</Code></td>
                  <td className="py-2 pr-4">Dynamically imported React component</td>
                  <td className="py-2"><Code>src/index.tsx</Code></td>
                </tr>
                <tr className="border-b border-neutral-800/50">
                  <td className="py-2 pr-4"><Code>python</Code></td>
                  <td className="py-2 pr-4">Runs in-browser via Pyodide (WASM)</td>
                  <td className="py-2"><Code>src/main.py</Code></td>
                </tr>
                <tr className="border-b border-neutral-800/50">
                  <td className="py-2 pr-4"><Code>static</Code></td>
                  <td className="py-2 pr-4">Embedded via iframe (Phaser, Unity, Godot)</td>
                  <td className="py-2"><Code>index.html</Code> (build output)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4"><Code>python-server</Code></td>
                  <td className="py-2 pr-4">Iframe to a separate backend service</td>
                  <td className="py-2"><Code>server.py</Code></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* --- Game Config --- */}
        <Section id="game-config" title="Game Config">
          <p className="mb-4">
            Every game repository must have a <Code>game.config.json</Code> at
            its root. This tells the build system how to integrate your game.
          </p>
          <CodeBlock>{`{
  "slug": "my-game",
  "title": "My Game",
  "description": "A short description.",
  "type": "react",
  "entry": "src/index.tsx",
  "thumbnail": "thumbnail.png",
  "tags": ["puzzle", "singleplayer"],
  "minPlayers": 1,
  "maxPlayers": 1,
  "version": "1.0.0"
}`}</CodeBlock>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-left text-neutral-400">
                  <th className="pb-2 pr-4 font-medium">Field</th>
                  <th className="pb-2 pr-4 font-medium">Required</th>
                  <th className="pb-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="text-neutral-300">
                {[
                  ["slug", "Yes", "URL-safe ID. Must match directory name."],
                  ["title", "Yes", "Display name in the catalog."],
                  ["description", "Yes", "Short description (1-2 sentences)."],
                  ["type", "Yes", "react, python, python-server, or static."],
                  ["entry", "Yes", "Path to entrypoint relative to repo root."],
                  ["thumbnail", "Yes", "Path to thumbnail image (600x400 recommended)."],
                  ["tags", "No", "Array of tags for filtering."],
                  ["version", "No", "Semver version string."],
                ].map(([field, req, desc]) => (
                  <tr key={field} className="border-b border-neutral-800/50">
                    <td className="py-2 pr-4"><Code>{field}</Code></td>
                    <td className="py-2 pr-4">{req}</td>
                    <td className="py-2">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* --- React Games --- */}
        <Section id="react-games" title="React / TypeScript Games">
          <p className="mb-4">
            Your entry file must <strong>default export</strong> a React
            component. It receives an optional <Code>onExit</Code> callback.
          </p>
          <CodeBlock>{`// src/index.tsx
interface GameProps {
  onExit?: () => void;
}

export default function MyGame({ onExit }: GameProps) {
  return (
    <div>
      <h1>My Game</h1>
      <button onClick={onExit}>Back</button>
    </div>
  );
}`}</CodeBlock>
          <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-neutral-400">
            <li>React and ReactDOM are provided by the host — use <Code>peerDependencies</Code>.</li>
            <li>Your component gets a full-width container. Don&apos;t assume parent layout.</li>
            <li>No side effects on import — initialize in <Code>useEffect</Code>.</li>
          </ul>
        </Section>

        {/* --- Python Games --- */}
        <Section id="python-games" title="Python (Pyodide) Games">
          <p className="mb-4">
            Python games run in the browser via Pyodide. Your entry must define
            a <Code>main(canvas, ctx)</Code> function.
          </p>
          <CodeBlock>{`# src/main.py
from pyodide.ffi import create_proxy
from js import window

def main(canvas, ctx):
    # canvas = HTML canvas element
    # ctx = 2D rendering context
    ctx.fillStyle = "#ff0000"
    ctx.fillRect(10, 10, 100, 50)

    def animate(*args):
        # game loop
        window.requestAnimationFrame(proxy)

    proxy = create_proxy(animate)
    window.requestAnimationFrame(proxy)`}</CodeBlock>
          <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-neutral-400">
            <li>
              Only{" "}
              <a
                href="https://pyodide.org/en/stable/usage/packages-in-pyodide.html"
                className="text-brand-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Pyodide-compatible packages
              </a>{" "}
              are supported.
            </li>
            <li>List packages in <Code>requirements.txt</Code>.</li>
            <li>stdout/stderr are shown in the output console below the canvas.</li>
          </ul>
        </Section>

        {/* --- Static Games --- */}
        <Section id="static-games" title="Static Engine Games">
          <p className="mb-4">
            For Phaser, Unity, Godot, or any engine that produces a static web
            build. Set <Code>type: &quot;static&quot;</Code> and provide{" "}
            <Code>buildCommand</Code> + <Code>buildOutput</Code>.
          </p>
          <CodeBlock>{`{
  "slug": "space-shooter",
  "type": "static",
  "entry": "index.html",
  "buildCommand": "npm run build",
  "buildOutput": "dist",
  ...
}`}</CodeBlock>
          <p className="mt-2 text-sm text-neutral-400">
            The build output is copied to <Code>public/games/&lt;slug&gt;/</Code>{" "}
            and served via iframe.
          </p>
        </Section>

        {/* --- Server Games --- */}
        <Section id="server-games" title="Python Server Games">
          <p className="mb-4">
            For games needing a backend (multiplayer, databases). Include a{" "}
            <Code>Dockerfile</Code> and set <Code>serverPort</Code>.
          </p>
          <CodeBlock>{`{
  "slug": "multiplayer-chess",
  "type": "python-server",
  "entry": "server.py",
  "serverPort": 8000,
  ...
}`}</CodeBlock>
          <p className="mt-2 text-sm text-neutral-400">
            Server games are deployed separately and embedded via iframe. Set{" "}
            <Code>serverUrl</Code> per environment.
          </p>
        </Section>

        {/* --- Submitting --- */}
        <Section id="submitting" title="Submitting Your Game">
          <ol className="list-inside list-decimal space-y-3 text-sm">
            <li>
              Create a Git repository with <Code>game.config.json</Code> at the
              root.
            </li>
            <li>
              From the Quantum Games repo, add it as a submodule:
              <CodeBlock>{`git submodule add <repo-url> games/<slug>
npm run build:games
npm run dev  # verify at /games/<slug>`}</CodeBlock>
            </li>
            <li>
              Commit and push:
              <CodeBlock>{`git add .gitmodules games/<slug>
git commit -m "Add game: <slug>"
git push`}</CodeBlock>
            </li>
          </ol>
        </Section>

        {/* --- Updating --- */}
        <Section id="updating" title="Updating a Game">
          <CodeBlock>{`# Update one game to latest
cd games/<slug>
git pull origin main
cd ../..
git add games/<slug>
git commit -m "Update <slug>"

# Update all games
git submodule update --remote --merge
git add games/
git commit -m "Update all games"`}</CodeBlock>
        </Section>
      </div>

      <div className="mt-12 border-t border-neutral-800 pt-6 text-center">
        <Link
          href="/"
          className="text-sm text-brand-400 transition hover:text-brand-300"
        >
          Back to Games
        </Link>
      </div>
    </div>
  );
}
