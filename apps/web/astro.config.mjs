import cloudflare from "@astrojs/cloudflare";


/*****
* Deployed via Cloudflare Pages (Functions) with SSR
*****/
export default {
output: 'server',
adapter: cloudflare(),
server: { port: 4321 },
};