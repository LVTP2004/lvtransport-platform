#!/usr/bin/env node

import fs from "fs";

const nodes = JSON.parse(
  fs.readFileSync("./nodes.json", "utf8")
);

console.log("");
console.log("MONI CLUSTER HEALTH");
console.log("");

for (const n of nodes) {
  console.log(
    `${n.label} | ${n.status.toUpperCase()} | ${n.environment}`
  );
}

console.log("");
console.log(`Nodes: ${nodes.length}`);
console.log(
  `Online: ${nodes.filter(n => n.status === "online").length}`
);
