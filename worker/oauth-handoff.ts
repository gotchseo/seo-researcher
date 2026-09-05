/** Browser authorization runs on the identity host, never through a cookie proxy. */
export function oauthAuthorizationHandoff(incoming: URL, identityOrigin: string, publicResource: string): Response {
  const resource = incoming.searchParams.get("resource");
  if (resource && resource !== publicResource) return Response.json({error: "invalid_target"}, {status: 400});
  const target = new URL("/oauth/authorize", identityOrigin);
  target.search = incoming.search;
  target.searchParams.set("resource", publicResource);
  target.searchParams.set("product", "seo_researcher");
  return new Response(null, {status: 302, headers: {location: target.href, "cache-control": "no-store", "referrer-policy": "no-referrer"}});
}

/** Bound memory before decoding unauthenticated OAuth bodies, including chunked requests. */
export async function oauthRequestBody(request: Request, publicResource: string, maxBytes: number): Promise<string> {
  const reader = request.body?.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  if (reader) {
    try {
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > maxBytes) { await reader.cancel(); throw new RangeError("OAuth request is too large."); }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  const raw = new TextDecoder().decode(bytes);
  if (new URL(request.url).pathname !== "/oauth/token") return raw;
  const type = request.headers.get("content-type") || "";
  if (type.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(raw);
    if (!params.has("resource")) params.set("resource", publicResource);
    if (params.getAll("resource").length !== 1 || params.get("resource") !== publicResource) throw new TypeError("Invalid resource.");
    return params.toString();
  }
  if (type.includes("application/json")) {
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new TypeError("Invalid OAuth body.");
    if (data.resource === undefined) data.resource = publicResource;
    if (data.resource !== publicResource) throw new TypeError("Invalid resource.");
    return JSON.stringify(data);
  }
  throw new TypeError("Use a form-encoded or JSON OAuth body.");
}
