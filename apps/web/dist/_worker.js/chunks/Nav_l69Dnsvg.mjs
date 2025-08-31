globalThis.process ??= {}; globalThis.process.env ??= {};
import { e as createComponent, f as createAstro, h as addAttribute, l as renderHead, n as renderSlot, r as renderTemplate, m as maybeRenderHead } from './astro/server_C-G2ItSa.mjs';

const $$Astro$1 = createAstro();
const $$Base = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Base;
  const { lang = "en", title = "sealife.info" } = Astro2.props;
  return renderTemplate`<html${addAttribute(lang, "lang")}> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><link rel="icon" href="/favicon.svg">${renderHead()}</head> <body style="font-family: system-ui, -apple-system, Segoe UI, Roboto; margin:0;"> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "C:/Users/busca/Documents/Projects/seallife.info/apps/web/src/layouts/Base.astro", void 0);

const $$Astro = createAstro();
const $$Nav = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Nav;
  const { lang = "en" } = Astro2.props;
  const base = lang === "ru" ? "/ru" : "/en";
  return renderTemplate`${maybeRenderHead()}<nav style="display:flex;gap:1rem;padding:1rem;border-bottom:1px solid #eee;align-items:center;"> <a${addAttribute(base + "/", "href")}>Home</a> <a${addAttribute(base + "/seals/", "href")}>Seals</a> <a${addAttribute(base + "/sealrescue/", "href")}>Seal Rescue</a> <a${addAttribute(base + "/games/", "href")}>Games</a> <span style="margin-left:auto"></span> <a${addAttribute(base === "/ru" ? "/en/" : "/ru/", "href")} aria-label="switch language">${lang === "ru" ? "EN" : "RU"}</a> </nav>`;
}, "C:/Users/busca/Documents/Projects/seallife.info/apps/web/src/components/Nav.astro", void 0);

export { $$Base as $, $$Nav as a };
