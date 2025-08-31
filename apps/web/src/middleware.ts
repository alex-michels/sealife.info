import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (ctx, next) => {
  if (ctx.url.pathname === '/') {
    const accept = (ctx.request.headers.get('accept-language') || '').toLowerCase();
    const isRU = /(?:^|[,; ])ru\b/.test(accept);
    return ctx.redirect(isRU ? '/ru/' : '/en/');
  }
  return next();
};
