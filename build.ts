import { rm, cp } from "node:fs/promises";
import { existsSync } from "node:fs";

const outdir = "./dist";

// 1. Clean previous build
if (existsSync(outdir)) {
  await rm(outdir, { recursive: true, force: true });
}

// 2. Bundle the app for production
const result = await Bun.build({
  entrypoints: ["./src/index.tsx"],
  outdir,
  target: "browser",
  format: "esm",
  minify: true,
  sourcemap: "none",
  splitting: true,
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  naming: {
    entry: "[dir]/[name].[ext]",
    chunk: "chunks/[name]-[hash].[ext]",
    asset: "assets/[name]-[hash].[ext]",
  },
});

if (!result.success) {
  console.error("Build failed:");
  for (const message of result.logs) {
    console.error(message);
  }
  process.exit(1);
}

// 3. Copy static assets (index.html, etc.)
await cp("./public/index.html", `${outdir}/index.html`);

// 4. Report output
console.log(`Build succeeded. ${result.outputs.length} file(s) written to ${outdir}/`);
for (const output of result.outputs) {
  console.log(`  ${output.path} (${(output.size / 1024).toFixed(1)} KB)`);
}
