globalThis.process ??= {}; globalThis.process.env ??= {};
import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_C-G2ItSa.mjs';
import { $ as $$Base, a as $$Nav } from '../chunks/Nav_l69Dnsvg.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "lang": "ru", "title": "sealife.info \u2013 \u0422\u044E\u043B\u0435\u043D\u0438, \u0441\u043F\u0430\u0441\u0435\u043D\u0438\u0435 \u0438 \u0438\u0433\u0440\u044B" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Nav", $$Nav, { "lang": "ru" })} ${maybeRenderHead()}<main style="padding:1.5rem; max-width: 960px; margin: 0 auto;"> <h1>sealife.info</h1> <p>Цель: рассказывать о настоящих тюленях, собирать карту центров спасения и делать лёгкие мобильные игры.</p> <section> <h2>Галерея (заглушка)</h2> <p>Позже подключим R2; пока — статические изображения.</p> </section> </main> ` })}`;
}, "C:/Users/busca/Documents/Projects/seallife.info/apps/web/src/pages/ru/index.astro", void 0);

const $$file = "C:/Users/busca/Documents/Projects/seallife.info/apps/web/src/pages/ru/index.astro";
const $$url = "/ru";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
