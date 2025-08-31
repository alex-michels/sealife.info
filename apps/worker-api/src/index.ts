// apps/worker-api/src/index.ts
import type {
  ExportedHandler,
  ExecutionContext,
  Request as CfRequest,
} from '@cloudflare/workers-types';

export default {
  async fetch(request: CfRequest, env: unknown, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return Response.json({ ok: true, ts: Date.now() });
    }
    if (url.pathname === "/api/echo" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      return Response.json({ youSent: body });
    }
    return new Response("sealife-api: try /api/health", { status: 404 });
  }
} satisfies ExportedHandler;
