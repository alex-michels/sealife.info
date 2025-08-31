globalThis.process ??= {}; globalThis.process.env ??= {};
import { e as createComponent, f as createAstro, r as renderTemplate } from '../chunks/astro/server_C-G2ItSa.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const accept = (Astro2.request.headers.get("accept-language") || "").toLowerCase();
  const isRU = /(?:^|[,; ])ru\b/.test(accept);
  Astro2.redirect(isRU ? "/ru/" : "/en/");
  return renderTemplate``;
}, "C:/Users/busca/Documents/Projects/seallife.info/apps/web/src/pages/index.astro", void 0);

const $$file = "C:/Users/busca/Documents/Projects/seallife.info/apps/web/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
