import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const appRoot = dirname(fileURLToPath(import.meta.url));

export function loadConfig() {
  const values = new Map();
  const source = readFileSync(join(appRoot, ".config"), "utf8");

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = /^(WEB_PORT|POSTGRES_PORT)=(\d+)$/.exec(line);
    if (!match || values.has(match[1])) {
      throw new Error(`Invalid .config entry: ${line}`);
    }
    values.set(match[1], Number(match[2]));
  }

  const webPort = values.get("WEB_PORT");
  const postgresPort = values.get("POSTGRES_PORT");
  for (const port of [webPort, postgresPort]) {
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error("WEB_PORT and POSTGRES_PORT must be between 1 and 65535.");
    }
  }
  if (webPort === postgresPort) {
    throw new Error("WEB_PORT and POSTGRES_PORT must differ.");
  }

  return { webPort, postgresPort };
}
