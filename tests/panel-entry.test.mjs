import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';

// Use the existing Vite/esbuild installation; no added test dependencies.
const root = process.cwd();
const appRequire = createRequire(path.join(root, 'apps/admin/package.json'));
const viteRequire = createRequire(appRequire.resolve('vite'));
const { build } = viteRequire('esbuild');
const React = appRequire('react');
const { renderToStaticMarkup } = appRequire('react-dom/server');

for (const app of ['admin', 'driver']) {
  test(`${app}: entry cannot mount operations using client-supplied identity`, async () => {
    const result = await build({
      entryPoints: [path.join(root, `apps/${app}/src/app/VerifiedPortal.tsx`)],
      bundle: true, write: false, format: 'cjs', platform: 'node', jsx: 'automatic',
      external: ['react', 'react/*'], define: { 'import.meta.env': '{}' },
    });
    const module = { exports: {} };
    new Function('require', 'module', 'exports', 'window', result.outputFiles[0].text)(
      appRequire, module, module.exports, { location: { href: `https://portal.example.invalid/${app}/` } },
    );
    const html = renderToStaticMarkup(React.createElement(module.exports.App, {
      isAuthenticated: true, role: app, token: 'synthetic-token',
      children: React.createElement('p', null, 'UNAUTHORIZED_CHILD'),
    }));
    assert.match(html, /Sign in to access this panel/);
    assert.match(html, /<input[^>]+type="email"/);
    assert.doesNotMatch(html, /UNAUTHORIZED_CHILD|synthetic-token|password123|runtime-access-token|type="password"/);
    assert.deepEqual(Object.keys(module.exports), ['App']);
  });

  test(`${app}: browser entry bypasses legacy App.js`, async () => {
    const main = await readFile(path.join(root, `apps/${app}/src/main.tsx`), 'utf8');
    assert.match(main, /from '\.\/app\/VerifiedPortal'/);
    assert.doesNotMatch(main, /from '\.\/app\/App'/);
    const html = await readFile(path.join(root, `apps/${app}/index.html`), 'utf8');
    assert.match(html, /src="\/src\/main\.tsx"/);
  });
}
