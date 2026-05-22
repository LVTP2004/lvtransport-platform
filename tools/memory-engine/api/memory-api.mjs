import http from "http";
import fs from "fs";
import path from "path";

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || "127.0.0.1";
const MEMORY_DIR = process.env.MEMORY_DIR || ".memory";

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload, null, 2));
}

function memoryPath(file) {
  return path.join(process.cwd(), MEMORY_DIR, file);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(memoryPath(file), "utf8"));
}

function readText(file) {
  return fs.readFileSync(memoryPath(file), "utf8");
}

function buildDashboard() {
  const index = readJson("operational-memory-index.json");
  const byCategory = {};

  for (const item of index) {
    const categories = item.categories?.length ? item.categories : ["unknown"];

    for (const cat of categories) {
      if (!byCategory[cat]) byCategory[cat] = [];

      byCategory[cat].push({
        title: item.title || "unknown",
        source: item.source || "unknown",
        dates: item.dates || [],
        size: item.size || 0
      });
    }
  }

  return {
    ok: true,
    service: "lvtransport-memory-api",
    generated_at: new Date().toISOString(),
    total_docs: index.length,
    categories: Object.fromEntries(
      Object.entries(byCategory).map(([cat, items]) => [
        cat,
        {
          count: items.length,
          items: items.slice(0, 10)
        }
      ])
    )
  };
}

const server = http.createServer((req, res) => {
  try {
    if (req.method === "OPTIONS") {
      return sendJson(res, 200, { ok: true });
    }

    if (req.method !== "GET") {
      return sendJson(res, 405, { error: "method_not_allowed" });
    }

    const url = new URL(req.url, `http://${req.headers.host || HOST}`);

    if (url.pathname === "/health") {
      return sendJson(res, 200, {
        ok: true,
        service: "lvtransport-memory-api",
        memory_dir: MEMORY_DIR
      });
    }

    if (url.pathname === "/memory/index") {
      return sendJson(res, 200, readJson("operational-memory-index.json"));
    }

    if (url.pathname === "/memory/summary") {
      return sendJson(res, 200, {
        markdown: readText("continuity-summary.md")
      });
    }

    if (url.pathname === "/memory/timeline") {
      return sendJson(res, 200, {
        markdown: readText("continuity-timeline.md")
      });
    }

    if (url.pathname === "/memory/dashboard") {
      return sendJson(res, 200, buildDashboard());
    }

    return sendJson(res, 404, { error: "not_found" });
  } catch (err) {
    return sendJson(res, 500, {
      error: "internal_error",
      message: err.message
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`LVTransport Memory API running on http://${HOST}:${PORT}`);
});
