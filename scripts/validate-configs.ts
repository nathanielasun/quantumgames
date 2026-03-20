// Validates all games/*/game.config.json files against the expected schema.
// Run: npx tsx scripts/validate-configs.ts

import fs from "node:fs";
import path from "node:path";

const GAMES_DIR = path.resolve(__dirname, "../games");

const VALID_TYPES = ["react", "python", "python-server", "static"] as const;
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

const REQUIRED_FIELDS = [
  "slug",
  "title",
  "description",
  "type",
  "entry",
  "thumbnail",
] as const;

interface ValidationError {
  game: string;
  message: string;
}

function main() {
  const errors: ValidationError[] = [];
  let count = 0;

  if (!fs.existsSync(GAMES_DIR)) {
    console.log("No games/ directory found. Nothing to validate.");
    process.exit(0);
  }

  const dirs = fs.readdirSync(GAMES_DIR, { withFileTypes: true });

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;

    const gameName = dir.name;
    const configPath = path.join(GAMES_DIR, gameName, "game.config.json");

    if (!fs.existsSync(configPath)) {
      errors.push({ game: gameName, message: "Missing game.config.json" });
      continue;
    }

    let config: Record<string, unknown>;
    try {
      config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    } catch {
      errors.push({ game: gameName, message: "Invalid JSON in game.config.json" });
      continue;
    }

    // Required fields
    for (const field of REQUIRED_FIELDS) {
      if (!config[field] || typeof config[field] !== "string") {
        errors.push({
          game: gameName,
          message: `Missing or invalid required field: "${field}"`,
        });
      }
    }

    // Slug format
    const slug = config.slug as string | undefined;
    if (slug) {
      if (!SLUG_RE.test(slug)) {
        errors.push({
          game: gameName,
          message: `Slug "${slug}" must be lowercase alphanumeric with hyphens`,
        });
      }
      if (slug !== gameName) {
        errors.push({
          game: gameName,
          message: `Slug "${slug}" does not match directory name "${gameName}"`,
        });
      }
    }

    // Type
    const type = config.type as string | undefined;
    if (type && !(VALID_TYPES as readonly string[]).includes(type)) {
      errors.push({
        game: gameName,
        message: `Invalid type "${type}". Must be one of: ${VALID_TYPES.join(", ")}`,
      });
    }

    // Entry file exists
    const entry = config.entry as string | undefined;
    if (entry) {
      const entryPath = path.join(GAMES_DIR, gameName, entry);
      if (!fs.existsSync(entryPath)) {
        errors.push({
          game: gameName,
          message: `Entry file not found: ${entry}`,
        });
      }
    }

    // Thumbnail file exists
    const thumbnail = config.thumbnail as string | undefined;
    if (thumbnail) {
      const thumbPath = path.join(GAMES_DIR, gameName, thumbnail);
      if (!fs.existsSync(thumbPath)) {
        errors.push({
          game: gameName,
          message: `Thumbnail file not found: ${thumbnail}`,
        });
      }
    }

    // Optional field type checks
    if (config.tags !== undefined && !Array.isArray(config.tags)) {
      errors.push({ game: gameName, message: `"tags" must be an array` });
    }
    if (config.minPlayers !== undefined && typeof config.minPlayers !== "number") {
      errors.push({ game: gameName, message: `"minPlayers" must be a number` });
    }
    if (config.maxPlayers !== undefined && typeof config.maxPlayers !== "number") {
      errors.push({ game: gameName, message: `"maxPlayers" must be a number` });
    }

    // Static games need buildCommand + buildOutput
    if (type === "static") {
      if (!config.buildCommand) {
        errors.push({
          game: gameName,
          message: `Static games require "buildCommand"`,
        });
      }
    }

    // Python-server games need serverPort
    if (type === "python-server") {
      if (!config.serverPort || typeof config.serverPort !== "number") {
        errors.push({
          game: gameName,
          message: `Python-server games require "serverPort" (number)`,
        });
      }
    }

    count++;
    if (!errors.some((e) => e.game === gameName)) {
      console.log(`  OK: ${gameName}`);
    }
  }

  if (errors.length > 0) {
    console.error("\nValidation errors:");
    for (const err of errors) {
      console.error(`  [${err.game}] ${err.message}`);
    }
    console.error(`\n${errors.length} error(s) found.`);
    process.exit(1);
  }

  console.log(`\nAll ${count} game config(s) valid.`);
}

main();
