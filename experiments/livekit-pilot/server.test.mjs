import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createHmac} from 'node:crypto';
import {createPilotServer,makeToken,configuration,ORIGIN,ROOM} from './server.mjs';
const key='devkey',secret='local-test-only';
function decode(jwt) {
  const [head,body,sign]=jwt.split('.');
  assert.equal(createHmac('sha256',secret).update(head+'.'+body).digest('base64url'),sign);
  return JSON.parse(Buffer.from(body,'base64url').toString());
}
test('tokens have narrow, expiring room grants and unique identities',()=>{
  const a=decode(makeToken({role:'passenger',key,secret,now:1000,nonce:'abc'}));
  const b=decode(makeToken({role:'driver',key,secret,now:1000,nonce:'def'}));
  assert.equal(a.iss,key);assert.equal(a.sub,'pilot-passenger-abc');assert.equal(b.sub,'pilot-driver-def');
  assert.equal(a.exp,1600);assert.equal(a.video.room,ROOM);assert.equal(a.video.roomJoin,true);
  assert.equal(a.video.roomAdmin,false);assert.equal(a.video.roomCreate,false);
  assert.equal(a.video.canPublishData,false);
});
test('invalid role and missing dev configuration rejected',()=>{
  assert.throws(()=>makeToken({role:'admin',key,secret}));
  assert.throws(()=>configuration({LIVEKIT_PILOT_DEV:'0'}));
  assert.throws(()=>configuration({LIVEKIT_PILOT_DEV:'1',LIVEKIT_URL:'wss://example.org',LIVEKIT_API_KEY:key,LIVEKIT_API_SECRET:secret}));
});
test('token endpoint requires exact local origin/role, assets and bounded input',async()=>{
  const server=createPilotServer({key,secret,url:'ws://127.0.0.1:7880'});
  await new Promise(resolve=>server.listen(8799,'127.0.0.1',resolve));
  try {
    const request=(path,init)=>fetch(ORIGIN+path,init);
    const good=await request('/token',{method:'POST',headers:{Origin:ORIGIN,'Content-Type':'application/json'},body:JSON.stringify({role:'passenger'})});
    assert.equal(good.status,200);
    assert.equal(decode((await good.json()).token).video.room,ROOM);
    assert.equal((await request('/token',{method:'POST',headers:{Origin:'https://other.example','Content-Type':'application/json'},body:'{"role":"passenger"}'})).status,403);
    assert.equal((await request('/token',{method:'POST',headers:{Origin:ORIGIN,'Content-Type':'application/json'},body:'{"role":"admin"}'})).status,400);
    assert.equal((await request('/token',{method:'POST',headers:{Origin:ORIGIN,'Content-Type':'application/json'},body:'{"role":"passenger","user":"any"}'})).status,400);
    assert.equal((await request('/token',{method:'POST',headers:{Origin:ORIGIN,'Content-Type':'application/json'},body:'x'.repeat(300)})).status,413);
    assert.equal((await request('/token')).status,403);
    assert.equal((await request('/')).status,200);
    assert.equal((await request('/not-found')).status,404);
  } finally {await new Promise(resolve=>server.close(resolve));}
});
