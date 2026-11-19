/** Prepare an isolated session-client release from a verified public-web snapshot.
 * No network calls or writes to the snapshot/production. Retains all UI and CSS.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(path.join(process.cwd(), 'apps/admin/package.json'));
const { transform } = createRequire(require.resolve('vite'))('esbuild');
const [snapshotArg, outputArg] = process.argv.slice(2);
if (!snapshotArg || !outputArg) throw new Error('Usage: node prepare-session-patch.mjs SNAPSHOT OUTPUT');
const snapshot = fs.realpathSync(snapshotArg), output = path.resolve(outputArg);
if (!output.startsWith('/tmp/') || fs.existsSync(output) || output.startsWith(snapshot + '/')) {
  throw new Error('Use a new output directory under /tmp, outside the snapshot');
}
const sha = data => crypto.createHash('sha256').update(data).digest('hex');
const source = fs.readFileSync('packages/auth/src/services/operations-client.ts', 'utf8');
const compiled = (await transform(source.replace(/^export /gm, ''), {
  loader: 'ts', target: 'es2022', minifyWhitespace: true, minifySyntax: true,
})).code;
const expression = `(()=>{${compiled}\nreturn VerifiedOperationsClient;})()`;
const tag = 'session-' + sha(source).slice(0, 12);
const entries = [];
function walk(directory) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    if (item.isSymbolicLink()) throw new Error('Snapshot symlinks are unsupported');
    const filename = path.join(directory, item.name);
    if (item.isDirectory()) walk(filename);
    else if (item.isFile() && filename.endsWith('.html')) entries.push(path.relative(snapshot, filename));
  }
}
walk(snapshot);
const assets = path.join(snapshot, 'assets');
const scripts = new Map(fs.readdirSync(assets).filter(n => n.endsWith('.js')).map(n => [n, fs.readFileSync(path.join(assets, n), 'utf8')]));
const reachable = new Set();
function visit(text) {
  for (const [name, content] of scripts) if (text.includes(name) && !reachable.has(name)) {
    reachable.add(name); visit(content);
  }
}
for (const name of entries) visit(fs.readFileSync(path.join(snapshot, name), 'utf8'));
if (!reachable.size) throw new Error('No deployed JavaScript entry graph');
const names = new Map([...reachable].map(n => [n, n.replace(/\.js$/, `-${tag}.js`)]));
function rename(text) { for (const [before, after] of names) text = text.replaceAll(before, after); return text; }
const files = {}, replacements = [];
fs.mkdirSync(output);
function write(name, content, beforeName = name) {
  const dest = path.join(output, name); fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, content);
  files[name] = { before_path: beforeName, before_sha256: sha(fs.readFileSync(path.join(snapshot, beforeName))), after_sha256: sha(content) };
}
for (const name of reachable) {
  const original = scripts.get(name);
  const parsed = ts.createSourceFile(name, original, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  if (parsed.parseDiagnostics.length) throw new Error(`Cannot parse ${name}`);
  const clients = parsed.statements.filter(n => ts.isClassDeclaration(n) && n.name
    && n.getText(parsed).includes('Unsupported operation route') && n.getText(parsed).includes('INVALID_API_RESPONSE'));
  if (clients.length > 1) throw new Error('Ambiguous client class');
  let updated = original;
  if (clients.length) {
    const node = clients[0], old = node.getText(parsed);
    const methods = node.members.filter(ts.isMethodDeclaration).map(n => n.name.getText(parsed));
    if (methods.join(',') !== 'connect,request,disconnect') throw new Error('Unexpected deployed client interface');
    updated = original.slice(0, node.getStart(parsed)) + `const ${node.name.text}=${expression};` + original.slice(node.end);
    replacements.push({ file: name, previous_class_sha256: sha(old), source_sha256: sha(source) });
  }
  updated = rename(updated);
  await transform(updated, { loader: 'js', target: 'es2022' }); // Parse actual deliverable; preserve its bytes.
  write('assets/' + names.get(name), updated, 'assets/' + name);
}
if (!replacements.length) throw new Error('No supported session client found');
for (const name of entries) {
  const original = fs.readFileSync(path.join(snapshot, name), 'utf8'), updated = rename(original);
  if (updated !== original) write(name, updated);
}
// Every renamed dependency exists; original CSS/static references stay unchanged.
for (const [name, content] of scripts) if (reachable.has(name)) {
  for (const prior of reachable) if (content.includes(prior) && !fs.existsSync(path.join(output, 'assets', names.get(prior)))) {
    throw new Error('Missing renamed dependency');
  }
}
fs.writeFileSync(path.join(output, 'deployed-client.cjs'), `module.exports={VerifiedOperationsClient:${expression}};\n`);
const manifest = { schema: 'lvtransport/session-patch/v1', source: 'packages/auth/src/services/operations-client.ts',
  source_sha256: sha(source), tag, files, replacements, css_changed: false, public_copy_changed: false };
fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ output, scripts: reachable.size, clients: replacements.length, files: Object.keys(files).length, source_sha256: manifest.source_sha256 }));
