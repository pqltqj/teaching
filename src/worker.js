import { handleApi } from './api.js';

export class ReviewBank {
  constructor(ctx, env) { this.ctx = ctx; this.env = env; }
  fetch(request) { return handleApi(request, this.env, this.ctx.storage); }
}

export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname.startsWith('/api/')) {
      try {
        return await env.REVIEW.get(env.REVIEW.idFromName('bank')).fetch(request);
      } catch {
        return Response.json({error: 'Review service is temporarily unavailable.'}, {status: 503, headers: {'Cache-Control': 'no-store'}});
      }
    }
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'same-origin');
    headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    return new Response(response.body, {status: response.status, headers});
  }
};
