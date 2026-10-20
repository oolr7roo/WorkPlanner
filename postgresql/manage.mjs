import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const onWindows = process.platform === "win32";
const data = join(root, onWindows ? "data" : "data-macos");
const passwordFile = join(root, onWindows ? "admin-password.txt" : "admin-password-macos.txt");
const logFile = join(root, onWindows ? "postgres.log" : "postgres-macos.log");

function macBinary(name) {
  const candidates = [
    process.env.PG_BIN,
    "/opt/homebrew/opt/postgresql@17/bin",
    "/usr/local/opt/postgresql@17/bin",
    "/opt/homebrew/opt/postgresql/bin",
    "/usr/local/opt/postgresql/bin",
    "/Applications/Postgres.app/Contents/Versions/latest/bin",
  ].filter(Boolean);
  for (const directory of candidates) {
    const file = join(directory, name);
    if (existsSync(file)) return file;
  }
  return name;
}

function binary(name) {
  return onWindows ? join(root, "runtime", "bin", `${name}.exe`) : macBinary(name);
}

function checkBinaries() {
  if (onWindows) return;
  for (const name of ["pg_ctl", "initdb", "psql", "createdb"]) {
    const result = spawnSync(binary(name), ["--version"], { encoding: "utf8", timeout: 5000 });
    if (result.error || result.status !== 0) {
      throw new Error(`PostgreSQL ${name}을(를) 실행할 수 없습니다. PostgreSQL 17을 설치하거나 PG_BIN에 bin 디렉터리를 지정하세요.`);
    }
  }
}

function run(name, args, options = {}) {
  const command = binary(name);
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
    timeout: 30000,
    stdio: name === "pg_ctl" ? "inherit" : "pipe",
    ...options,
  });
  if (result.error) throw new Error(`${name}: ${result.error.message}`);
  if (result.status !== 0) {
    throw new Error(`${name}: ${(result.stderr || result.stdout || `exit ${result.status}`).trim()}`);
  }
  return (result.stdout ?? "").trim();
}

function isRunning() {
  const result = spawnSync(binary("pg_ctl"), ["-D", data, "status"], {
    encoding: "utf8",
    windowsHide: true,
    timeout: 5000,
  });
  if (result.error) throw new Error(`pg_ctl: ${result.error.message}`);
  return result.status === 0;
}

function initializeMac() {
  if (onWindows || existsSync(join(data, "PG_VERSION"))) return;
  if (existsSync(data)) {
    throw new Error(`${data}에 완료되지 않은 PostgreSQL 초기화 데이터가 있습니다. 내용을 확인한 뒤 복구하거나 별도로 보관하고 다시 시작하세요.`);
  }
  if (!existsSync(passwordFile)) {
    const password = randomBytes(32).toString("base64url");
    writeFileSync(passwordFile, `${password}\n`, { mode: 0o600, flag: "wx" });
  }
  run("initdb", [
    "-D", data, "-U", "postgres", `--pwfile=${passwordFile}`,
    "--auth-host=scram-sha-256", "--auth-local=scram-sha-256",
    "--encoding=UTF8", "--locale=C", "--no-instructions",
  ]);
}

export function startPostgres(port) {
  checkBinaries();
  if (isRunning()) {
    throw new Error("PostgreSQL is already running outside this supervisor. Stop it first.");
  }
  initializeMac();
  try {
    run("pg_ctl", ["-D", data, "-l", logFile, "-o", `-h 127.0.0.1 -p ${port}`, "-w", "start"]);
    const env = { ...process.env, PGPASSWORD: readFileSync(passwordFile, "utf8").trim() };
    const found = run("psql", [
      "-h", "127.0.0.1", "-p", String(port), "-U", "postgres", "-d", "postgres",
      "-tAc", "SELECT 1 FROM pg_database WHERE datname = 'calendarapp'",
    ], { env });
    if (found !== "1") {
      run("createdb", ["-h", "127.0.0.1", "-p", String(port), "-U", "postgres", "calendarapp"], { env });
    }
  } catch (error) {
    if (isRunning()) stopPostgres();
    throw error;
  }
}

export function stopPostgres() {
  if (!isRunning()) return;
  run("pg_ctl", ["-D", data, "-m", "fast", "-w", "stop"]);
}
