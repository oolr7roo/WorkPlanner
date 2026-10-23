import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const defaultFile = fileURLToPath(new URL("../.runtime/mcp-connection.json", import.meta.url));
export async function callWorkspace(operation, args = {}, metadata = {}) {
  let connection;
  try { connection = JSON.parse(await readFile(process.env.WORKPLANNER_CONNECTION_FILE ?? defaultFile, "utf8")); }
  catch { throw new Error("WorkPlanner 서버를 먼저 시작해 주세요. 로컬 MCP 연결 파일이 없습니다."); }
  const url = new URL(connection.url);
  if (url.protocol !== "http:" || !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) || url.pathname !== "/api/workplanner") throw new Error("MCP 연결 주소는 로컬 WorkPlanner API여야 합니다.");
  let response;
  try {
    response = await fetch(url, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${connection.token}` },
      body: JSON.stringify({ operation, args, ...metadata }), signal: AbortSignal.timeout(15000), redirect: "error" });
  } catch { throw new Error("WorkPlanner 서버에 연결할 수 없습니다. 재시도할 때 같은 requestId와 본문을 사용하세요."); }
  const body = await response.json();
  if (!response.ok) { const error = new Error(body.error?.message ?? "일정 요청이 실패했습니다."); error.code = body.error?.code; throw error; }
  return body;
}
