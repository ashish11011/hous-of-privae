import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const url = new URL(process.env.TEST_DATABASE_URL || "http://missing");
if (
  !["127.0.0.1", "localhost"].includes(url.hostname) ||
  !url.pathname.startsWith("/privae_webhook_test")
)
  throw new Error(
    "Use an empty disposable local PostgreSQL database named privae_webhook_test*. No application database is accepted.",
  );
const dir = await mkdtemp(path.join(tmpdir(), "privae-gift-card-tests-"));
try {
  const outfile = path.join(dir, "tests.cjs");
  const fixture = path.resolve("tests/fixtures/payment-services.ts");
  await build({
    entryPoints: ["tests/payment-suite.ts"],
    outfile,
    bundle: true,
    platform: "node",
    format: "cjs",
    packages: "external",
    alias: {
      "@/lib/email/ses": fixture,
      "@/lib/razorpay": fixture,
      "@/lib/auth/auth": fixture,
      "next-auth": fixture,
    },
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
          "gift-card-encryption-key-for-local-tests-only-12345",
      },
    },
  );
  process.exitCode = result.status ?? 1;
} finally {
  await rm(dir, { recursive: true, force: true });
}
