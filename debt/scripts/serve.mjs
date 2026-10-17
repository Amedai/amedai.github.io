import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const publicFiles = new Set(["index.html", "styles.css", "favicon.svg", "config.js", "app.js", "core.mjs", "storage.mjs"]);
const types = { html: "text/html", css: "text/css", svg: "image/svg+xml", js: "text/javascript", mjs: "text/javascript" };
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, "http://localhost").pathname;
    const file = pathname === "/" ? "index.html" : decodeURIComponent(pathname.slice(1));
    if (!["GET", "HEAD"].includes(request.method) || !publicFiles.has(file)) {
      response.writeHead(404).end("Not found");
      return;
    }
    const content = await readFile(fileURLToPath(new URL(file, root)));
    response.writeHead(200, { "Content-Type": `${types[file.split(".").pop()]}; charset=utf-8`, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
    response.end(request.method === "HEAD" ? undefined : content);
  } catch { response.writeHead(404).end("Not found"); }
});
server.listen(4173, "127.0.0.1", () => console.log("Долги: http://127.0.0.1:4173"));
