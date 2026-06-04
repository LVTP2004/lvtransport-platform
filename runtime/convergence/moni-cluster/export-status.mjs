#!/usr/bin/env node

import fs from "fs";

const nodes = JSON.parse(
  fs.readFileSync("./nodes.json", "utf8")
);

const output = {
  timestamp: new Date().toISOString(),
  totalNodes: nodes.length,
  onlineNodes: nodes.filter(
    n => n.status === "online"
  ).length,
  nodes
};

fs.writeFileSync(
  "./reports/cluster-status.json",
  JSON.stringify(output, null, 2)
);

console.log(
  "cluster-status.json generated"
);
