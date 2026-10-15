import {player,distance,wrap,toast} from './core.js';
import {sight} from './police.js';
export function toggleCrouch(s){if(s.car)return false;const p=player(s);p.crouched=!p.crouched;return true}
export function detection(s,n){const p=player(s),d=distance(n,p),night=s.time<6||s.time>19,range=(night?20:32)*(p.crouched?.62:1)*(s.weather==='rain'?.75:1);if(s.interior||d>range||!sight(n,p)||Math.abs(wrap(Math.atan2(p.x-n.x,p.z-n.z)-n.angle))>1.05)return 0;return Math.max(.1,1-d/range)*(p.crouched?.45:1)}
export function tickStealth(s,dt){
 const p=player(s);s.detection=0;
 for(const n of s.npcs||[]){if(n.hp<=0||n.role!=='guard'||n.faction!=='meridian'||n.state==='hostile'||n.operation)continue;
  const restricted=distance(p,{x:n.homeX,z:n.homeZ})<28,signal=restricted?detection(s,n):0;n.suspicion=Math.max(0,Math.min(1,(n.suspicion||0)+dt*(signal>0?signal*.65:-.22)));s.detection=Math.max(s.detection,n.suspicion);
  if(n.suspicion>.18&&!n.warned){n.warned=true;toast(s,'Meridian security: Private yard. Keep moving. Crouch and stay out of sight.')}
  if(n.suspicion>=1){n.state='hostile';n.timer=18;n.lastSeen={x:p.x,z:p.z};toast(s,'Meridian security spotted you.')}
  if(n.suspicion===0)n.warned=false;
 }
}
