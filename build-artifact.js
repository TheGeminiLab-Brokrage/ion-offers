/*
 * Assembles the multi-file app into ONE self-contained page for publishing
 * as a shareable Artifact (CSP blocks external hosts, so everything inlines:
 * CSS, JS, jsPDF, and every image as a data URI).
 * Run:  node build-artifact.js   ->  dist/artifact.html
 */
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };
function dataURI(rel) {
  const ext = path.extname(rel).toLowerCase();
  const buf = fs.readFileSync(path.join(ROOT, rel));
  return "data:" + (MIME[ext] || "application/octet-stream") + ";base64," + buf.toString("base64");
}

const css = read("css/styles.css");
const engine = read("js/engine.js");
const data = read("js/data.js");
const jspdf = read("vendor/jspdf.umd.min.js");
const pdf = read("js/pdf.js");

// inline every "assets/…" path referenced in assets.js
const assets = read("js/assets.js").replace(/"(assets\/[^"]+)"/g, (m, rel) => '"' + dataURI(rel) + '"');

// page body: drop external <script>/<link>, inline the on-page master-plan image
let html = read("index.html");
html = html.slice(html.indexOf("<body>") + 6, html.indexOf("</body>"));
html = html.replace(/\s*<script src="[^"]+"><\/script>/g, "").replace(/\s*<link rel="stylesheet"[^>]*>/g, "");
html = html.replace('src="assets/masterplan-web.jpg"', 'src="' + dataURI("assets/masterplan-web.jpg") + '"');

const out = `<title>Ion — Offer Generator · Prime Developments</title>
<style>
${css}
</style>
${html}
<script>
${engine}
</script>
<script>
${data}
</script>
<script>
${assets}
</script>
<script>
${jspdf}
</script>
<script>
${pdf}
</script>
<script>
${read("js/app.js")}
</script>
`;

fs.mkdirSync(path.join(ROOT, "dist"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "dist/artifact.html"), out);
console.log("dist/artifact.html written —", (out.length / 1024 / 1024).toFixed(2) + "MB");
