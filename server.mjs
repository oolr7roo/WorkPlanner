import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, lstatSync, unlinkSync, chmodSync } from "node:fs";
import net from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { appRoot, loadConfig } from "./runtime-config.mjs";
import { startPostgres, stopPostgres } from "./postgresql/manage.mjs";

const id = createHash("sha256").update(appRoot.toLowerCase()).digest("hex").slice(0, 16);
const endpoint = process.platform === "win32"
  ? `\\\\.\\pipe\\calendarapp-${id}`
  : join(tmpdir(), `calendarapp-${id}.sock`);

function openBrowser(url) {
  const onWindows = process.platform === "win32";
  const command = onWindows ? "powershell.exe" : "/usr/bin/open";
  const args = onWindows
    ? ["-NoProfile", "-Command", `Start-Process -FilePath '${url}' -ErrorAction Stop`]
    : [url];
  const result = spawnSync(command, args, { windowsHide: true, timeout: 10000 });
  if (result.error || result.status !== 0) {
    throw new Error(`Could not open the browser: ${result.error?.message ?? result.status}`);
  }
}

function sendControl(command, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection(endpoint);
    let response = "";
    socket.setTimeout(timeoutMs);
    socket.on("connect", () => socket.write(`${command}\n`));
    socket.on("data", (chunk) => { response += chunk.toString(); });
    socket.on("end", () => resolve(response.trim()));
    socket.on("timeout", () => socket.destroy(new Error("Supervisor did not respond.")));
    socket.on("error", reject);
  });
}

async function isSupervisorRunning() {
  try {
    return (await sendControl("ping", 3000)) === "running";
  } catch (error) {
    if (["ENOENT", "ECONNREFUSED", "EPIPE"].includes(error.code)) return false;
    throw error;
  }
}

async function listenControl(onStop) {
  if (process.platform !== "win32" && existsSync(endpoint)) {
    if (await isSupervisorRunning()) throw new Error("CalendarApp is already running.");
    if (!lstatSync(endpoint).isSocket()) throw new Error(`Control path is not a socket: ${endpoint}`);
    unlinkSync(endpoint);
  }

  const server = net.createServer((socket) => {
    let request = "";
    socket.on("error", (error) => {
      if (!["EPIPE", "ECONNRESET"].includes(error.code)) console.error(error);
    });
    socket.on("data", (chunk) => {
      request += chunk.toString();
      if (!request.includes("\n")) return;
      socket.removeAllListeners("data");
      if (request.trim() === "ping") {
        socket.end("running\n");
      } else if (request.trim() === "stop") {
        void onStop().then(
          () => socket.end("stopped\n"),
          (error) => socket.end(`error: ${error.message}\n`),
        );
      } else {
        socket.end("unknown command\n");
      }
    });
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(endpoint, resolve);
  });
  if (process.platform !== "win32") chmodSync(endpoint, 0o600);
  return server;
}

async function main() {
  const command = process.argv[2] ?? "start";
  if (command === "stop") {
    if (!(await isSupervisorRunning())) {
      stopPostgres();
      console.log("CalendarApp and PostgreSQL are stopped.");
      return;
    }
    const response = await sendControl("stop", 40000);
    if (response !== "stopped") throw new Error(response);
    console.log("CalendarApp and PostgreSQL stopped.");
    return;
  }
  if (command === "status") {
    const running = await isSupervisorRunning();
    console.log(running ? "CalendarApp is running." : "CalendarApp is stopped.");
    if (!running) process.exitCode = 1;
    return;
  }
  if (command === "wait") {
    const openWhenReady = process.argv[3] === "--open";
    for (let attempt = 0; attempt < 120; attempt++) {
      if (await isSupervisorRunning()) {
        const { webPort, postgresPort } = loadConfig();
        const url = `http://127.0.0.1:${webPort}/`;
        if (openWhenReady) openBrowser(url);
        console.log(`CalendarApp: ${url} (PostgreSQL: ${postgresPort})`);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    throw new Error("CalendarApp did not start. Check postgresql/supervisor.log.");
  }
  if (command !== "start") throw new Error(`Unknown command: ${command}`);

  if (await isSupervisorRunning()) throw new Error("CalendarApp is already running.");
  const { webPort, postgresPort } = loadConfig();
  let vite;
  let control;
  let postgresStarted = false;
  let shuttingDown;

  function shutdown() {
    if (shuttingDown) return shuttingDown;
    shuttingDown = (async () => {
      const errors = [];
      try { await vite?.close(); } catch (error) { errors.push(error); }
      if (postgresStarted) {
        try { stopPostgres(); } catch (error) { errors.push(error); }
      }
      if (control) {
        control.close(() => {
          if (process.platform !== "win32" && existsSync(endpoint)) unlinkSync(endpoint);
        });
      }
      if (errors.length) throw new AggregateError(errors, "Shutdown failed.");
    })();
    return shuttingDown;
  }

  for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
    process.on(signal, () => {
      void shutdown().catch((error) => {
        console.error(error);
        process.exitCode = 1;
      });
    });
  }
  process.on("uncaughtException", (error) => {
    console.error(error);
    process.exitCode = 1;
    void shutdown().catch(console.error);
  });
  process.on("unhandledRejection", (error) => {
    console.error(error);
    process.exitCode = 1;
    void shutdown().catch(console.error);
  });

  try {
    startPostgres(postgresPort);
    postgresStarted = true;
    const { createServer } = await import("vite");
    vite = await createServer({ server: { host: "127.0.0.1", port: webPort, strictPort: true } });
    await vite.listen();
    control = await listenControl(shutdown);
    console.log(`CalendarApp ready: http://127.0.0.1:${webPort}/`);
  } catch (error) {
    await shutdown();
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
