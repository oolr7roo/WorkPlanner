import { timingSafeEqual } from "node:crypto";
import { WorkspaceError } from "../../database/repository.mjs";

export function createApiMiddleware(service, { token, webPort }) {
  const hosts = new Set([`127.0.0.1:${webPort}`, `localhost:${webPort}`, `[::1]:${webPort}`]);
  const sameToken = header => {
    const candidate = Buffer.from(header?.startsWith("Bearer ") ? header.slice(7) : "");
    const expected = Buffer.from(token);
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  };
  return async (req, res, next) => {
    if (!(req.url ?? "").split("?")[0].startsWith("/api/workplanner")) return next();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    const send = (status, body) => { res.statusCode = status; res.end(JSON.stringify(body)); };
    try {
      const host = req.headers.host ?? "";
      if (!hosts.has(host)) throw new WorkspaceError(403, "LOCAL_ONLY", "공통 일정 API는 로컬 주소에서만 사용할 수 있습니다.");
      const origin = req.headers.origin;
      if (origin && origin !== `http://${host}`) throw new WorkspaceError(403, "ORIGIN_DENIED", "다른 origin의 요청을 허용하지 않습니다.");
      const bearer = sameToken(req.headers.authorization);
      const browser = req.headers["x-workplanner-client"] === "web"
        && (!req.headers["sec-fetch-site"] || req.headers["sec-fetch-site"] === "same-origin")
        && (req.method === "GET" || origin === `http://${host}`);
      if (!bearer && !browser) throw new WorkspaceError(401, "UNAUTHORIZED", "로컬 MCP 연결 또는 동일 화면에서 요청해 주세요.");
      if ((req.url ?? "").split("?")[0] !== "/api/workplanner") throw new WorkspaceError(404, "NOT_FOUND", "API 경로를 확인해 주세요.");
      if (req.method === "GET") return send(200, await service.read());
      if (req.method !== "POST") throw new WorkspaceError(405, "METHOD", "GET/POST만 지원합니다.");
      if (!/^application\/json(?:;|$)/i.test(String(req.headers["content-type"] ?? ""))) throw new WorkspaceError(415, "CONTENT_TYPE", "JSON 요청이 필요합니다.");
      let size = 0; const chunks = [];
      for await (const chunk of req.iterator({ destroyOnReturn: false })) {
        size += chunk.length;
        if (size > 2 * 1024 * 1024) { res.setHeader("Connection", "close"); req.resume(); throw new WorkspaceError(413, "TOO_LARGE", "요청은 2MiB 이하여야 합니다."); }
        chunks.push(chunk);
      }
      let command;
      try { command = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
      catch { throw new WorkspaceError(400, "INVALID_JSON", "JSON 형식을 확인해 주세요."); }
      if (!command || typeof command !== "object" || Array.isArray(command) || typeof command.operation !== "string"
        || !command.args || typeof command.args !== "object" || Array.isArray(command.args)) throw new WorkspaceError(400, "INVALID_COMMAND", "operation과 args 객체가 필요합니다.");
      const query = ["context", "list", "get", "previewImport"].includes(command.operation);
      return send(200, query ? await service.query(command.operation, command.args) : await service.command(command));
    } catch (error) {
      if (!(error instanceof WorkspaceError)) console.error("Workspace request failed:", error.code ?? error.name);
      send(error.status ?? 503, { error: { code: error.code ?? "UNAVAILABLE", message: error instanceof WorkspaceError ? error.message : "공통 저장소에 연결할 수 없습니다. 서버 상태를 확인해 주세요." } });
    }
  };
}
