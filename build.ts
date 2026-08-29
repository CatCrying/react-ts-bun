import { rm, cp } from "node:fs/promises";
import { existsSync } from "node:fs";
import { $ } from "bun";

const outdir = "./dist";

// The backend now lives in ../backend as its own Express server, so the
// frontend needs to know its URL at build time (there's no same-origin
// Vercel rewrite to lean on anymore). Override at build time, e.g.:
//   API_BASE_URL=https://api.example.com bun run build
const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:4000";

// 1. Clean previous build
if (existsSync(outdir)) {
  await rm(outdir, { recursive: true, force: true });
}

// 2. Bundle the frontend for production
const result = await Bun.build({
  entrypoints: ["./src/index.tsx"],
  outdir,
  target: "browser",
  format: "esm",
  minify: true,
  sourcemap: "none",
  splitting: true,
  reactCompiler: true,
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env.API_BASE_URL": JSON.stringify(apiBaseUrl),
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

// 3. Compile Tailwind CSS (production: minified)
await $`bunx @tailwindcss/cli -i ./src/styles.css -o ${outdir}/styles.css --minify`;

// 4. Copy static assets (index.html, etc.)
await cp("./public/index.html", `${outdir}/index.html`);

// 5. Report output
console.log(`Build succeeded. ${result.outputs.length} JS file(s) written to ${outdir}/`);
console.log(`  API base URL baked in: ${apiBaseUrl}`);
for (const output of result.outputs) {
  console.log(`  ${output.path} (${(output.size / 1024).toFixed(1)} KB)`);
}

const cssFile = Bun.file(`${outdir}/styles.css`);
if (await cssFile.exists()) {
  console.log(`  ${outdir}/styles.css (${((await cssFile.size) / 1024).toFixed(1)} KB)`);
}
