// Worker entry for Cloudflare Workers with static assets
// Assets are served automatically via the "assets" config in wrangler.jsonc
// with not_found_handling: "single-page-application" for SPA routing.
// This worker only handles /api/* proxy requests to a remote OpenCode server.

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    // API proxy: forward /api/* requests to the OpenCode server
    if (url.pathname.startsWith("/api/")) {
      const target = url.searchParams.get("server") || "http://localhost:4096"
      const apiPath = url.pathname.replace("/api", "")
      const apiUrl = new URL(apiPath, target)
      apiUrl.search = url.search

      try {
        return await fetch(apiUrl.toString(), {
          method: request.method,
          headers: request.headers,
          body: request.body,
        })
      } catch {
        return new Response(JSON.stringify({ error: "Failed to reach OpenCode server" }), {
          status: 502,
          headers: { "Content-Type": "application/json" },
        })
      }
    }

    // Non-API, non-asset requests: shouldn't reach here due to SPA fallback,
    // but return 404 as safety net
    return new Response("Not Found", { status: 404 })
  },
}
