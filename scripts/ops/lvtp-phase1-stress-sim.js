const {execSync}=require('child_process');
(async()=>{
const base='http://127.0.0.1:4000/api/v1';
const phases=[25,50,75,125,175,200,150,75,25,3,2,1]; const durations=[10,10,10,10,10,10,10,10,10,4,4,4];
let created=[]; let metrics=[];
async function req(path,opts={}){const t=Date.now();try{const r=await fetch(base+path,{headers:{'content-type':'application/json',...(opts.headers||{})},...opts});const j=await r.json().catch(()=>({}));return {ok:r.ok,status:r.status,ms:Date.now()-t,body:j};}catch(e){return {ok:false,status:0,ms:Date.now()-t,err:String(e)}}}
function pick(){const x=Math.random()*100; return x<40?'create':x<60?'track':x<75?'price':x<85?'nav':x<95?'reconnect':'invalid';}
async function action(i){const type=pick(); if(type==='create'){const r=await req('/bookings',{method:'POST',body:JSON.stringify({customerId:'c'+i,pickupAddress:'A',dropoffAddress:'B',distanceKm:5})}); if(r.ok&&r.body.booking) created.push(r.body.booking); return {type,...r};}
if(type==='track'){if(!created.length) return {type,...await req('/health')}; const b=created[Math.floor(Math.random()*created.length)]; return {type,...await req('/tracking/'+b.trackingCode)};}
if(type==='price') return {type,...await req('/maps/quote?pickup=50.85,4.35&dropoff=50.86,4.36')};
if(type==='nav') return {type,...await req('/health')};
if(type==='reconnect') return {type,...await req('/operations/diagnostics')};
if(!created.length) return {type,...await req('/bookings/nonexistent/status',{method:'POST',body:JSON.stringify({status:'completed',actor:'driver'})})}; const b=created[Math.floor(Math.random()*created.length)]; return {type,...await req('/bookings/'+b.id+'/status',{method:'POST',body:JSON.stringify({status:'pending',actor:'driver'})})};}
for(let p=0;p<phases.length;p++){
 let samples=[],cpu=[],ram=[]; const end=Date.now()+durations[p]*1000;
 while(Date.now()<end){const batch=await Promise.all(Array.from({length:phases[p]},(_,i)=>action(i+1))); samples.push(...batch); try{const out=execSync("ps -p $(cat /tmp/lvtp-api.pid) -o %cpu=,%mem=").toString().trim().split(/\s+/); cpu.push(Number(out[0])); ram.push(Number(out[1]));}catch{}}
 const lat=samples.map(s=>s.ms).sort((a,b)=>a-b); const p95=lat[Math.floor(lat.length*0.95)]||0;
 metrics.push({phase:p+1,users:phases[p],seconds:durations[p],requests:samples.length,success:samples.filter(s=>s.ok).length,errors:samples.filter(s=>!s.ok).length,p95,cpuMax:Math.max(...cpu,0),cpuAvg:cpu.reduce((a,b)=>a+b,0)/(cpu.length||1),ramMax:Math.max(...ram,0),ramAvg:ram.reduce((a,b)=>a+b,0)/(ram.length||1)});
}
console.log(JSON.stringify({metrics,totalBookings:created.length},null,2));
})();
