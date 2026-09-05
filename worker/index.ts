import { oauthAuthorizationHandoff, oauthRequestBody } from "./oauth-handoff";
import { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "agents/mcp/server";
import { z } from "zod";
import { EMBEDDED_SITE } from "./embedded-site";
import { embeddedSiteResponse } from "./site-response";

const PRODUCT = "seo_researcher";
const API_PREFIX = "/v1/research";
const MAX_EVENT_BODY_BYTES = 16_384;
const MAX_OAUTH_BODY_BYTES = 65_536;
const connectionSchema = z.object({
  connected: z.literal(true),
  product: z.literal(PRODUCT),
  organization_id: z.string().min(1),
  default_client_id: z.string().nullable(),
  metering_model: z.string(),
  scopes: z.array(z.enum(["seo_research:read", "seo_research:run"])),
});

const telemetryEvents = new Set([
  "landing_page_viewed",
  "pricing_viewed",
  "trial_cta_clicked",
  "example_prompt_copied",
  "integration_docs_clicked",
]);

type JsonRecord = Record<string, unknown>;

class UpstreamError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly payload: unknown,
    readonly retryAfter?: string,
  ) {
    super(message);
  }
}

function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  return new Response(JSON.stringify(data), { ...init, headers });
}


function corsHeaders(request: Request): Headers {
  const headers = new Headers({
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": request.headers.get("access-control-request-headers") || "Authorization, Content-Type, Accept, Idempotency-Key, MCP-Protocol-Version",
    "access-control-expose-headers": "WWW-Authenticate, X-Request-Id, MCP-Session-Id",
    "access-control-max-age": "86400",
  });
  return headers;
}

function withCors(response: Response, request: Request): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of corsHeaders(request)) headers.set(key, value);
  headers.set("cross-origin-resource-policy", "cross-origin");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function bearerToken(request: Request): string | null {
  const value = request.headers.get("authorization");
  return value?.startsWith("Bearer ") ? value.slice(7).trim() || null : null;
}

async function sha256Prefix(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((part) => part.toString(16).padStart(2, "0")).join("").slice(0, 24);
}

function requestId(request: Request): string {
  return request.headers.get("cf-ray") || request.headers.get("x-request-id") || crypto.randomUUID();
}

function analyticsDimension(value: unknown, maxLength = 160): string {
  return String(value ?? "").replace(/[\r\n\t]+/g, " ").trim().slice(0, maxLength);
}

function referrerClass(request: Request, explicitReferrer: unknown): string {
  const raw = analyticsDimension(explicitReferrer || request.headers.get("referer"), 2_048);
  if (!raw) return "direct";
  try {
    const current = new URL(request.url);
    const referrer = new URL(raw);
    return referrer.hostname === current.hostname ? "self" : analyticsDimension(referrer.hostname, 255);
  } catch {
    return "unknown";
  }
}

function analyticsPoint(env: Env, event: string, input: {
  request: Request;
  requestId: string;
  status?: number;
  success?: boolean;
  latencyMs?: number;
  identityHash?: string;
  operation?: string;
  jobId?: string;
  errorCode?: string;
  sessionId?: string;
  attribution?: JsonRecord;
}): void {
  const url = new URL(input.request.url);
  const attribution = input.attribution || {};
  const dataset = (env as Env & { SEO_ANALYTICS?: AnalyticsEngineDataset }).SEO_ANALYTICS;
  if (!dataset) {
    logEvent("edge_analytics_fallback", {
      analytics_event: event,
      request_id: input.requestId,
      host: url.hostname,
      path: url.pathname,
      status: input.status || 0,
      success: input.success === undefined ? null : input.success,
      latency_ms: input.latencyMs || 0,
      operation: input.operation || "",
      identity_hash: input.identityHash || "anonymous",
    });
    return;
  }
  dataset.writeDataPoint({
    indexes: [input.identityHash || "anonymous"],
    blobs: [
      event,
      PRODUCT,
      env.ENVIRONMENT,
      input.requestId,
      url.hostname,
      url.pathname,
      input.request.method,
      input.operation || "",
      input.identityHash || "anonymous",
      input.jobId || "",
      input.errorCode || "",
      input.sessionId || "",
      String(attribution.utm_source || ""),
      String(attribution.utm_medium || ""),
      String(attribution.utm_campaign || ""),
      String(attribution.utm_content || ""),
      String(attribution.utm_term || ""),
      referrerClass(input.request, attribution.referrer),
      analyticsDimension(input.request.headers.get("user-agent"), 255),
    ],
    doubles: [
      input.status || 0,
      input.success === undefined ? -1 : input.success ? 1 : 0,
      input.latencyMs || 0,
      Date.now(),
    ],
  });
}

