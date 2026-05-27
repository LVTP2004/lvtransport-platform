import { connect, StringCodec } from "nats";
import pg from "pg";
import Redis from "ioredis";
import { interpretEvent } from "./semantic";
import { assessRisk } from "./risk";
import { shouldCreateIncident, buildIncident } from "./incident";

const sc = StringCodec();

async function main() {
  console.log("LVTP Moni Core Event Listener starting...");

  const nc = await connect({ servers: "127.0.0.1:4222" });
  const redis = new Redis("redis://127.0.0.1:6379");

  const db = new pg.Client({
    host: "127.0.0.1",
    port: 5432,
    user: "lvtp",
    password: "lvtp_dev_password",
    database: "lvtp",
  });

  await db.connect();

  await db.query(`
    CREATE TABLE IF NOT EXISTS runtime_events (
      id SERIAL PRIMARY KEY,
      event_type TEXT NOT NULL,
      payload JSONB NOT NULL,
      source TEXT DEFAULT 'moni-core-service',
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  const boot = {
    service: "moni-core-service",
    status: "online",
    node: "acer-linux",
    mode: "event-listener",
    timestamp: new Date().toISOString(),
    law: "LVTP AGENT LAW ACTIVE"
  };

  await redis.set("lvtp:moni-core:heartbeat", JSON.stringify(boot));
  await db.query(
    "INSERT INTO runtime_events(event_type, payload, source) VALUES($1, $2, $3)",
    ["moni.core.listener.started", boot, "moni-core-service"]
  );

  nc.publish("moni.core.listener.started", sc.encode(JSON.stringify(boot)));

  const subjects = [
    "booking.created",
    "dispatch.assigned",
    "ride.started",
    "ride.completed",
    "runtime.degraded",
    "runtime.recovered",
    "agent.proposal.created",
    "moni.semantic.state",
    "moni.cognitive.diagnosis"
  ];

  for (const subject of subjects) {
    const sub = nc.subscribe(subject);
    (async () => {
      for await (const msg of sub) {
        const raw = sc.decode(msg.data);
        let payload: any;

        try {
          payload = JSON.parse(raw);
        } catch {
          payload = { raw };
        }

        const inserted = await db.query(
          "INSERT INTO runtime_events(event_type, payload, source) VALUES($1, $2, $3) RETURNING id",
          [subject, payload, "nats"]
        );

        const semantic = interpretEvent(subject, payload);

        const semanticInserted = await db.query(
          "INSERT INTO event_semantics(event_id, event_type, semantic_status, meaning, risk_level) VALUES($1, $2, $3, $4, $5) RETURNING id",
          [inserted.rows[0].id, subject, semantic.semantic_status, semantic.meaning, semantic.risk_level]
        );

        const risk = assessRisk(subject, semantic);

        const riskInserted = await db.query(
          "INSERT INTO risk_assessments(semantic_id, event_type, risk_level, risk_score, recommendation) VALUES($1, $2, $3, $4, $5) RETURNING id",
          [semanticInserted.rows[0].id, subject, semantic.risk_level, risk.risk_score, risk.recommendation]
        );

        if (shouldCreateIncident(risk)) {
          const incident = buildIncident(subject, risk);

          await db.query(
            "INSERT INTO incidents(risk_id, event_type, severity, status, recommendation, recovery_action) VALUES($1, $2, $3, $4, $5, $6)",
            [riskInserted.rows[0].id, subject, incident.severity, "OPEN", incident.recommendation, incident.recovery_action]
          );

          nc.publish("incident.created", sc.encode(JSON.stringify({
            event_type: subject,
            severity: incident.severity,
            recovery_action: incident.recovery_action,
            recommendation: incident.recommendation,
            timestamp: new Date().toISOString()
          })));
        }

        await redis.set(`lvtp:risk:last:${subject}`, JSON.stringify({
          subject,
          semantic,
          risk,
          timestamp: new Date().toISOString()
        }));

        await redis.set(`lvtp:semantic:last:${subject}`, JSON.stringify({
          subject,
          semantic,
          timestamp: new Date().toISOString()
        }));

        await redis.set(`lvtp:last-event:${subject}`, JSON.stringify({
          subject,
          payload,
          timestamp: new Date().toISOString()
        }));

        console.log("event stored:", subject);
      }
    })();
  }

  setInterval(async () => {
    const hb = {
      service: "moni-core-service",
      status: "online",
      node: "acer-linux",
      mode: "event-listener",
      timestamp: new Date().toISOString()
    };

    await redis.set("lvtp:moni-core:heartbeat", JSON.stringify(hb));
    nc.publish("runtime.heartbeat", sc.encode(JSON.stringify(hb)));
    console.log("heartbeat", hb.timestamp);
  }, 30000);
}

main().catch((err) => {
  console.error("Moni Core Event Listener failed:", err);
  process.exit(1);
});
