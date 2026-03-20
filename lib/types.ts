export type GameType = "react" | "python" | "python-server" | "static";

export interface GameConfig {
  slug: string;
  title: string;
  description: string;
  type: GameType;
  entry: string;
  thumbnail: string;
  tags?: string[];
  minPlayers?: number;
  maxPlayers?: number;
  version?: string;
  buildCommand?: string;
  buildOutput?: string;
  pythonVersion?: string;
  serverPort?: number;
  serverUrl?: string;
}

export interface GameEntry extends GameConfig {
  tags: string[];
  minPlayers: number;
  maxPlayers: number;
  version: string;
}
