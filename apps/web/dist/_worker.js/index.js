globalThis.process ??= {}; globalThis.process.env ??= {};
import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_BExLUP3O.mjs';
import { manifest } from './manifest_BD67R9Sj.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/_lang_/games.astro.mjs');
const _page2 = () => import('./pages/_lang_/sealrescue.astro.mjs');
const _page3 = () => import('./pages/_lang_/seals.astro.mjs');
const _page4 = () => import('./pages/_lang_.astro.mjs');
const _page5 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["../../node_modules/.pnpm/@astrojs+cloudflare@12.6.7__a3c840d4cec3b1b686e29ae9de387b5f/node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js", _page0],
    ["src/pages/[lang]/games/index.astro", _page1],
    ["src/pages/[lang]/sealrescue/index.astro", _page2],
    ["src/pages/[lang]/seals/index.astro", _page3],
    ["src/pages/[lang]/index.astro", _page4],
    ["src/pages/index.astro", _page5]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = undefined;
const _exports = createExports(_manifest);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
