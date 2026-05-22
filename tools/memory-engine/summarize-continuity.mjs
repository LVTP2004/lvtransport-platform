import fs from "fs";

const query = process.argv.slice(2).join(" ").toLowerCase();

if (!query) {
  console.log("usage: node summarize-continuity.mjs <query>");
  process.exit(1);
}

const docs = JSON.parse(
  fs.readFileSync(
    ".memory/operational-memory-index.json",
    "utf8"
  )
);

const matches = docs.filter(doc => {
  return JSON.stringify(doc)
    .toLowerCase()
    .includes(query);
});

console.log("");
console.log("==== OPERATIONAL CONTINUITY SUMMARY ====");
console.log("");

console.log(`query: ${query}`);
console.log(`matched documents: ${matches.length}`);
console.log("");

const categories = new Set();

for (const doc of matches) {
  for (const c of doc.categories || []) {
    categories.add(c);
  }
}

console.log("detected operational domains:");
console.log("");

for (const c of categories) {
  console.log(`- ${c}`);
}

console.log("");
console.log("chronological operational narrative:");
console.log("");

for (const doc of matches.slice(0, 15)) {
  console.log("--------------------------------");
  console.log(doc.title);
  console.log(doc.source);

  if (doc.dates?.length) {
    console.log(`dates: ${doc.dates.join(", ")}`);
  }

  console.log("");
}

console.log("==== END SUMMARY ====");
console.log("");