function logEvent(event: string, data: JsonRecord): void {
  console.log(JSON.stringify({ event, product: PRODUCT, ...data }));
}

async function readBoundedJson(request: Request, maxBytes: number): Promise<JsonRecord> {
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > maxBytes) throw new UpstreamError("Request body is too large.", 413, "payload_too_large", null);
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) throw new UpstreamError("Request body is too large.", 413, "payload_too_large", null);
  try {
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("object required");
    return parsed as JsonRecord;
  } catch {
    throw new UpstreamError("Request body must be a JSON object.", 400, "invalid_json", null);
  }
}

function upstreamHeaders(request: Request, id: string): Headers {
  const headers = new Headers({
    accept: "application/json",
    "content-type": "application/json",
    "user-agent": "seo-researcher-edge/0.1.0",
    "x-request-id": id,
    "x-seo-researcher-product": PRODUCT,
  });
  const authorization = request.headers.get("authorization");
  const idempotency = request.headers.get("idempotency-key");
  if (authorization) headers.set("authorization", authorization);
  if (idempotency) headers.set("idempotency-key", idempotency);
  return headers;
}

async function callAgentApi(
  env: Env,
  request: Request,
  path: string,
  init: { method?: string; body?: unknown; idempotencyKey?: string } = {},
): Promise<unknown> {
  const id = requestId(request);
  const headers = upstreamHeaders(request, id);
  if (init.idempotencyKey) headers.set("idempotency-key", init.idempotencyKey);
  const response = await fetch(`${env.RANKABILITY_AGENT_API_ORIGIN}${path}`, {
    method: init.method || "GET",
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: AbortSignal.timeout(30_000),
  });
  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try { payload = JSON.parse(text); } catch { payload = { message: text.slice(0, 1_000) }; }
  }
  if (!response.ok) {
    const body = payload && typeof payload === "object" ? payload as JsonRecord : {};
    const nested = body.error && typeof body.error === "object" ? body.error as JsonRecord : {};
    throw new UpstreamError(
      String(nested.message || body.message || `Research service returned ${response.status}.`),
      response.status,
      String(nested.code || body.code || "upstream_error"),
      payload,
      response.headers.get("retry-after") || undefined,
    );
  }
  return payload;
}

function toolResult(payload: unknown) {
  return {
    structuredContent: payload && typeof payload === "object" ? payload as JsonRecord : { result: payload },
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
  };
}

function toolError(error: unknown) {
  const known = error instanceof UpstreamError;
  const upstream = known && error.payload && typeof error.payload === "object" ? error.payload as JsonRecord : {};
  const upstreamError = upstream.error && typeof upstream.error === "object" ? upstream.error as JsonRecord : {};
  const details = upstreamError.details && typeof upstreamError.details === "object" ? upstreamError.details as JsonRecord : {};
  const pollSeconds = details.recommended_poll_seconds;
  const payload = {
    error: {
      code: known ? error.code : "internal_error",
      message: known ? error.message : "SEO research request failed.",
      retryable: known ? error.status >= 500 || error.status === 429 || error.code === "not_ready" : true,
      ...(known && error.retryAfter ? { retry_after: error.retryAfter } : {}),
      ...(typeof pollSeconds === "number" && Number.isFinite(pollSeconds) && pollSeconds > 0 ? { recommended_poll_seconds: pollSeconds } : {}),
    },
  };
  return { isError: true, ...toolResult(payload) };
}

