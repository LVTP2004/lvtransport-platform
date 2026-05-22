import fs from "fs";
import path from "path";

const DOCS_DIR = "docs";

function readMarkdownFiles(dir) {
  const files = [];

  function walk(current) {
    if (!fs.existsSync(current)) return;

    for (const item of fs.readdirSync(current)) {
      const full = path.join(current, item);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) {
        walk(full);
      } else if (item.endsWith(".md")) {
        files.push(full);
      }
    }
  }

  walk(dir);
  return files;
}

async function main() {
  const files = readMarkdownFiles(DOCS_DIR);

  console.log("\n=================================");
  console.log("LVTransport Operational Memory");
  console.log("=================================\n");

  console.log(`Found ${files.length} markdown files:\n`);

  for (const file of files) {
    console.log(`- ${file}`);
  }

  console.log("\nOperational memory indexing prototype active.\n");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
