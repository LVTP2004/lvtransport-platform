#!/usr/bin/env node

import fs from "fs";

const nodes = JSON.parse(
  fs.readFileSync("./nodes.json", "utf8")
);

const groups = {};

for (const n of nodes) {
  const env = n.environment;

  if (!groups[env]) {
    groups[env] = [];
  }

  groups[env].push(n);
}

console.log("");
console.log("MONI CLUSTER MAP");
console.log("");

for (const [env, list] of Object.entries(groups)) {
  console.log(`├── ${env.toUpperCase()}`);

  for (const n of list) {
    console.log(`│   ├── ${n.label} [${n.status}]`);
  }

  console.log("");
}
