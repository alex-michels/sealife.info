globalThis.process ??= {}; globalThis.process.env ??= {};
import './chunks/astro-designed-error-pages_DeiC6AxJ.mjs';
import './chunks/astro/server_C-G2ItSa.mjs';
import { s as sequence } from './chunks/index_D8TqeZdK.mjs';

const onRequest$2 = async (ctx, next) => {
  if (ctx.url.pathname === "/") {
    const accept = (ctx.request.headers.get("accept-language") || "").toLowerCase();
    const isRU = /(?:^|[,; ])ru\b/.test(accept);
    return ctx.redirect(isRU ? "/ru/" : "/en/");
  }
  return next();
};

const onRequest$1 = (context, next) => {
  if (context.isPrerendered) {
    context.locals.runtime ??= {
      env: process.env
    };
  }
  return next();
};

const onRequest = sequence(
	onRequest$1,
	onRequest$2
	
);

export { onRequest };
