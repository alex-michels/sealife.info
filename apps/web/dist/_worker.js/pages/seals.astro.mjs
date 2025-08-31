globalThis.process ??= {}; globalThis.process.env ??= {};
import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_C-G2ItSa.mjs';
import { $ as $$Base, a as $$Nav } from '../chunks/Nav_l69Dnsvg.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const lang = Astro2.url.pathname.startsWith("/ru") ? "ru" : "en";
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "lang": lang, "title": lang === "ru" ? "\u041E \u0442\u044E\u043B\u0435\u043D\u044F\u0445" : "About Seals" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Nav", $$Nav, { "lang": lang })} ${maybeRenderHead()}<main style="padding:1.5rem; max-width: 960px; margin: 0 auto;"> <h1>${lang === "ru" ? "\u041E \u0442\u044E\u043B\u0435\u043D\u044F\u0445" : "About Seals"}</h1> <ul> <li>${lang === "ru" ? "\u0424\u043E\u0446\u0438\u0434\u044B (\u043D\u0430\u0441\u0442\u043E\u044F\u0449\u0438\u0435 \u0442\u044E\u043B\u0435\u043D\u0438)" : "Phocidae (true seals)"} – ${lang === "ru" ? "\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, \u043A\u043E\u043B\u044C\u0447\u0430\u0442\u0430\u044F \u043D\u0435\u0440\u043F\u0430" : "e.g., ringed seal"}.</li> <li>${lang === "ru" ? "\u041E\u0442\u0442\u0430\u0440\u0438\u0438 (\u0443\u0448\u0430\u0441\u0442\u044B\u0435 \u0442\u044E\u043B\u0435\u043D\u0438)" : "Otariidae (eared seals)"} – ${lang === "ru" ? "\u043C\u043E\u0440\u0441\u043A\u0438\u0435 \u043B\u044C\u0432\u044B \u0438 \u043C\u043E\u0440\u0441\u043A\u0438\u0435 \u043A\u043E\u0442\u0438\u043A\u0438" : "sea lions and fur seals"}.</li> </ul> </main> ` })}`;
}, "C:/Users/busca/Documents/Projects/seallife.info/apps/web/src/pages/seals/index.astro", void 0);

const $$file = "C:/Users/busca/Documents/Projects/seallife.info/apps/web/src/pages/seals/index.astro";
const $$url = "/seals";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
