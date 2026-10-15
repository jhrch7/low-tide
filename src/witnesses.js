import {player,distance,toast,clamp} from './core.js';
export function noticeCrime(s,severity,canSee,range=90){
 const p=player(s);if(s.interior)return false;
 if([...s.police||[],...s.patrols||[]].some(u=>u.health>0&&distance(u,p)<100&&canSee(u,p))){publish(s,{x:p.x,z:p.z,severity,carId:s.car});return true}
 const witness=(s.npcs||[]).filter(n=>n.hp>0&&n.role==='civilian'&&distance(n,p)<range&&canSee(n,p)).sort((a,b)=>distance(a,p)-distance(b,p))[0];
 if(!witness)return false;s.pendingReports??=[];const existing=s.pendingReports.find(r=>r.witness===witness.id);
 if(existing){existing.severity=clamp(existing.severity+severity,0,5);existing.x=p.x;existing.z=p.z;existing.carId=s.car}else{s.pendingReports.push({witness:witness.id,x:p.x,z:p.z,severity,carId:s.car,clock:3.5});toast(s,`${witness.name||'A witness'} is calling police.`)}return true;
}
function publish(s,r){s.heat=clamp(s.heat+r.severity,0,5);s.search=45;s.lastKnown={x:r.x,z:r.z};s.flags.lastReportAt=s.elapsed||0;if(r.carId){s.hotCars??={};s.hotCars[r.carId]={until:(s.elapsed||0)+600,heat:Math.max(1,Math.ceil(r.severity))}}}
export function tickReports(s,dt){for(const r of s.pendingReports||[]){const n=s.npcs?.find(n=>n.id===r.witness);if(!n||n.hp<=0){r.cancelled=true;continue}r.clock-=dt;if(r.clock<=0){publish(s,r);r.cancelled=true}}s.pendingReports=(s.pendingReports||[]).filter(r=>!r.cancelled)}
export function quietWitness(s){const p=player(s),report=s.pendingReports?.find(r=>{const n=s.npcs?.find(n=>n.id===r.witness);return n&&distance(n,p)<3});if(!report)return false;if(s.cash<180){toast(s,'The witness will not stop calling. You need $180 for a quiet settlement.');return true}s.cash-=180;s.pendingReports=s.pendingReports.filter(r=>r!==report);s.stats.bribes=(s.stats.bribes||0)+1;toast(s,'Quiet settlement · $180. The witness puts the phone away.');return true}
