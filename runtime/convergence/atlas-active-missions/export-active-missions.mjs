import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const inbox = path.join(ROOT, "runtime/convergence/atlas-code-delivery/inbox");
const routed = path.join(ROOT, "runtime/convergence/lvtp-execution-chain/outbox");
const exportJson = path.join(ROOT, "runtime/convergence/atlas-github-bridge/export/atlas-latest.json");
const gatewayJson = path.join(ROOT, "runtime/convergence/atlas-knowledge-gateway/public/latest.json");

function files(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith(".md"))
    .map(f => path.join(dir, f));
}

function missionId(file) {
  return path.basename(file).replace(/\.md$/, "");
}

function routedFileFor(id) {
  const candidate = path.join(routed, `${id}_ROUTED.md`);
  return fs.existsSync(candidate) ? candidate : null;
}

function buildMission(file) {
  const id = missionId(file);
  const routedPath = routedFileFor(id);
  const hasRouted = Boolean(routedPath);

  return {
    missionId: id,
    sourceFile: path.relative(ROOT, file),
    status: hasRouted ? "ROUTED" : "RECEIVED",
    currentStage: hasRouted ? "Leonidas/Nexus" : "Atlas",
    routedTo: hasRouted ? ["Atlas", "Oracle", "Leonidas", "Nexus"] : ["Atlas"],
    deliverables: inferDeliverables(id),
    resultFiles: hasRouted ? [path.relative(ROOT, routedPath)] : [],
    nextAction: hasRouted
      ? "Nexus should generate requested proposal/specification artifacts."
      : "Atlas should classify and route the mission.",
    lastUpdated: new Date().toISOString()
  };
}

function inferDeliverables(id) {
  const upper = id.toUpperCase();

  if (upper.includes("RESTORE_MONI") || upper.includes("ASK_MONI")) {
    return [
      "ASK_MONI_ROOT_CAUSE_V1.md",
      "ASK_MONI_RECOVERY_PLAN_V1.md",
      "ASK_MONI_VALIDATION_V1.md"
    ];
  }

  if (upper.includes("DUPLICATE")) {
    return [
      "LVTP_DUPLICATE_DISCOVERY_REPORT_V1.md",
      "LVTP_DUPLICATE_RISK_REGISTER_V1.json",
      "LVTP_ARCHIVE_PROPOSAL_V1.md"
    ];
  }

  if (upper.includes("RESPONSE_CHANNEL") || upper.includes("ACTIVE_MISSIONS")) {
    return [
      "activeMissions section in atlas-latest.json",
      "activeMissions section in Knowledge Gateway latest.json"
    ];
  }

  return [];
}

function mergeIntoJson(target, activeMissions) {
  if (!fs.existsSync(target)) return false;

  const raw = fs.readFileSync(target, "utf8");
  const data = JSON.parse(raw);

  data.activeMissions = activeMissions;
  data.activeMissionsUpdatedAt = new Date().toISOString();

  fs.writeFileSync(target, JSON.stringify(data, null, 2) + "\n");
  return true;
}

const missions = files(inbox).map(buildMission);

const report = {
  generatedAt: new Date().toISOString(),
  system: "ATLAS_ACTIVE_MISSIONS_EXPORT_V1",
  missionCount: missions.length,
  missions
};

fs.writeFileSync(
  path.join(ROOT, "runtime/convergence/atlas-active-missions/active-missions.json"),
  JSON.stringify(report, null, 2) + "\n"
);

mergeIntoJson(exportJson, missions);
mergeIntoJson(gatewayJson, missions);

console.log("ATLAS ACTIVE MISSIONS EXPORT COMPLETE");
console.log(`Missions: ${missions.length}`);
