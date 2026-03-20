"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface PyodideRunnerProps {
  slug: string;
  entry: string;
  onExit?: () => void;
}

type RunnerStatus =
  | "loading-runtime"
  | "installing-packages"
  | "loading-game"
  | "running"
  | "error";

declare global {
  interface Window {
    loadPyodide: (config?: { indexURL?: string }) => Promise<PyodideInterface>;
  }
}

interface PyodideInterface {
  loadPackagesFromImports: (code: string) => Promise<void>;
  loadPackage: (names: string | string[]) => Promise<void>;
  runPythonAsync: (code: string) => Promise<unknown>;
  globals: {
    get: (name: string) => unknown;
    set: (name: string, value: unknown) => void;
  };
  FS: {
    writeFile: (path: string, data: string) => void;
  };
}

const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";

export default function PyodideRunner({
  slug,
  entry,
  onExit,
}: PyodideRunnerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outputRef = useRef<HTMLPreElement>(null);
  const pyodideRef = useRef<PyodideInterface | null>(null);
  const [status, setStatus] = useState<RunnerStatus>("loading-runtime");
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<string[]>([]);

  const appendOutput = useCallback((line: string) => {
    setOutput((prev) => [...prev.slice(-200), line]);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        // Step 1: Load Pyodide runtime via CDN script tag
        setStatus("loading-runtime");

        if (!window.loadPyodide) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = `${PYODIDE_CDN}pyodide.js`;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load Pyodide CDN script"));
            document.head.appendChild(script);
          });
        }

        if (cancelled) return;

        const pyodide = await window.loadPyodide({ indexURL: PYODIDE_CDN });
        pyodideRef.current = pyodide;

        if (cancelled) return;

        // Step 2: Install packages from requirements.txt if available
        setStatus("installing-packages");

        let requirements: string[] = [];
        try {
          const reqResp = await fetch(`/games/${slug}/requirements.txt`);
          if (reqResp.ok) {
            const reqText = await reqResp.text();
            requirements = reqText
              .split("\n")
              .map((l) => l.trim())
              .filter((l) => l && !l.startsWith("#"));
          }
        } catch {
          // No requirements.txt — that's fine
        }

        if (requirements.length > 0) {
          await pyodide.loadPackage("micropip");
          const micropip = pyodide.globals.get("__import__") as (
            name: string
          ) => { install: (pkgs: string[]) => Promise<void> };
          await pyodide.runPythonAsync(`
import micropip
await micropip.install(${JSON.stringify(requirements)})
          `);
        }

        if (cancelled) return;

        // Step 3: Fetch and run game source
        setStatus("loading-game");

        const entryFile = entry.split("/").pop() || "main.py";
        const sourceResp = await fetch(`/games/${slug}/${entryFile}`);
        if (!sourceResp.ok) {
          throw new Error(`Failed to fetch game source: /games/${slug}/${entryFile}`);
        }
        const source = await sourceResp.text();

        // Write source to Pyodide virtual FS
        pyodide.FS.writeFile(`/home/pyodide/${entryFile}`, source);

        // Set up the JS ↔ Python bridge:
        // - canvas element for rendering
        // - print function that writes to output console
        const canvas = canvasRef.current;
        pyodide.globals.set("_js_canvas", canvas);
        pyodide.globals.set("_js_print", (text: string) => {
          appendOutput(String(text));
        });

        // Bootstrap: expose canvas context and print, then run game
        await pyodide.runPythonAsync(`
import sys
from io import StringIO

# Redirect stdout/stderr to JS output
class JSWriter:
    def __init__(self, js_print):
        self._js_print = js_print
    def write(self, text):
        if text.strip():
            self._js_print(text)
    def flush(self):
        pass

sys.stdout = JSWriter(_js_print)
sys.stderr = JSWriter(_js_print)
`);

        await pyodide.runPythonAsync(`
from js import document
from pyodide.ffi import to_js

# Expose canvas and 2D context to the game
canvas = _js_canvas
if canvas:
    ctx = canvas.getContext("2d")
else:
    ctx = None
    print("Warning: No canvas element available")
`);

        if (cancelled) return;

        setStatus("running");

        // Run the game source — it should define main(canvas, ctx)
        await pyodide.runPythonAsync(source);

        // Try to call main() if it exists
        await pyodide.runPythonAsync(`
try:
    main(canvas, ctx)
except NameError:
    pass  # No main() defined — game runs on import
except Exception as e:
    print(f"Error in main(): {e}")
`);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        setStatus("error");
        console.error("[PyodideRunner]", err);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [slug, entry, appendOutput]);

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const statusMessages: Record<RunnerStatus, string> = {
    "loading-runtime": "Loading Python runtime...",
    "installing-packages": "Installing packages...",
    "loading-game": "Loading game...",
    running: "",
    error: "",
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Loading overlay */}
      {status !== "running" && status !== "error" && (
        <div className="flex items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-brand-500" />
            <p className="text-sm text-neutral-400">
              {statusMessages[status]}
            </p>
          </div>
        </div>
      )}

      {/* Error display */}
      {status === "error" && (
        <div className="rounded-lg border border-red-900 bg-red-950/50 p-6 text-center">
          <h3 className="font-semibold text-red-400">Failed to load Python game</h3>
          <pre className="mt-3 max-h-40 overflow-auto rounded bg-neutral-900 p-3 text-left text-xs text-neutral-500">
            {error}
          </pre>
        </div>
      )}

      {/* Canvas — internal resolution is 800x500, CSS scales it to fill width */}
      <div className={`aspect-[8/5] w-full ${status !== "running" ? "hidden" : ""}`}>
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="h-full w-full rounded-lg border border-neutral-700 bg-neutral-900"
        />
      </div>

      {/* Output console */}
      {output.length > 0 && (
        <div className="rounded-lg border border-neutral-800 bg-neutral-950">
          <div className="border-b border-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-500">
            Output
          </div>
          <pre
            ref={outputRef}
            className="max-h-48 overflow-auto p-3 text-xs text-neutral-400"
          >
            {output.join("\n")}
          </pre>
        </div>
      )}

      {onExit && (
        <button
          onClick={onExit}
          className="self-start rounded bg-neutral-800 px-4 py-2 text-sm text-neutral-300 transition hover:bg-neutral-700"
        >
          Back to Catalog
        </button>
      )}
    </div>
  );
}
