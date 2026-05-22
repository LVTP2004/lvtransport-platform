import fs from "fs";

const docs = JSON.parse(
  fs.readFileSync(
    ".memory/operational-memory-index.json",
    "utf8"
  )
);

const keywords = [
  "phase",
  "transition",
  "migration",
  "deployment",
  "hardening",
  "validation",
  "consolidation",
  "recovery",
  "runtime"
];

const transitions = docs.filter(doc => {
  const text = JSON.stringify(doc).toLowerCase();

  return keywords.some(k => text.includes(k));
});

transitions.sort((a, b) => {
  const ad = a.dates?.[0] || "";
  const bd = b.dates?.[0] || "";
  return ad.localeCompare(bd);
});

console.log("");
console.log("==== OPERATIONAL TRANSITIONS ====");
console.log("");

let previous = null;

for (const doc of transitions.slice(0, 40)) {
  const title = doc.title || "unknown";
  const date = doc.dates?.[0] || "unknown-date";

  if (previous) {
    console.log("↓");
  }

  console.log(`${date}`);
  console.log(`→ ${title}`);
  console.log(`  ${doc.source}`);

  previous = title;
}

console.log("");
console.log("==== END TRANSITIONS ====");
console.log("");
