#!/usr/bin/env node

import fs from "fs";

const nodes = JSON.parse(
  fs.readFileSync(
    "runtime/convergence/moni-cluster/nodes.json",
    "utf8"
  )
);

console.log("");
console.log("MONI CLUSTER");
console.log("");

const domains = {};

for (const n of nodes) {
  if (!domains[n.domain]) {
    domains[n.domain] = [];
  }

  domains[n.domain].push(n);
}

for (const [domain, list] of Object.entries(domains)) {
  console.log(`├── ${domain.toUpperCase()}`);

  for (const n of list) {
    console.log(`│   ├── ${n.label} [${n.status}]`);
  }
}

console.log("");
