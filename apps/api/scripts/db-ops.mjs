#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const cwd = process.cwd();
const defaultDbPath = path.resolve(cwd, 'data/lvtransport.sqlite');

function resolveDbPath() {
  const envPath = process.env.LVTP_SQLITE_PATH || process.env.SQLITE_PATH || process.env.DATABASE_PATH;
  if (envPath) return path.resolve(cwd, envPath);
  const url = process.env.DATABASE_URL;
  if (url?.startsWith('file:')) return path.resolve(cwd, url.slice(5));
  return defaultDbPath;
}
function parseArgs(argv) { const out = {}; for (let i=0;i<argv.length;i++){const t=argv[i]; if(!t.startsWith('--')) continue; const k=t.slice(2); const v=argv[i+1]&&!argv[i+1].startsWith('--')?argv[++i]:'true'; out[k]=v;} return out; }
function openDb(dbPath) { if (!fs.existsSync(dbPath)) return null; return new DatabaseSync(dbPath, { open: true, readOnly: true }); }
function getColumns(db, table) { return db.prepare(`PRAGMA table_info(${table})`).all().map((r) => r.name); }
function tableExists(db, table) { if (!db) return false; return Boolean(db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(table)); }

function buildInspectQuery(table, columns, args) {
  const where=[]; const params=[]; const add=(c,o,v)=>{where.push(`${c} ${o} ?`); params.push(v);};
  if(columns.includes('status')&&args.status) add('status','=',''+args.status);
  if(columns.includes('correlation_id')&&args.correlation_id) add('correlation_id','=',''+args.correlation_id);
  if(columns.includes('request_id')&&args.request_id) add('request_id','=',''+args.request_id);
  if(columns.includes('actor_id')&&args.actor_id) add('actor_id','=',''+args.actor_id);
  if(columns.includes('created_at')&&args.created_from) add('created_at','>=',''+args.created_from);
  if(columns.includes('created_at')&&args.created_to) add('created_at','<=',''+args.created_to);
  const limit=Number.isFinite(Number(args.limit))?Math.max(0,Number(args.limit)):100;
  const offset=Number.isFinite(Number(args.offset))?Math.max(0,Number(args.offset)):0;
  const whereSql=where.length?` WHERE ${where.join(' AND ')}`:'';
  const orderSql=columns.includes('created_at')?' ORDER BY created_at DESC':'';
  return {sql:`SELECT * FROM ${table}${whereSql}${orderSql} LIMIT ? OFFSET ?`,params:[...params,limit,offset],limit,offset};
}
function inspectTable(db, table, args){ if(!db||!tableExists(db,table)) return {table,rows:[],count:0,limit:0,offset:0,available:false}; const cols=getColumns(db,table); const q=buildInspectQuery(table,cols,args); const rows=db.prepare(q.sql).all(...q.params); return {table,rows,count:rows.length,limit:q.limit,offset:q.offset,available:true}; }
function detectLastBackupTimestamp(dbPath){ const dir=path.dirname(dbPath); if(!fs.existsSync(dir)) return null; const files=fs.readdirSync(dir).filter((f)=>/backup|\.bak$/i.test(f)); let latest=null; for(const f of files){const st=fs.statSync(path.join(dir,f)); if(!latest||st.mtimeMs>latest.mtimeMs) latest=st;} return latest?new Date(latest.mtimeMs).toISOString():null; }
function getHealth(db, dbPath){ const out={sqliteOk:Boolean(db),schemaVersion:null,integrityStatus:null,dbPath,lastBackupTimestamp:detectLastBackupTimestamp(dbPath),failedRecoveryEventCount:null,recoveryEventCount:null}; if(!db) return out; out.schemaVersion=db.prepare('PRAGMA schema_version').get()?.schema_version??null; out.integrityStatus=db.prepare('PRAGMA integrity_check').get()?.integrity_check??null; if(tableExists(db,'recovery_events')){ const cols=getColumns(db,'recovery_events'); out.recoveryEventCount=db.prepare('SELECT COUNT(*) AS c FROM recovery_events').get()?.c??0; if(cols.includes('status')) out.failedRecoveryEventCount=db.prepare("SELECT COUNT(*) AS c FROM recovery_events WHERE status = 'failed'").get()?.c??0; } return out; }

const [command,...rest]=process.argv.slice(2); const args=parseArgs(rest); const dbPath=resolveDbPath(); const db=openDb(dbPath);
let output;
try{ switch(command){ case 'inspect-audit': output=inspectTable(db,'audit_events',args); break; case 'inspect-recovery': output=inspectTable(db,'recovery_events',args); break; case 'inspect-messages': output=inspectTable(db,'message_events',args); break; case 'export-audit': output=inspectTable(db,'audit_events',{...args,limit:args.limit??10000,offset:args.offset??0}); break; case 'export-recovery': output=inspectTable(db,'recovery_events',{...args,limit:args.limit??10000,offset:args.offset??0}); break; case 'health': output=getHealth(db,dbPath); break; default: output={error:'Unknown command',command}; }} catch { output={error:'Operational inspection failed',command}; } finally { db?.close(); }
process.stdout.write(`${JSON.stringify(output)}\n`);
