import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(import.meta.url), "../../dist");
const prefix = "/agentle-ui";
const port = Number(process.env.PORT ?? 4173);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");

  if (!url.pathname.startsWith(prefix)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  let relativePath = url.pathname.slice(prefix.length) || "/";
  if (relativePath.endsWith("/")) {
    relativePath += "index.html";
  }

  const candidates = extname(relativePath)
    ? [join(root, relativePath)]
    : [join(root, relativePath), join(root, "index.html")];

  for (const filePath of candidates) {
    try {
      const data = await readFile(filePath);
      const contentType = mimeTypes[extname(filePath)] ?? "application/octet-stream";
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
      return;
    } catch {
      // try next candidate
    }
  }

  try {
    const html = await readFile(join(root, "index.html"));
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  } catch {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Failed to serve docs preview");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Local: http://127.0.0.1:${port}${prefix}/`);
});