function createSeoResearchServer(env: Env, request: Request, connection: unknown) {
  const server = new McpServer({ name: "SEO Researcher", version: "1.1.0" });

  server.registerTool(
    "seo_research_connection",
    {
      description: "Check the connected SEO Researcher organization, default workspace, granted research permissions, and metering model. Does not start research or create a workspace. This verifies access, not research completion or available usage.",
      inputSchema: {},
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async () => toolResult(connection),
  );

  server.registerTool(
    "seo_research_start",
    {
      description: "Start evidence-backed SEO research before writing. Returns a job ID to poll.",
      inputSchema: {
        topic: z.string().min(1).max(500).describe("Target search topic or query."),
        client_id: z.uuid().optional().describe("Optional Rankability client workspace UUID. The account default is used when omitted."),
        country: z.string().min(2).max(80).optional(),
        language: z.string().min(2).max(10).default("en"),
        location: z.string().min(1).max(255).optional(),
        brand_domain: z.string().max(255).optional(),
        target_url: z.url().optional(),
        depth: z.enum(["standard", "deep"]).default("standard"),
        idempotency_key: z.string().trim().min(1).max(180).optional(),
      },
    },
    async (input) => {
      try {
        return toolResult(await callAgentApi(env, request, "/seo-research/jobs", {
          method: "POST",
          body: input,
          idempotencyKey: input.idempotency_key,
        }));
      } catch (error) { return toolError(error); }
    },
  );

  server.registerTool(
    "seo_research_status",
    {
      description: "Check a research job's current stage, progress, quality state, and next polling interval.",
      inputSchema: { job_id: z.uuid() },
    },
    async ({ job_id }) => {
      try { return toolResult(await callAgentApi(env, request, `/seo-research/jobs/${encodeURIComponent(job_id)}`)); }
      catch (error) { return toolError(error); }
    },
  );

  server.registerTool(
    "seo_research_get",
    {
      description: "Get a completed SEO research packet with competitors, topics, entities, questions, AI citations, gaps, recommendations, and evidence URLs.",
      inputSchema: {
        job_id: z.uuid(),
        view: z.enum(["summary", "full", "evidence"]).default("full"),
      },
    },
    async ({ job_id, view }) => {
      try { return toolResult(await callAgentApi(env, request, `/seo-research/jobs/${encodeURIComponent(job_id)}/result?view=${view}`)); }
      catch (error) { return toolError(error); }
    },
  );

  server.registerTool(
    "seo_research_list",
    {
      description: "List recent SEO research jobs for the connected account.",
      inputSchema: {
        limit: z.number().int().min(1).max(100).default(20),
        cursor: z.string().max(500).optional(),
      },
    },
    async ({ limit, cursor }) => {
      try {
        const query = new URLSearchParams({ limit: String(limit) });
        if (cursor) query.set("cursor", cursor);
        const payload = await callAgentApi(env, request, `/seo-research/jobs?${query}`);
        if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
          throw new UpstreamError("The research service returned an invalid job list.", 502, "invalid_upstream_response", null);
        }
        // Keep account identity visible even for existing clients whose tool
        // catalog predates seo_research_connection, including an empty history.
        return toolResult({ ...payload, connection });
      } catch (error) { return toolError(error); }
    },
  );

  return server;
}

function publicMcpUrl(env: Env): string { return `${env.MCP_ORIGIN}/mcp`; }

function protectedResourceMetadata(env: Env): Response {
  return json({
    resource: publicMcpUrl(env),
    authorization_servers: [env.MCP_ORIGIN],
    bearer_methods_supported: ["header"],
    scopes_supported: ["seo_research:run", "seo_research:read"],
  }, { headers: { "access-control-allow-origin": "*" } });
}

function authorizationServerMetadata(env: Env): Response {
  return json({
    issuer: env.MCP_ORIGIN,
    authorization_endpoint: `${env.MCP_ORIGIN}/oauth/authorize`,
    token_endpoint: `${env.MCP_ORIGIN}/oauth/token`,
    registration_endpoint: `${env.MCP_ORIGIN}/oauth/register`,
    scopes_supported: ["seo_research:run", "seo_research:read"],
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none", "client_secret_post"],
    authorization_response_iss_parameter_supported: true,
  }, { headers: { "access-control-allow-origin": "*" } });
}

function rewriteLocation(value: string, env: Env): string {
  if (!value.startsWith(env.RANKABILITY_APP_ORIGIN)) return value;
  const url = new URL(value);
  if (url.pathname.startsWith("/oauth/") || url.pathname.startsWith("/.well-known/") || url.pathname === "/mcp") {
    return `${env.MCP_ORIGIN}${url.pathname}${url.search}${url.hash}`;
  }
  return value;
}

