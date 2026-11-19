import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';
const require = createRequire(path.join(process.cwd(), 'apps/admin/package.json'));
const { build } = createRequire(require.resolve('vite'))('esbuild');
const output = await build({ entryPoints: [path.join(process.cwd(), 'apps/web/src/modules/moni/services/booking-status-client.ts')],
  bundle: true, write: false, platform: 'node', format: 'cjs' });
const module = { exports: {} };
new Function('require','module','exports',output.outputFiles[0].text)(require,module,module.exports);
const { readBookingStatus } = module.exports;
const reference = 'LV-SYNTHETIC-TEST';
const response = (body, status=200) => new Response(JSON.stringify(body), { status });

test('Moni reads the actual matching reference/status without inventing driver, ETA or payment', async () => {
  let requested;
  const status = await readBookingStatus('  lv-synthetic-test ', 'https://synthetic.invalid/api/v1/', async (url, options) => {
    requested = { url, options };
    return response({ success:true,booking:{referenceCode:reference,status:'in_progress',driver:'must-not-be-returned',eta:5} });
  });
  assert.deepEqual(status,{referenceCode:reference,status:'in_progress'});
  assert.equal(requested.url, 'https://synthetic.invalid/api/v1/tracking/booking/' + reference);
  assert.equal(requested.options.cache,'no-store');
});

test('unknown, mismatched and failed tracking is never reported as a confirmed booking status', async () => {
  for (const body of [{success:false}, {success:true,booking:{referenceCode:'LV-OTHER',status:'completed'}},
    {success:true,booking:{referenceCode:reference,status:'paid'}}, {success:true}]) {
    await assert.rejects(readBookingStatus(reference,'https://synthetic.invalid',async()=>response(body)));
  }
  await assert.rejects(readBookingStatus(reference,'https://synthetic.invalid',async()=>response({},404)));
  await assert.rejects(readBookingStatus('../escape','https://synthetic.invalid',async()=>assert.fail('invalid reference must not fetch')));
});
