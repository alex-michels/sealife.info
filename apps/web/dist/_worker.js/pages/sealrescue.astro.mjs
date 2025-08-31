globalThis.process ??= {}; globalThis.process.env ??= {};
import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_C-G2ItSa.mjs';
import { $ as $$Base, a as $$Nav } from '../chunks/Nav_l69Dnsvg.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const lang = Astro2.url.pathname.startsWith("/ru") ? "ru" : "en";
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "lang": lang, "title": lang === "ru" ? "\u0426\u0435\u043D\u0442\u0440\u044B \u0441\u043F\u0430\u0441\u0435\u043D\u0438\u044F \u0442\u044E\u043B\u0435\u043D\u0435\u0439" : "Seal Rescue Centers" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Nav", $$Nav, { "lang": lang })} ${maybeRenderHead()}<main style="padding:1.5rem; max-width: 960px; margin: 0 auto;"> <h1>${lang === "ru" ? "\u0426\u0435\u043D\u0442\u0440\u044B \u0441\u043F\u0430\u0441\u0435\u043D\u0438\u044F \u0442\u044E\u043B\u0435\u043D\u0435\u0439" : "Seal Rescue Centers"}</h1> <p>${lang === "ru" ? "\u0424\u0438\u043B\u044C\u0442\u0440\u044B \u0438 \u043A\u0430\u0440\u0442\u0430 \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u043F\u043E\u0437\u0436\u0435." : "Filters and map coming soon."}</p> </main> ` })}`;
}, "C:/Users/busca/Documents/Projects/seallife.info/apps/web/src/pages/sealrescue/index.astro", void 0);

const $$file = "C:/Users/busca/Documents/Projects/seallife.info/apps/web/src/pages/sealrescue/index.astro";
const $$url = "/sealrescue";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
