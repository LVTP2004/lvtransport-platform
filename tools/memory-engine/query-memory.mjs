import fs from "fs";

const q = process.argv.slice(2).join(" ").toLowerCase();
if (!q) {
  console.log("usage: node tools/memory-engine/query-memory.mjs <query>");
  process.exit(1);
}

const docs = JSON.parse(fs.readFileSync(".memory/operational-memory-index.json", "utf8"));
const hits = docs.filter(d => JSON.stringify(d).toLowerCase().includes(q));

console.log(`query: ${q}`);
console.log(`results: ${hits.length}`);

for (const d of hits.slice(0, 20)) {
  console.log(`- ${d.title} | ${d.source} | ${(d.categories || []).join(", ")}`);
}
