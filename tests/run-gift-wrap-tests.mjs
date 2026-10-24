import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

// All payment and database services are mocked. No credentials or database needed.
const dir = await mkdtemp(path.join(tmpdir(), "privae-gift-wrap-tests-"));
try {
  const outfile = path.join(dir, "tests.cjs");
  const fixture = path.resolve("tests/fixtures/gift-wrap-services.ts");
  await build({
    entryPoints: ["tests/gift-wrap.test.ts"], outfile, bundle: true,
    platform: "node", format: "cjs", packages: "external",
    banner: { js: `const testStorage = new Map(); globalThis.localStorage = { getItem: key => testStorage.get(key) ?? null, setItem: (key, value) => testStorage.set(key, value), removeItem: key => testStorage.delete(key) };` },
    alias: {
      ...Object.fromEntries(["@/lib/db", "@/lib/razorpay", "@/lib/auth/auth", "next-auth", "@/lib/loyaltyBalance"].map(key => [key, fixture])),
      "aws-sdk": path.resolve("tests/fixtures/gift-wrap-email.ts"),
    },
  });
  const result = spawnSync(process.execPath, ["--test", outfile], {
    stdio: "inherit", env: { ...process.env, NODE_PATH: path.resolve("node_modules") },
  });
  process.exitCode = result.status ?? 1;
} finally { await rm(dir, { recursive: true, force: true }); }
