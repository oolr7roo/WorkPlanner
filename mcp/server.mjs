import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { callWorkspace } from "./client.mjs";

const server = new McpServer({ name: "workplanner", version: "1.1.0" });
const write = { expectedRevision: z.number().int().nonnegative().describe("Latest revision from context/list/get. A conflict requires a fresh read."),
  requestId: z.string().min(8).max(128).regex(/^[A-Za-z0-9_-]+$/).describe("Unique operation ID; reuse with identical arguments on retry, preferably UUID.") };
const checklist = z.array(z.object({ id: z.string(), text: z.string(), done: z.boolean() }));
const fields = { allDay: z.boolean().optional(), title: z.string().max(500), start: z.string().optional(), end: z.string().optional(),
  kind: z.enum(["plan", "task"]).optional().describe("Defaults to plan. Set task for work that should appear on calendars/Gantt."),
  colorMode: z.enum(["auto", "manual"]).optional(), color: z.string().optional(), checklist: checklist.optional() };
function register(name, description, inputSchema, operation, map, readOnly = false) {
  server.registerTool(name, { description, inputSchema, annotations: { readOnlyHint: readOnly, destructiveHint: !readOnly, idempotentHint: true, openWorldHint: false } }, async input => {
    try {
      const { expectedRevision, requestId, ...args } = input;
      const output = await callWorkspace(operation, map ? map(args) : args, readOnly ? {} : { expectedRevision, requestId });
      return { content: [{ type: "text", text: JSON.stringify(output) }], structuredContent: output };
    } catch (error) {
      const output = { error: { code: error.code ?? "CONNECTION_ERROR", message: error.message } };
      return { isError: true, content: [{ type: "text", text: JSON.stringify(output) }], structuredContent: output };
    }
  });
}
register("workspace_context", "Read this first: current revision, time zone, current time, default plan kind, active colors and write/retry rules. Plans are hidden on calendars; tasks are displayed.", {}, "context", null, true);
register("list_schedules", "Search schedules, including plans by default. Dates filter resolved parent periods. Results include displayed colors; use get_schedule for stored values. Paginate with offset/limit.", {
  query: z.string().optional(), kind: z.enum(["all", "plan", "task"]).optional(), parentId: z.string().nullable().optional(), start: z.string().optional(), end: z.string().optional(), offset: z.number().int().nonnegative().optional(), limit: z.number().int().min(1).max(500).optional()
}, "list", null, true);
register("get_schedule", "Get one schedule, stored values, ancestry and direct children with the current revision.", { id: z.string() }, "get", null, true);
register("propose_schedule_tree", "Submit 1-500 NEW schedules as a pending draft, without registering them. User must open AI registration preview in WorkPlanner to edit/select/register. Each node has a unique ref; parents precede children. Use parentRef for a new parent or parentId for an existing parent. Roots require start/end. kind defaults to plan; task is shown on calendars/Gantt. Returns proposal ID/status; do not report pending as registered.", {
  ...write, nodes: z.array(z.object({ ref: z.string(), parentRef: z.string().optional(), parentId: z.string().nullable().optional(), ...fields })).min(1).max(500)
}, "proposeTree");
register("get_schedule_proposal", "Read an AI draft by ID and its pending/applied/discarded status. Only applied means registered; result.created maps submitted refs to schedule IDs. The user confirms in the web app.", { id: z.string() }, "getProposal", null, true);
register("update_schedule", "Update only supplied fields; unchanged fields are preserved. Parent periods are calculated from descendants. A checklist replaces that schedule's checklist; an empty array clears it. Set colorMode:auto to follow the configured palette.", {
  ...write, id: z.string(), patch: z.object({ ...fields, title: z.string().max(500).optional() }).strict()
}, "update");
register("move_schedule", "Move under parentId (null for top level), optionally before a sibling ID. Descendants are preserved and cycles rejected. Read current revision first.", {
  ...write, id: z.string(), parentId: z.string().nullable(), beforeId: z.string().nullable().optional()
}, "move");
register("delete_schedule", "Delete exactly one schedule by ID. Its direct children are promoted to its parent, preserving descendants. Specify the ID only after identifying the intended schedule.", { ...write, id: z.string() }, "delete");
register("set_color_settings", "Replace shared color settings: version:1, activePresetId, presets:[{id,name,colors:[#RRGGBB]}]. Affects auto schedules; manual colors are preserved. Read workspace_context first.", { ...write, settings: z.object({ version: z.literal(1), activePresetId: z.string(), presets: z.array(z.object({ id: z.string(), name: z.string(), colors: z.array(z.string()) })) }) }, "settings");
server.registerResource("workspace-context", "workplanner://context", { mimeType: "application/json", description: "Current local calendar rules and revision" }, async uri => ({ contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(await callWorkspace("context")) }] }));
await server.connect(new StdioServerTransport());
