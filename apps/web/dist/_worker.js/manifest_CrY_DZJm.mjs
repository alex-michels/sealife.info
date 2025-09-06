globalThis.process ??= {}; globalThis.process.env ??= {};
import { o as decodeKey } from './chunks/astro/server_C-G2ItSa.mjs';
import './chunks/astro-designed-error-pages_DeiC6AxJ.mjs';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/noop-middleware_z3kKE2wC.mjs';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///C:/Users/busca/Documents/Projects/seallife.info/apps/web/","cacheDir":"file:///C:/Users/busca/Documents/Projects/seallife.info/apps/web/node_modules/.astro/","outDir":"file:///C:/Users/busca/Documents/Projects/seallife.info/apps/web/dist/","srcDir":"file:///C:/Users/busca/Documents/Projects/seallife.info/apps/web/src/","publicDir":"file:///C:/Users/busca/Documents/Projects/seallife.info/apps/web/public/","buildClientDir":"file:///C:/Users/busca/Documents/Projects/seallife.info/apps/web/dist/","buildServerDir":"file:///C:/Users/busca/Documents/Projects/seallife.info/apps/web/dist/_worker.js/","adapterName":"@astrojs/cloudflare","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"../../node_modules/.pnpm/@astrojs+cloudflare@12.6.7__a3c840d4cec3b1b686e29ae9de387b5f/node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["C:/Users/busca/Documents/Projects/seallife.info/apps/web/src/pages/[lang]/games/index.astro",{"propagation":"none","containsHead":true}],["C:/Users/busca/Documents/Projects/seallife.info/apps/web/src/pages/[lang]/index.astro",{"propagation":"none","containsHead":true}],["C:/Users/busca/Documents/Projects/seallife.info/apps/web/src/pages/[lang]/sealrescue/index.astro",{"propagation":"none","containsHead":true}],["C:/Users/busca/Documents/Projects/seallife.info/apps/web/src/pages/[lang]/seals/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000astro-internal:middleware":"_astro-internal_middleware.mjs","\u0000noop-actions":"_noop-actions.mjs","\u0000@astro-page:src/pages/[lang]/games/index@_@astro":"pages/_lang_/games.astro.mjs","\u0000@astro-page:src/pages/[lang]/sealrescue/index@_@astro":"pages/_lang_/sealrescue.astro.mjs","\u0000@astro-page:src/pages/[lang]/seals/index@_@astro":"pages/_lang_/seals.astro.mjs","\u0000@astro-page:src/pages/[lang]/index@_@astro":"pages/_lang_.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"index.js","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:../../node_modules/.pnpm/@astrojs+cloudflare@12.6.7__a3c840d4cec3b1b686e29ae9de387b5f/node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint@_@js":"pages/_image.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_CrY_DZJm.mjs","C:/Users/busca/Documents/Projects/seallife.info/node_modules/.pnpm/unstorage@1.17.0/node_modules/unstorage/drivers/cloudflare-kv-binding.mjs":"chunks/cloudflare-kv-binding_DMly_2Gl.mjs","C:/Users/busca/Documents/Projects/seallife.info/node_modules/.pnpm/astro@5.13.5_@types+node@24_e132be96df550ab3e5b1693207839d80/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_LEQngo0K.mjs","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/favicon.svg","/_worker.js/index.js","/_worker.js/renderers.mjs","/_worker.js/_@astrojs-ssr-adapter.mjs","/_worker.js/_astro-internal_middleware.mjs","/_worker.js/_noop-actions.mjs","/games/seal-hunt-v1/favicon.svg","/games/seal-hunt-v1/game.js","/games/seal-hunt-v1/index.html","/games/seal-hunt-v1/manifest.webmanifest","/games/seal-hunt-v1/package.json","/games/seal-hunt-v1/README.md","/games/seal-hunt-v1/style.css","/games/seal-hunt-v1/sw.js","/_worker.js/chunks/astro-designed-error-pages_DeiC6AxJ.mjs","/_worker.js/chunks/astro_C9EXUwi9.mjs","/_worker.js/chunks/cloudflare-kv-binding_DMly_2Gl.mjs","/_worker.js/chunks/image-endpoint_BIpw5lnA.mjs","/_worker.js/chunks/index_D8TqeZdK.mjs","/_worker.js/chunks/Nav_DqBA5H1D.mjs","/_worker.js/chunks/noop-middleware_z3kKE2wC.mjs","/_worker.js/chunks/path_lFLZ0pUM.mjs","/_worker.js/chunks/sharp_LEQngo0K.mjs","/_worker.js/chunks/_@astrojs-ssr-adapter_BExLUP3O.mjs","/_worker.js/pages/_image.astro.mjs","/_worker.js/pages/_lang_.astro.mjs","/games/seal-hunt-v1/entities/prey.js","/games/seal-hunt-v1/entities/seal.js","/games/seal-hunt-v1/core/balance.js","/games/seal-hunt-v1/core/input.js","/games/seal-hunt-v1/render/scenery.js","/_worker.js/chunks/astro/server_C-G2ItSa.mjs","/_worker.js/pages/_lang_/games.astro.mjs","/_worker.js/pages/_lang_/sealrescue.astro.mjs","/_worker.js/pages/_lang_/seals.astro.mjs"],"buildFormat":"directory","checkOrigin":true,"serverIslandNameMap":[],"key":"EdFwk74warFHD/WsMp1LHODSyR2mZtr7yPuwxG49Dws=","sessionConfig":{"driver":"cloudflare-kv-binding","options":{"binding":"SESSION"}}});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = () => import('./chunks/cloudflare-kv-binding_DMly_2Gl.mjs');

export { manifest };
