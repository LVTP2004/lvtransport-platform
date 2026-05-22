import fs from "fs";

const query = process.argv.slice(2).join(" ").toLowerCase() || "incident";

const docs = JSON.parse(
  fs.readFileSync(".memory/operational-memory-index.json", "utf8")
);

const matches = docs.filter(doc => {
  const text = JSON.stringify(doc).toLowerCase();
  return (
    text.includes(query) ||
    text.includes("incident") ||
    text.includes("recovery") ||
    text.includes("failure") ||
    text.includes("audit")
  );
});

const domains = new Set();
const recoveryDocs = [];
const auditDocs = [];

for (const doc of matches) {
  for (const c of doc.categories || []) domains.add(c);

  const text = JSON.stringify(doc).toLowerCase();

  if (text.includes("recovery")) recoveryDocs.push(doc);
  if (text.includes("audit")) auditDocs.push(doc);
}

console.log("");
console.log("==== INCIDENT INTELLIGENCE SUMMARY ====");
console.log("");
console.log(`query: ${query}`);
console.log(`matched docs: ${matches.length}`);
console.log("");

console.log("detected domains:");
for (const d of domains) console.log(`- ${d}`);

console.log("");
console.log("likely recovery references:");
for (const doc of recoveryDocs.slice(0, 10)) {
  console.log(`- ${doc.title} | ${doc.source}`);
}

console.log("");
console.log("audit / validation references:");
for (const doc of auditDocs.slice(0, 10)) {
  console.log(`- ${doc.title} | ${doc.source}`);
}

console.log("");
console.log("incident continuity:");
for (const doc of matches.slice(0, 15)) {
  console.log(`→ ${doc.dates?.[0] || "unknown-date"} | ${doc.title}`);
  console.log(`  ${doc.source}`);
}

console.log("");
console.log("==== END INCIDENT SUMMARY ====");
