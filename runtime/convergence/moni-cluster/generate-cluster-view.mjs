#!/usr/bin/env node

import fs from "fs";

const NODES = "runtime/convergence/moni-cluster/nodes.json";
const OUTPUT = "runtime/convergence/moni-cluster/reports/cluster-view.md";

if (!fs.existsSync(NODES)) {
  console.error("nodes.json not found");
  process.exit(1);
}

const nodes = JSON.parse(fs.readFileSync(NODES, "utf8"));

const groups = {};

for (const node of nodes) {
  const domain = node.domain || "unknown";

  if (!groups[domain]) {
    groups[domain] = [];
  }

  groups[domain].push(node);
}

let out = [];

out.push("# MONI CLUSTER VIEW");
out.push("");
out.push(`Generated: ${new Date().toISOString()}`);
out.push("");

for (const [domain, entries] of Object.entries(groups)) {
  out.push(`## ${domain.toUpperCase()}`);
  out.push("");

  for (const n of entries) {
    out.push(
      `- ${n.label} | ${n.status} | ${n.environment} | ${n.location}`
    );
  }

  out.push("");
}

out.push("## SUMMARY");
out.push("");

out.push(`Total Nodes: ${nodes.length}`);
out.push(
  `Online Nodes: ${
    nodes.filter(n => n.status === "online").length
  }`
);

out.push("");

fs.writeFileSync(OUTPUT, out.join("\n"));

console.log(`REPORT=${OUTPUT}`);
