import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://seo-essay.vercel.app/"; // ← замени на свой домен
const PROJECT_ROOT = path.resolve(__dirname, "..", ".."); // корень статического сайта
const OUTPUT_PATH = path.join(PROJECT_ROOT, "sitemap.xml"); // сайтмап лежит рядом с index.html
const EXCLUDED_DIRS = new Set([".git", "node_modules", ".next", "dist"]);

function scanForHtml(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let urls = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) {
        continue;
      }
      urls = urls.concat(scanForHtml(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      const relative = fullPath
        .replace(PROJECT_ROOT, "")
        .replace(/\\/g, "/");

      urls.push(relative || "/index.html");
    }
  }

  return urls;
}

function generateSitemap() {
  const pages = Array.from(new Set(scanForHtml(PROJECT_ROOT))).sort();
  const normalizedBase = BASE_URL.replace(/\/+$/, "");

  const xmlItems = pages
    .map(url => {
      const cleanPath = url.startsWith("/") ? url : `/${url}`;
      return `
  <url>
    <loc>${normalizedBase}${cleanPath}</loc>
  </url>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${xmlItems}
</urlset>`;

  fs.writeFileSync(OUTPUT_PATH, xml);
  console.log("Sitemap created:", OUTPUT_PATH);
}

generateSitemap();
