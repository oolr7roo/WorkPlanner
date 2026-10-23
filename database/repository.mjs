import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import pg from "pg";

export class WorkspaceError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}
export function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).filter(key => value[key] !== undefined).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
export function createPool(config) {
  const pool = new pg.Pool({ max: 4, connectionTimeoutMillis: 5000, idleTimeoutMillis: 10000, ...config });
  pool.on("error", error => console.error("Workspace idle connection failed:", error.code ?? error.name));
  return pool;
}
export async function migrate(pool, initial) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(824763190)");
    await client.query(await readFile(new URL("./migrations/001-workspace.sql", import.meta.url), "utf8"));
    await client.query("INSERT INTO workplanner.workspace(id,payload) VALUES(1,$1) ON CONFLICT(id) DO NOTHING", [JSON.stringify(initial)]);
    await client.query("COMMIT");
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
}
export function createRepository(pool) {
  const snapshot = row => ({ revision: Number(row.revision), ...row.payload });
  return {
    async read() {
      const result = await pool.query("SELECT revision,payload FROM workplanner.workspace WHERE id=1");
      if (!result.rows.length) throw new WorkspaceError(503, "NOT_READY", "공통 저장소가 준비되지 않았습니다.");
      return snapshot(result.rows[0]);
    },
    async mutate(command, apply) {
      if (typeof command.requestId !== "string" || !Number.isSafeInteger(command.expectedRevision) || command.expectedRevision < 0 || !/^[a-zA-Z0-9_-]{8,128}$/.test(command.requestId ?? ""))
        throw new WorkspaceError(400, "INVALID_COMMAND", "수정 버전과 고유 요청 ID가 필요합니다.");
      const fingerprint = createHash("sha256").update(canonical(command)).digest("hex");
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const locked = await client.query("SELECT revision,payload FROM workplanner.workspace WHERE id=1 FOR UPDATE");
        const previous = await client.query("SELECT fingerprint,response FROM workplanner.requests WHERE id=$1", [command.requestId]);
        if (previous.rows.length) {
          if (previous.rows[0].fingerprint !== fingerprint) throw new WorkspaceError(409, "REQUEST_REUSED", "동일 요청 ID에 다른 내용이 전달되었습니다.");
          await client.query("COMMIT");
          return previous.rows[0].response;
        }
        const current = snapshot(locked.rows[0]);
        if (current.revision !== command.expectedRevision) throw new WorkspaceError(409, "REVISION_CONFLICT", "다른 변경이 먼저 저장되었습니다. 초안은 유지됩니다. 최신 내용을 확인하고 다시 편집해 주세요.");
        const { items, settings, result } = await apply(structuredClone(current));
        const response = { revision: current.revision + 1, items, settings, result };
        await client.query("UPDATE workplanner.workspace SET payload=$1,revision=$2,updated_at=now() WHERE id=1", [JSON.stringify({ items, settings }), response.revision]);
        await client.query("INSERT INTO workplanner.requests(id,fingerprint,response) VALUES($1,$2,$3)", [command.requestId, fingerprint, JSON.stringify(response)]);
        await client.query("COMMIT");
        return response;
      } catch (error) { await client.query("ROLLBACK"); throw error; }
      finally { client.release(); }
    }
  };
}
