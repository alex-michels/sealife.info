globalThis.process ??= {}; globalThis.process.env ??= {};
import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_C-G2ItSa.mjs';
import { $ as $$Base, a as $$Nav } from '../chunks/Nav_l69Dnsvg.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "lang": "en", "title": "sealife.info \u2013 Seals, rescue & games" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Nav", $$Nav, { "lang": "en" })} ${maybeRenderHead()}<main style="padding:1.5rem; max-width: 960px; margin: 0 auto;"> <h1>sealife.info</h1> <p>Purpose: celebrate real seals, map rescue centers, and host light, mobile-first games.</p> <section> <h2>Gallery (placeholder)</h2> <p>Hook up R2 later; for now, static images here.</p> </section> </main> ` })}`;
}, "C:/Users/busca/Documents/Projects/seallife.info/apps/web/src/pages/en/index.astro", void 0);

const $$file = "C:/Users/busca/Documents/Projects/seallife.info/apps/web/src/pages/en/index.astro";
const $$url = "/en";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
