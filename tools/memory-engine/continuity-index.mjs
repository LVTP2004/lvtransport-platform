import fs from "fs";
import path from "path";

const DOCS_DIR = "docs";
const OUT_DIR = ".memory";

const CATEGORIES = {
  incidents: ["incident", "failure", "error", "recovery", "disaster"],
  migrations: ["migration", "migrate", "database", "sqlite", "postgres"],
  recovery: ["recovery", "rollback", "backup", "restore"],
  security: ["security", "auth", "firewall", "guardrail"],
  deployment: ["deployment", "production", "release", "route"],
  product: ["product", "ux", "booking", "driver", "customer"],
  governance: ["ai", "codex", "governance", "agent", "memory"],
  observability: ["observability", "prometheus", "grafana", "loki", "monitoring"]
};

function walk(dir) {
  let files = [];
  if (!fs.existsSync(dir)) return files;

  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) files = files.concat(walk(full));
    else if (item.endsWith(".md")) files.push(full);
  }

  return files;
}

function titleOf(text, file) {
  const match = text.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : path.basename(file);
}

function datesOf(text) {
  return [...new Set(text.match(/\b20\d{2}-\d{2}-\d{2}\b/g) || [])];
}

function classify(text, file) {
  const haystack = `${file}\n${text}`.toLowerCase();
  return Object.entries(CATEGORIES)
    .filter(([, words]) => words.some(w => haystack.includes(w)))
    .map(([cat]) => cat);
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const files = walk(DOCS_DIR);
  const records = files.map(file => {
    const text = fs.readFileSync(file, "utf8");
    return {
      source: file,
      title: titleOf(text, file),
      dates: datesOf(text),
      categories: classify(text, file),
      size: text.length
    };
  });

  fs.writeFileSync(
    path.join(OUT_DIR, "operational-memory-index.json"),
    JSON.stringify(records, null, 2)
  );

  let timeline = "# LVTransport Continuity Timeline\n\n";
  for (const r of records) {
    timeline += `## ${r.title}\n`;
    timeline += `- source: ${r.source}\n`;
    timeline += `- dates: ${r.dates.length ? r.dates.join(", ") : "unknown"}\n`;
    timeline += `- categories: ${r.categories.length ? r.categories.join(", ") : "unknown"}\n\n`;
  }

  fs.writeFileSync(path.join(OUT_DIR, "continuity-timeline.md"), timeline);

  let summary = "# LVTransport Continuity Summary\n\n";
  for (const cat of Object.keys(CATEGORIES)) {
    const matches = records.filter(r => r.categories.includes(cat));
    summary += `## ${cat}\n`;
    summary += matches.length
      ? matches.map(r => `- ${r.title} — ${r.source}`).join("\n")
      : "- unknown";
    summary += "\n\n";
  }

  fs.writeFileSync(path.join(OUT_DIR, "continuity-summary.md"), summary);

  console.log(`Indexed ${records.length} docs.`);
  console.log("Generated:");
  console.log("- .memory/operational-memory-index.json");
  console.log("- .memory/continuity-timeline.md");
  console.log("- .memory/continuity-summary.md");
}

main();