async function proxyOAuth(request: Request, env: Env): Promise<Response> {
  const incoming = new URL(request.url);
  if (incoming.pathname === "/oauth/authorize" && request.method === "GET") {
    return oauthAuthorizationHandoff(incoming, env.RANKABILITY_APP_ORIGIN, publicMcpUrl(env));
  }
  const upstream = new URL(`${env.RANKABILITY_APP_ORIGIN}${incoming.pathname}${incoming.search}`);

  const headers = new Headers(request.headers);
  headers.set("host", new URL(env.RANKABILITY_APP_ORIGIN).host);
  headers.set("x-forwarded-host", incoming.host);
  headers.set("x-seo-researcher-product", PRODUCT);
  headers.delete("cookie");
  let body: BodyInit | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      body = await oauthRequestBody(request, publicMcpUrl(env), MAX_OAUTH_BODY_BYTES);
      headers.delete("content-length");
    } catch (error) {
      return json({error: "invalid_request", error_description: error instanceof RangeError ? "OAuth request is too large." : "Invalid OAuth request body or resource."}, {status: error instanceof RangeError ? 413 : 400});
    }
  }

  const response = await fetch(upstream, { method: request.method, headers, body, redirect: "manual" });
  const responseHeaders = new Headers(response.headers);
  const location = responseHeaders.get("location");
  if (location) responseHeaders.set("location", rewriteLocation(location, env));
  responseHeaders.delete("set-cookie");
  responseHeaders.set("cache-control", "no-store");
  responseHeaders.set("access-control-allow-origin", "*");
  responseHeaders.set("access-control-expose-headers", "location, www-authenticate");
  responseHeaders.set("cross-origin-resource-policy", "cross-origin");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: responseHeaders });
}

function mapRestPath(url: URL): string | null {
  if (url.pathname === API_PREFIX) return `/seo-research/jobs${url.search}`;
  const match = url.pathname.match(/^\/v1\/research\/([0-9a-f-]+)(\/result)?$/i);
  if (!match) return null;
  return `/seo-research/jobs/${encodeURIComponent(match[1] || "")}${match[2] || ""}${url.search}`;
}

async function proxyRest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = mapRestPath(url);
  if (!path) return withCors(json({ error: { code: "not_found", message: "Endpoint not found." } }, { status: 404 }), request);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request) });
  if (!bearerToken(request)) {
    return withCors(json({ error: { code: "unauthorized", message: "Bearer token required." } }, { status: 401 }), request);
  }
  if (!(["GET", "POST"] as const).includes(request.method as "GET" | "POST")) {
    return withCors(json({ error: { code: "method_not_allowed", message: "Method not allowed." } }, { status: 405 }), request);
  }

  const id = requestId(request);
  const started = Date.now();
  const token = bearerToken(request) || "";
  const identityHash = await sha256Prefix(token);
  const headers = upstreamHeaders(request, id);
  const response = await fetch(`${env.RANKABILITY_AGENT_API_ORIGIN}${path}`, {
    method: request.method,
    headers,
    body: request.method === "POST" ? request.body : undefined,
    redirect: "manual",
  });
  analyticsPoint(env, "api_request_completed", {
    request,
    requestId: id,
    status: response.status,
    success: response.ok,
    latencyMs: Date.now() - started,
    identityHash,
    operation: `${request.method} ${url.pathname}`,
  });
  logEvent("api_request_completed", { request_id: id, status: response.status, latency_ms: Date.now() - started, path: url.pathname });
  return withCors(new Response(response.body, { status: response.status, statusText: response.statusText, headers: response.headers }), request);
}

