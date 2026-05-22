import fs from "fs";

const query = process.argv.slice(2).join(" ").toLowerCase();

if (!query) {
  console.log("usage: node replay-operations.mjs <query>");
  process.exit(1);
}

const docs = JSON.parse(
  fs.readFileSync(".memory/operational-memory-index.json", "utf8")
);

const matches = docs
  .filter(doc => JSON.stringify(doc).toLowerCase().includes(query))
  .sort((a, b) => {
    const ad = a.dates?.[0] || "";
    const bd = b.dates?.[0] || "";
    return ad.localeCompare(bd);
  });

console.log("");
console.log("==== OPERATIONAL REPLAY ====");
console.log("");
console.log(`query: ${query}`);
console.log(`events: ${matches.length}`);
console.log("");

for (const doc of matches.slice(0, 25)) {
  console.log("→ " + (doc.dates?.[0] || "unknown-date"));
  console.log("  " + doc.title);
  console.log("  source: " + doc.source);
  console.log("  domains: " + (doc.categories || []).join(", "));
  console.log("");
}

console.log("==== END REPLAY ====");
