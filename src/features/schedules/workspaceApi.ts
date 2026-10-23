import type { ColorSettings, Schedule } from "./types";
export type WorkspaceSnapshot = { revision: number; items: Schedule[]; settings: ColorSettings; timeZone: string };
export class WorkspaceApiError extends Error {
  constructor(message: string, public code?: string, public ref?: string) { super(message); }
}
export async function workspaceRequest<T>(body?: object): Promise<T> {
  const response = await fetch("/api/workplanner", {
    method: body ? "POST" : "GET", credentials: "same-origin",
    headers: { "X-Workplanner-Client": "web", ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(15000),
  });
  const value = await response.json();
  if (!response.ok) throw new WorkspaceApiError(value.error?.message ?? "공통 저장소 요청에 실패했습니다.", value.error?.code, value.error?.ref);
  return value as T;
}
