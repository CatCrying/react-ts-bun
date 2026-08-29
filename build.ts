import { rm, cp } from "node:fs/promises";
import { existsSync } from "node:fs";
import { $ } from "bun";

const outdir = "./dist";

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
for (const output of result.outputs) {
  console.log(`  ${output.path} (${(output.size / 1024).toFixed(1)} KB)`);
}

const cssFile = Bun.file(`${outdir}/styles.css`);
if (await cssFile.exists()) {
  console.log(`  ${outdir}/styles.css (${((await cssFile.size) / 1024).toFixed(1)} KB)`);
}

// Note: files under /api are NOT bundled here — Vercel builds each one
// into its own serverless function at deploy time using its Node.js builder.
