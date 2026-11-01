import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
const url = new URL(process.env.TEST_DATABASE_URL || "http://missing");
if (
  !["127.0.0.1", "localhost"].includes(url.hostname) ||
  !url.pathname.startsWith("/privae_account_test")
)
  throw new Error(
    "Use an empty disposable local PostgreSQL database named privae_account_test*.",
  );
const dir = await mkdtemp(path.join(tmpdir(), "privae-dashboard-flow-"));
try {
  const outfile = path.join(dir, "tests.cjs");
  const fixture = path.resolve("tests/fixtures/payment-services.ts");
  await build({
    entryPoints: ["tests/dashboard-flow.integration.jsx"],
    outfile,
    bundle: true,
    platform: "node",
    format: "cjs",
    packages: "external",
    banner: {
      js: `const {JSDOM:TestDOM}=require('jsdom');globalThis.dashboardDom=new TestDOM('<!doctype html><html><body></body></html>',{url:'http://dashboard.test/profile',pretendToBeVisual:true});for(const name of ['window','document','HTMLElement','HTMLInputElement','Event','MouseEvent','FormData','localStorage'])globalThis[name]=name==='window'?globalThis.dashboardDom.window:globalThis.dashboardDom.window[name];globalThis.IS_REACT_ACT_ENVIRONMENT=true;globalThis.ResizeObserver=class{observe(){}disconnect(){}};`,
    },
    alias: {
      "@/lib/email/ses": fixture,
      "@/lib/razorpay": fixture,
      "@/lib/auth/auth": fixture,
      "next-auth": fixture,
    },
    plugins: [
      {
        name: "dashboard-platform-fixtures",
        setup(build) {
          const fixtures = {
            "next-auth/react":
              "export function useSession(){return globalThis.dashboardSession;} export function signOut(){}",
            "next/navigation":
              'export function useRouter(){return {push(){},refresh(){}};} export function usePathname(){return "/profile";} export function redirect(url){throw new Error("Redirect:"+url);}',
            "next/link":
              'import React from "react";export default function Link({children,...props}){return React.createElement("a",props,children);}',
            "next/image":
              'import React from "react";export default function Image({fill,priority,loader,unoptimized,blurDataURL,placeholder,...props}){return React.createElement("img",props);}',
            sonner:
              'export const toast={success(value){globalThis.dashboardToasts.push({type:"success",value});},error(value){globalThis.dashboardToasts.push({type:"error",value});},info(){}};',
          };
          build.onResolve(
            {
              filter:
                /^(next-auth\/react|next\/navigation|next\/link|next\/image|sonner)$/,
            },
            (args) => ({ path: args.path, namespace: "fixture" }),
          );
          build.onLoad({ filter: /.*/, namespace: "fixture" }, (args) => ({
            contents: fixtures[args.path],
            loader: "js",
            resolveDir: process.cwd(),
          }));
        },
      },
    ],
  });
  const result = spawnSync(
    process.execPath,
    ["--test", "--test-force-exit", outfile],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        DATABASE_URL: process.env.TEST_DATABASE_URL,
        NODE_PATH: path.resolve("node_modules"),
        GIFT_CARD_ENCRYPTION_KEY:
          "dashboard-test-encryption-secret-never-used-in-production",
      },
    },
  );
  process.exitCode = result.status ?? 1;
} finally {
  await rm(dir, { recursive: true, force: true });
}
