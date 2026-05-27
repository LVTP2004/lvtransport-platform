import express from "express";
import pg from "pg";
import Redis from "ioredis";

const app = express();

const db = new pg.Client({
  host: "127.0.0.1",
  port: 5432,
  user: "lvtp",
  password: "lvtp_dev_password",
  database: "lvtp"
});

await db.connect();

const redis = new Redis("redis://127.0.0.1:6379");

app.get("/", async (_, res) => {
  const events = await db.query(`
    SELECT id,event_type,created_at
    FROM runtime_events
    ORDER BY id DESC
    LIMIT 10
  `);

  const risks = await db.query(`
    SELECT id,event_type,risk_level,risk_score
    FROM risk_assessments
    ORDER BY id DESC
    LIMIT 10
  `);

  const incidents = await db.query(`
    SELECT id,event_type,severity,status
    FROM incidents
    ORDER BY id DESC
    LIMIT 10
  `);

  const heartbeat = await redis.get("lvtp:moni-core:heartbeat");

  res.send(`
  <html>
  <body style="font-family:Arial;padding:20px;background:#111;color:#eee">
    <h1>LVTP MONI DASHBOARD</h1>

    <h2>Heartbeat</h2>
    <pre>${heartbeat}</pre>

    <h2>Events</h2>
    <pre>${JSON.stringify(events.rows,null,2)}</pre>

    <h2>Risks</h2>
    <pre>${JSON.stringify(risks.rows,null,2)}</pre>

    <h2>Incidents</h2>
    <pre>${JSON.stringify(incidents.rows,null,2)}</pre>
  </body>
  </html>
  `);
});

app.listen(4010, () => {
  console.log("Moni Dashboard running on http://localhost:4010");
});
