import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
const root = new URL("../", import.meta.url);
const files = new Set(["index.html", "styles.css", "favicon.svg", "app.js", "config.js", "core.mjs", "storage.mjs"]);
const types = { html: "text/html", css: "text/css", svg: "image/svg+xml", js: "text/javascript", mjs: "text/javascript" };
const server = createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const file = path === "/" ? "index.html" : path.slice(1);
    if (!["GET", "HEAD"].includes(request.method) || !files.has(file)) return response.writeHead(404).end("Not found");
    const content = await readFile(new URL(file, root));
    response.writeHead(200, { "Content-Type": `${types[file.split(".").pop()]}; charset=utf-8`, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
    response.end(request.method === "HEAD" ? undefined : content);
  } catch { response.writeHead(404).end("Not found"); }
});
server.listen(4174, "127.0.0.1", () => console.log("Worktime: http://127.0.0.1:4174"));
