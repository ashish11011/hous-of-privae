import assert from "node:assert/strict";
import { build } from "esbuild";

async function load(entry) {
  const result = await build({
    entryPoints: [entry], bundle: true, write: false, platform: "node", format: "cjs",
    plugins: [{ name: "auth-fixtures", setup(build) {
      build.onResolve({ filter: /^(next-auth(?:\/jwt)?|next\/server|@\/lib\/auth\/auth)$/ }, args => ({ path: args.path, namespace: "fixture" }));
      build.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({ contents: `
        export const authOptions = {};
        export async function getServerSession() { return globalThis.testSession; }
        export async function getToken() { return globalThis.testSession; }
        export const NextResponse = {
          next: () => ({ status: 200 }),
          redirect: url => ({ status: 307, url: String(url) }),
          json: (body, options) => ({ ...options, body }),
        };
      ` }));
    } }],
  });
  const module = { exports: {} };
  new Function("module", "exports", result.outputFiles[0].text)(module, module.exports);
  return module.exports;
}

const { getOrderAdmin, requireAdmin } = await load("lib/auth/admin.ts");
const { middleware } = await load("src/middleware.ts");
const request = path => ({ url: `https://example.com${path}`, nextUrl: new URL(`https://example.com${path}`) });
for (const email of ["bishnoi11011@gmail.com", "vatskritika07@gmail.com", "Vaishnavidhamija95@gmail.com"]) {
  globalThis.testSession = { id: "user-id", email, user_type: "0" };
  assert.deepEqual(await getOrderAdmin(), { id: "user-id" });
  assert.equal((await middleware(request("/admin"))).status, 200);
  assert.equal((await middleware(request("/api/admin/products"))).status, 200);
}
for (const session of [null, { id: "other", email: "other@gmail.com", user_type: "1" }, { id: "other", email: "bishnoi11011@gmail.com.evil.com" }, { email: "bishnoi11011@gmail.com" }, { id: "other" }]) {
  globalThis.testSession = session;
  assert.equal(await getOrderAdmin(), null);
  await assert.rejects(requireAdmin, /Admin sign-in is required/);
  assert.equal((await middleware(request("/api/admin/products"))).status, 403);
  assert.equal((await middleware(request("/admin"))).status, 307);
}
globalThis.testSession = null;
const redirect = new URL((await middleware(request("/admin/orders?page=2"))).url);
assert.equal(redirect.pathname, "/auth/login");
assert.equal(redirect.searchParams.get("callbackUrl"), "/admin/orders?page=2");
console.log("Admin auth checks passed: allowlist, role rejection, missing session/ID, API denial, and login redirect.");
