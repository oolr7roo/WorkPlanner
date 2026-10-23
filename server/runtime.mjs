import { mkdir, readFile, writeFile, rename, unlink } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { join } from "node:path";
import { appRoot } from "../runtime-config.mjs";
import { createPool, createRepository, migrate } from "../database/repository.mjs";
import { defaultColorSettings } from "./schedules/policy.mjs";
import { createScheduleService } from "./schedules/service.mjs";
import { createApiMiddleware } from "./http/api.mjs";

export async function createWorkspaceRuntime({ postgresPort, webPort }) {
  const timeZone = process.env.WORKPLANNER_TIME_ZONE ?? "Asia/Seoul";
  new Intl.DateTimeFormat("en", { timeZone }).format();
  process.env.TZ = timeZone;
  const directory = process.env.WORKPLANNER_RUNTIME_DIR ?? join(appRoot, ".runtime");
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const initial = { items: [], settings: defaultColorSettings() };
  let pool;
  try {
    if (process.env.WORKPLANNER_DATABASE_URL) {
      pool = createPool({ connectionString: process.env.WORKPLANNER_DATABASE_URL });
      await migrate(pool, initial);
    } else {
      const suffix = process.platform === "win32" ? "" : "-macos";
      const password = (await readFile(process.env.WORKPLANNER_ADMIN_PASSWORD_FILE ?? join(appRoot, "postgresql", `admin-password${suffix}.txt`), "utf8")).trim();
      const admin = createPool({ host: "127.0.0.1", port: postgresPort, database: "calendarapp", user: "postgres", password });
      let appPassword;
      try {
        await migrate(admin, initial);
        const passwordPath = join(directory, "app-db-password");
        try { appPassword = (await readFile(passwordPath, "utf8")).trim(); }
        catch (error) {
          if (error.code !== "ENOENT") throw error;
          appPassword = randomBytes(32).toString("base64url");
          await writeFile(passwordPath, appPassword, { mode: 0o600, flag: "wx" });
        }
        if (!/^[A-Za-z0-9_-]{40,64}$/.test(appPassword)) throw new Error("Invalid app credential file");
        const role = await admin.query("SELECT rolsuper,rolcreatedb,rolcreaterole,rolcanlogin FROM pg_roles WHERE rolname='workplanner_app'");
        if (role.rows.length && (role.rows[0].rolsuper || role.rows[0].rolcreatedb || role.rows[0].rolcreaterole || !role.rows[0].rolcanlogin)) throw new Error("Existing workplanner_app role has unexpected privileges");
        if (!role.rows.length) await admin.query(`CREATE ROLE workplanner_app LOGIN PASSWORD '${appPassword}'`);
        await admin.query("GRANT USAGE ON SCHEMA workplanner TO workplanner_app");
        await admin.query("GRANT SELECT,INSERT,UPDATE ON workplanner.workspace,workplanner.requests TO workplanner_app");
      } finally { await admin.end(); }
      pool = createPool({ host: "127.0.0.1", port: postgresPort, database: "calendarapp", user: "workplanner_app", password: appPassword });
    }
    await pool.query("SELECT revision FROM workplanner.workspace WHERE id=1");
    const token = randomBytes(32).toString("base64url");
    const connectionPath = join(directory, "mcp-connection.json");
    const service = createScheduleService(createRepository(pool), timeZone);
    let published = false;
    return {
      service,
      middleware: createApiMiddleware(service, { token, webPort }),
      async publish() {
        const temp = `${connectionPath}.${process.pid}.tmp`;
        await writeFile(temp, JSON.stringify({ url: `http://127.0.0.1:${webPort}/api/workplanner`, token, timeZone }), { mode: 0o600 });
        await rename(temp, connectionPath); published = true;
      },
      async close() {
        if (published) {
          try { const current = JSON.parse(await readFile(connectionPath, "utf8")); if (current.token === token) await unlink(connectionPath); }
          catch (error) { if (error.code !== "ENOENT") console.error("MCP connection cleanup failed:", error.code ?? error.name); }
        }
        await pool.end();
      }
    };
  } catch (error) { await pool?.end(); throw error; }
}
