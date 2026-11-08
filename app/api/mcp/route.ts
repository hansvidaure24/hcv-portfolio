import { NextRequest } from "next/server";
import { jsonResume, profile, projects, skillEvidence } from "@/app/lib/machineReadable";
import { matchPost, summaryLine } from "@/app/lib/matchup";
import { DEX } from "@/app/data/dex";

/**
 * A small, read-only Model Context Protocol server (Streamable HTTP, no
 * sessions, no auth) so a recruiter's AI assistant can ask about Hans with
 * sources instead of scraping pages. Every answer comes from the site's own
 * data files; match_job runs the same matcher as Type Matchup. Nothing sent
 * here is stored or logged. Runs on the hosting's free tier.
 */
export const runtime = "nodejs";

const SERVER_INFO = { name: "hansvidaure-portfolio", title: "Hans Vidaure's portfolio", version: "1.0.0" };
const PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];
const MAX_BODY_BYTES = 40_000;
const MAX_JOB_POST = 20_000;

// Per-instance, like the contact form: resets on deploy. Generous for a person's assistant, low for a crawler.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 60;
const requestLog = new Map<string, number[]>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (requestLog.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  requestLog.set(ip, recent);
  return recent.length > MAX_REQUESTS;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version",
};

const TOOLS = [
  {
    name: "get_profile",
    title: "Profile",
    description: "Who Hans is, what he's looking for, what he's working on now, and links to his resume, GitHub and LinkedIn.",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "list_projects",
    title: "Projects",
    description: "Published projects with summary, stack, measurable proof points, case-study URL and live/code links.",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "get_skill_evidence",
    title: "Skill evidence",
    description:
      "Proof for one skill, by any common name (\"C#\", \"ASP.NET Core\", \"Playwright\"): whether it was used at work, and links to where. For a skill with no proof on the site, the closest skills that have some.",
    inputSchema: {
      type: "object",
      properties: { skill: { type: "string", description: "A skill or technology name." } },
      required: ["skill"],
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "match_job",
    title: "Match a job post",
    description:
      "Matches the skills a job post asks for against Hans's Skill Dex: super effective (used at Fiserv), effective (shipped in a project) or closest experience (not in the dex), each with proof. Keyword matching, not AI. The post isn't stored.",
    inputSchema: {
      type: "object",
      properties: { job_post: { type: "string", description: "The job post text (requirements are enough)." } },
      required: ["job_post"],
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
];

type JsonRpcRequest = { jsonrpc: "2.0"; id?: string | number | null; method: string; params?: Record<string, unknown> };

class RpcError extends Error {
  constructor(public code: number, message: string) {
    super(message);
  }
}

function toolResult(data: unknown) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }], structuredContent: data };
}

function callTool(name: unknown, args: Record<string, unknown>) {
  switch (name) {
    case "get_profile":
      return toolResult({ ...profile(), resume: jsonResume() });
    case "list_projects":
      return toolResult({ projects: projects() });
    case "get_skill_evidence": {
      if (typeof args.skill !== "string" || !args.skill.trim()) throw new RpcError(-32602, "skill must be a non-empty string");
      return toolResult(skillEvidence(args.skill.slice(0, 100)));
    }
    case "match_job": {
      if (typeof args.job_post !== "string" || !args.job_post.trim()) throw new RpcError(-32602, "job_post must be a non-empty string");
      const m = matchPost(args.job_post.slice(0, MAX_JOB_POST));
      return toolResult({
        summary: summaryLine(m),
        yearsAsked: m.years?.asked ?? null,
        yearsFullTime: m.years?.has ?? null,
        skills: m.rows.map((r) =>
          r.kind === "dex"
            ? { asked: r.term, section: r.section, effect: r.effect, skill: r.entry.name, proof: skillEvidence(r.entry.name) }
            : { asked: r.term, section: r.section, effect: "closest", note: `${r.skill.name} isn't in the Skill Dex`, closest: r.closest.map((e) => e.name) }
        ),
        note: "Only skills the matcher recognizes are listed. Skill Dex: " + DEX.length + " skills.",
      });
    }
    default:
      throw new RpcError(-32602, `Unknown tool: ${String(name)}`);
  }
}

function handle(req: JsonRpcRequest): unknown {
  switch (req.method) {
    case "initialize": {
      const asked = req.params?.protocolVersion;
      const protocolVersion = typeof asked === "string" && PROTOCOL_VERSIONS.includes(asked) ? asked : PROTOCOL_VERSIONS[0];
      return {
        protocolVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions:
          "Read-only facts about Hans Chandler Vidaure, a full-stack software engineer. Prefer citing the evidence URLs the tools return.",
      };
    }
    case "ping":
      return {};
    case "tools/list":
      return { tools: TOOLS };
    case "tools/call":
      return callTool(req.params?.name, (req.params?.arguments as Record<string, unknown>) ?? {});
    default:
      throw new RpcError(-32601, `Method not found: ${req.method}`);
  }
}

function respond(message: unknown): { id: unknown; body: unknown } | null {
  const req = message as JsonRpcRequest;
  if (!req || req.jsonrpc !== "2.0" || typeof req.method !== "string") {
    return { id: null, body: { jsonrpc: "2.0", id: null, error: { code: -32600, message: "Invalid Request" } } };
  }
  // Notifications (no id) get no response.
  if (req.id === undefined || req.id === null) return null;
  try {
    return { id: req.id, body: { jsonrpc: "2.0", id: req.id, result: handle(req) } };
  } catch (err) {
    const code = err instanceof RpcError ? err.code : -32603;
    const message = err instanceof RpcError ? err.message : "Internal error";
    return { id: req.id, body: { jsonrpc: "2.0", id: req.id, error: { code, message } } };
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  if (isRateLimited(ip)) {
    return Response.json({ jsonrpc: "2.0", id: null, error: { code: -32000, message: "Too many requests. Try again in a few minutes." } }, { status: 429, headers: CORS });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return Response.json({ jsonrpc: "2.0", id: null, error: { code: -32600, message: "Request too large" } }, { status: 413, headers: CORS });
  }
  let message: unknown;
  try {
    message = JSON.parse(raw);
  } catch {
    return Response.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }, { status: 400, headers: CORS });
  }

  // Older clients may batch; answer each request, skip notifications.
  if (Array.isArray(message)) {
    const replies = message.slice(0, 20).map(respond).filter((r): r is { id: unknown; body: unknown } => r !== null);
    return replies.length ? Response.json(replies.map((r) => r.body), { headers: CORS }) : new Response(null, { status: 202, headers: CORS });
  }
  const reply = respond(message);
  return reply ? Response.json(reply.body, { headers: CORS }) : new Response(null, { status: 202, headers: CORS });
}

// No server-to-client stream: this server only answers requests.
export function GET() {
  return new Response("This MCP endpoint answers JSON-RPC over POST. See /llms.txt.", { status: 405, headers: { ...CORS, Allow: "POST, OPTIONS" } });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}
