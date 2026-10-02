// Builds the self-contained browser edition into web/dist (index.html + app.js).
import { build } from "esbuild";
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "web", "dist");
mkdirSync(out, { recursive: true });

const shim = (p) => path.join(root, "web", "shims", p);
const alias = {
  "@/data/db": shim("db.ts"),
  "next/link": shim("next-link.tsx"),
  "next/navigation": shim("next-navigation.ts"),
  "next/cache": shim("next-cache.ts"),
  "next/server": shim("next-server.ts"),
  "@/components/PrintButton": shim("print.tsx"),
};

await build({
  entryPoints: [path.join(root, "web", "main.tsx")],
  bundle: true,
  minify: true,
  format: "iife",
  platform: "browser",
  target: ["es2022"],
  outfile: path.join(out, "app.js"),
  jsx: "automatic",
  loader: { ".wasm": "binary" },
  define: { "process.env.NODE_ENV": '"production"', "process.env.APEX_DB_PATH": "undefined" },
  external: ["fs", "path", "crypto"],
  plugins: [
    {
      name: "apex-alias",
      setup(b) {
        b.onResolve({ filter: /.*/ }, (args) => {
          if (alias[args.path]) return { path: alias[args.path] };
          if (args.path.startsWith("@/")) {
            const base = path.join(root, "src", args.path.slice(2));
            for (const ext of [".ts", ".tsx", "/index.ts"]) {
              try {
                readFileSync(base + ext);
                return { path: base + ext };
              } catch {}
            }
          }
          return undefined;
        });
      },
    },
  ],
  logLevel: "warning",
});

execSync(`npx @tailwindcss/cli -i src/app/globals.css -o web/dist/app.css --minify`, { cwd: root, stdio: "inherit" });
const css = readFileSync(path.join(out, "app.css"), "utf8");
const html = `<title>APEX OS</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<style>${css}
#boot{display:flex;min-height:80vh;align-items:center;justify-content:center;padding-inline:16px}
#boot .box{max-width:420px}
#boot .bar{height:3px;width:100%;background:var(--panel-2);border-radius:2px;overflow:hidden;margin-top:14px}
#boot .bar i{display:block;height:100%;width:35%;background:var(--accent);animation:apexbar 1.2s ease-in-out infinite}
@keyframes apexbar{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}
@media (prefers-reduced-motion: reduce){#boot .bar i{animation:none;width:100%}}
</style>
<div id="boot"><div class="box">
<div style="font-weight:700;letter-spacing:.14em;font-size:15px">APEX OS</div>
<div class="muted" style="font-size:11px;margin-top:2px">Personal performance, learning &amp; life intelligence</div>
<p class="text-2" id="boot-msg" style="margin-top:18px;font-size:14px">Loading…</p>
<div class="bar"><i></i></div>
<p class="muted" style="margin-top:14px;font-size:11px">Your data is private: it lives in your own artifact storage and this browser. Nothing is shared.</p>
</div></div>
<div id="root"></div>
__APP_JS__
`;
const js = readFileSync(path.join(out, "app.js"), "utf8");
// Inline the bundle (single self-contained page); neutralise sequences that would end the script element early.
const safeJs = js.replace(/<\/(script)/gi, "<\\/$1").replace(/<!--/g, "<\\!--");
writeFileSync(path.join(out, "index.html"), html.replace("__APP_JS__", () => `<script>${safeJs}</script>`));
console.log(`dist: index.html ${(readFileSync(path.join(out, "index.html")).length / 1024).toFixed(0)} KB (bundle inlined)`);
