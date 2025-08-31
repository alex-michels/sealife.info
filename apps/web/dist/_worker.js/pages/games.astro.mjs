globalThis.process ??= {}; globalThis.process.env ??= {};
import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_C-G2ItSa.mjs';
import { $ as $$Base, a as $$Nav } from '../chunks/Nav_l69Dnsvg.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const lang = Astro2.url.pathname.startsWith("/ru") ? "ru" : "en";
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "lang": lang, "title": lang === "ru" ? "\u0418\u0433\u0440\u044B" : "Games" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Nav", $$Nav, { "lang": lang })} ${maybeRenderHead()}<main style="padding:1.5rem; max-width: 960px; margin: 0 auto;"> <h1>${lang === "ru" ? "\u0418\u0433\u0440\u044B" : "Games"}</h1> <ul> <li><a href="/games/seal-hunt-v1/" rel="external">Seal Hunt v1</a> — ${lang === "ru" ? "\u0442\u0435\u043A\u0443\u0449\u0430\u044F JS-\u0432\u0435\u0440\u0441\u0438\u044F" : "current JS version"}.</li> </ul> </main> ` })}`;
}, "C:/Users/busca/Documents/Projects/seallife.info/apps/web/src/pages/games/index.astro", void 0);

const $$file = "C:/Users/busca/Documents/Projects/seallife.info/apps/web/src/pages/games/index.astro";
const $$url = "/games";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