async function handleBrowserEvent(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, { status: 405 });
  try {
    const body = await readBoundedJson(request, MAX_EVENT_BODY_BYTES);
    const event = typeof body.event === "string" ? body.event : "";
    if (!telemetryEvents.has(event)) return json({ error: "invalid_event" }, { status: 400 });
    const properties = body.properties && typeof body.properties === "object" && !Array.isArray(body.properties)
      ? body.properties as JsonRecord
      : {};
    analyticsPoint(env, event, {
      request,
      requestId: requestId(request),
      success: true,
      sessionId: typeof body.session_id === "string" ? body.session_id.slice(0, 100) : "",
      attribution: properties,
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    const status = error instanceof UpstreamError ? error.status : 400;
    return json({ error: "invalid_event" }, { status });
  }
}

async function handleMcp(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request) });
  const token = bearerToken(request);
  if (!token) {
    const response = json({ error: { code: "unauthorized", message: "Connect SEO Researcher with OAuth or provide a bearer API key." } }, { status: 401 });
    response.headers.set("www-authenticate", `Bearer resource_metadata="${env.MCP_ORIGIN}/.well-known/oauth-protected-resource/mcp"`);
    return withCors(response, request);
  }

  const id = requestId(request);
  const started = Date.now();
  const identityHash = await sha256Prefix(token);
  let connection: unknown;
  try {
    connection = await callAgentApi(env, request, "/seo-research/connection");
    const parsed = connectionSchema.safeParse(connection);
    if (!parsed.success) throw new UpstreamError("The research service returned an invalid connection response.", 502, "invalid_upstream_response", null);
    connection = parsed.data;
  } catch (error) {
    const known = error instanceof UpstreamError;
    const response = json({ error: { code: known ? error.code : "service_unavailable", message: known ? error.message : "SEO Researcher is temporarily unavailable. Retry this request.", retryable: known ? error.status >= 500 || error.status === 429 : true } }, { status: known ? error.status : 503 });
    if (response.status === 401) response.headers.set("www-authenticate", `Bearer resource_metadata="${env.MCP_ORIGIN}/.well-known/oauth-protected-resource/mcp"`);
    if (known && error.retryAfter) response.headers.set("retry-after", error.retryAfter);
    analyticsPoint(env, "mcp_auth_failed", { request, requestId: id, status: response.status, success: false, latencyMs: Date.now() - started, identityHash });
    return withCors(response, request);
  }

  const handler = createMcpHandler(() => createSeoResearchServer(env, request, connection), { route: "/mcp" });
  const response = await handler(request, env, ctx);
  response.headers.set("cache-control", "no-store");
  analyticsPoint(env, "mcp_request_completed", { request, requestId: id, status: response.status, success: response.ok, latencyMs: Date.now() - started, identityHash });
  return withCors(response, request);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    try {
      if (url.pathname === "/health") {
        return json({ status: "ok", service: PRODUCT, environment: env.ENVIRONMENT, timestamp: new Date().toISOString() });
      }
      if (url.pathname === "/events") return handleBrowserEvent(request, env);
      if (url.pathname === "/start") {
        analyticsPoint(env, "trial_checkout_started", { request, requestId: requestId(request), success: true, attribution: Object.fromEntries(url.searchParams) });
        const target = new URL(env.SIGNUP_URL);
        for (const [key, value] of url.searchParams) target.searchParams.set(key, value);
        target.searchParams.set("source", "seoresearcher.ai");
        return Response.redirect(target, 302);
      }
      if (url.pathname === "/.well-known/oauth-protected-resource" || url.pathname === "/.well-known/oauth-protected-resource/mcp") {
        return protectedResourceMetadata(env);
      }
      if (url.pathname === "/.well-known/oauth-authorization-server") return authorizationServerMetadata(env);
      if (url.pathname.startsWith("/oauth/")) {
        if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request) });
        return proxyOAuth(request, env);
      }
      if (url.pathname === "/mcp") return handleMcp(request, env, ctx);
      if (url.pathname === API_PREFIX || url.pathname.startsWith(`${API_PREFIX}/`)) return proxyRest(request, env);

      if (url.hostname === new URL(env.API_ORIGIN).hostname) {
        return withCors(json({ name: "SEO Researcher API", version: "v1", docs: "https://seoresearcher.ai/help/tools" }), request);
      }
      if (url.hostname === new URL(env.MCP_ORIGIN).hostname) {
        return json({ name: "SEO Researcher MCP", endpoint: publicMcpUrl(env), authentication: "OAuth 2.0 or bearer API key" });
      }
      return embeddedSiteResponse(url, EMBEDDED_SITE) || json({ error: { code: "not_found", message: "Page not found." } }, { status: 404 });
    } catch (error) {
      const id = requestId(request);
      console.error(JSON.stringify({ event: "edge_request_failed", request_id: id, path: url.pathname, error: error instanceof Error ? error.message : String(error) }));
      analyticsPoint(env, "edge_request_failed", { request, requestId: id, status: 500, success: false, errorCode: error instanceof Error ? error.name : "unknown" });
      return json({ error: { code: "internal_error", message: "Request failed.", request_id: id } }, { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;
