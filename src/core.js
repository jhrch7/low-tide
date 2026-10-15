import {boundedSaveShape,validExtras} from './save-guard.js';
import {driveBoat} from './marine.js';
import {surfaceAt,waterAt,bridgeAt} from './world.js';
import {roadGrip} from './weather.js';
import {roomPlan,roomFree} from './interior-space.js';
import {BUILDINGS,WORLD_BUILDINGS,STREET_PROPS,VEHICLES,MISSIONS,districtAt} from './content.js';
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
export function fresh(){return {schema:2,active:0,time:16.2,weather:'clear',cash:1800,bank:0,rep:{locals:0,union:0,rafi:0,meridian:0},heat:0,search:0,seen:false,interior:null,car:null,characters:[{id:'mara',name:'Mara Vale',x:-320,z:-180,angle:Math.PI,hp:100,armor:0,activity:'At Vale Motors',color:0x214f55},{id:'nico',name:'Nico Vale',x:-335,z:170,angle:0,hp:100,armor:0,activity:'Watching the docks',color:0x9d6944}],cars:[{id:'starter',model:'solano',x:-308,z:-177,angle:Math.PI/2,speed:0,health:100,color:0x214d52,upgrades:{engine:0,grip:0,armor:0}}],completed:[],mission:null,stage:0,flags:{},inventory:{pistol:true,ammo:48,clip:12,weapon:'pistol',mods:{}},businesses:[],income:0,stats:{distance:0,jobs:0,shots:0,arrests:0},settings:{quality:'auto',sound:true,sensitivity:1},job:null,notices:[],storyLog:[],dialogueQueue:[]}}
export function validSave(s){try{
 if(!s||![1,2].includes(s.schema)||!boundedSaveShape(s)||!Array.isArray(s.characters)||s.characters.length!==2||!Array.isArray(s.cars)||s.cars.length>100||!Array.isArray(s.completed)||s.completed.length>1000||s.completed.some(id=>typeof id!=='string')||![0,1].includes(s.active))return false;
 if(!['cash','time','heat'].every(k=>Number.isFinite(s[k]))||s.cash<0||s.cash>1e10||s.time<0||s.time>=24||s.heat<0||s.heat>5)return false;
 if(!s.characters.every(c=>['x','z','angle','hp'].every(k=>Number.isFinite(c[k]))&&Math.abs(c.x)<5000&&Math.abs(c.z)<5000&&c.hp>=0&&c.hp<=100))return false;
 if(!s.cars.every(c=>typeof c.id==='string'&&VEHICLES.some(v=>v.id===c.model)&&['x','z','angle','health'].every(k=>Number.isFinite(c[k]))&&Math.abs(c.x)<5000&&Math.abs(c.z)<5000&&c.health>=0&&c.health<=100&&['speed','steer','motionAngle','slip'].every(k=>c[k]==null||Number.isFinite(c[k]))))return false;
 if(s.interior&&(!BUILDINGS.some(b=>b.id===s.interior.id)||!['x','z'].every(k=>Number.isFinite(s.interior.return?.[k]))))return false;
 if(s.mission&&(!MISSIONS.some(m=>m.id===s.mission)||!Number.isInteger(s.stage)||s.stage<0||s.stage>=MISSIONS.find(m=>m.id===s.mission).steps.length))return false;
 if(s.inventory&&(!['clip','ammo'].every(k=>Number.isFinite(s.inventory[k])&&s.inventory[k]>=0&&s.inventory[k]<100000)))return false;
 if(!validExtras(s)||!s.completed.every(id=>MISSIONS.some(m=>m.id===id))||new Set(s.completed).size!==s.completed.length)return false;
 if(s.missionCheckpoint&&(s.missionCheckpoint.missionCheckpoint||!validSave(s.missionCheckpoint)))return false;
 return true;
}catch{return false}}
export function restore(raw){const s=typeof raw==='string'?JSON.parse(raw):structuredClone(raw);if(!validSave(s))throw new Error('This is not a valid Low Tide save.');const d=fresh();return {...d,...s,schema:2,characters:s.characters.map((c,i)=>({...d.characters[i],...c,aiding:null,walkPath:null,id:d.characters[i].id,name:d.characters[i].name})),inventory:{...d.inventory,...s.inventory,mods:{...s.inventory?.mods}},stats:{...d.stats,...s.stats},settings:{...d.settings,...s.settings},flags:{...s.flags},rep:{...d.rep,...s.rep},storyLog:Array.isArray(s.storyLog)?s.storyLog.filter(l=>typeof l?.text==='string'&&typeof l?.title==='string').slice(-160):[],dialogueQueue:s.dialogueQueue||[],effects:[],notices:[]}}
export function load(storage){let raw;try{raw=storage.getItem('low-tide-save');if(raw)return restore(raw)}catch{}try{const backup=storage.getItem('low-tide-backup');if(backup){const s=restore(backup);s.recoveryNotice='Recovered the last valid browser backup. Export a copy from Options.';return s}}catch{}const s=fresh();if(raw)s.recoveryNotice='The browser save could not be read. Import an exported copy from Options.';return s}
export function save(storage,s){try{if(!validSave(s))return false;const text=JSON.stringify({...s,schema:2});try{const previous=storage.getItem('low-tide-save');if(previous&&validSave(JSON.parse(previous)))storage.setItem('low-tide-backup',previous)}catch{}storage.setItem('low-tide-save',text);return true}catch{return false}}
export function player(s){return s.characters[s.active]}
export function currentCar(s){return s.cars.find(c=>c.id===s.car)}
export function mission(s){return MISSIONS.find(m=>m.id===s.mission)}
export function objective(s){return mission(s)?.steps[s.stage]}
export function available(s){return MISSIONS.filter(m=>!s.completed.includes(m.id)&&(!m.requires||m.requires.every(id=>s.completed.includes(id)))&&(m.actor==='both'||m.actor===player(s).id))}
export function toast(s,text){s.notices.push({text,until:performance.now()+5000});if(s.notices.length>4)s.notices.shift()}
export function blocked(x,z,r=0.4,eye=false){return WORLD_BUILDINGS.some(b=>Math.abs(x-b.x)<b.w/2+r&&Math.abs(z-b.z)<b.d/2+r)||STREET_PROPS.some(p=>(!eye||p.h>1.3)&&Math.abs(x-p.x)<p.w/2+r&&Math.abs(z-p.z)<p.d/2+r)}
export function onIsland(x,z){const a=Math.atan2(z/1000,x/1150),edge=1+0.045*Math.sin(a*5)+0.04*Math.cos(a*7);return (x/1150)**2+(z/1000)**2<edge**2}
export function move(s,dx,dz){const p=player(s),before={x:p.x,z:p.z};if(s.interior){const plan=roomPlan(BUILDINGS.find(b=>b.id===s.interior.id)),nx=clamp(p.x+dx,-plan.w/2+.5,plan.w/2-.5),nz=clamp(p.z+dz,-plan.d/2+.5,plan.d/2-.5);if(roomFree(plan,nx,p.z))p.x=nx;if(roomFree(plan,p.x,nz))p.z=nz;return}if((onIsland(p.x+dx,p.z)||(Math.abs(p.x+dx)<1550&&Math.abs(p.z)<1400))&&!blocked(p.x+dx,p.z))p.x+=dx;if((onIsland(p.x,p.z+dz)||(Math.abs(p.x)<1550&&Math.abs(p.z+dz)<1400))&&!blocked(p.x,p.z+dz))p.z+=dz;s.stats.distance+=Math.hypot(p.x-before.x,p.z-before.z)}
export function tick(s,dt,input,yaw){drive(s,dt,input);s.time=(s.time+dt/120)%24;const p=player(s);p.swimming=!s.interior&&!s.car&&waterAt(p.x,p.z)&&surfaceAt(p.x,p.z)<-.35;p.stamina??=100;if(p.swimming){p.crouched=false;p.stamina=Math.max(0,p.stamina-dt*(input.sprint?1.4:.45));if(p.stamina===0)hurt(s,dt*2.5)}else p.stamina=Math.min(100,p.stamina+dt*9);if(input.sprint||s.car)p.crouched=false;if(!s.car){const len=Math.hypot(input.x,input.y),speed=(p.swimming?(input.sprint&&p.stamina>5?2.8:1.65):input.sprint?7:p.crouched?1.8:3.5)*(s.heist?.phase==='escape'?.8:1);if(len>0.05){const dx=(-Math.cos(yaw)*input.x+Math.sin(yaw)*input.y)*speed*dt,dz=(Math.sin(yaw)*input.x+Math.cos(yaw)*input.y)*speed*dt;move(s,dx,dz);p.angle=Math.atan2(dx,dz)}}}
export function nearestBuilding(s){const p=player(s);return BUILDINGS.filter(b=>b.enterable).map(b=>({b,d:Math.hypot(p.x-b.x,p.z-(b.z+b.d/2+2))})).sort((a,b)=>a.d-b.d)[0]}

export function enterCar(s){if(s.interior)return false;const p=player(s);if(s.car){const c=currentCar(s);if(Math.abs(c.speed)>3){toast(s,'Stop before getting out.');return false}p.x=c.x+Math.cos(c.angle)*2.5;p.z=c.z-Math.sin(c.angle)*2.5;s.car=null;return true}const c=s.cars.filter(c=>c.health>0).sort((a,b)=>distance(a,p)-distance(b,p))[0];if(c&&distance(c,p)<5){s.car=c.id;s.lastCar=c.id;toast(s,'W / throttle · S / brake & reverse · A D / steer · Space / handbrake');return true}return false}
export function drive(s,dt,input){
 const c=currentCar(s);if(!c)return;const m=VEHICLES.find(v=>v.id===c.model)||VEHICLES[0];if(m.water){driveBoat(s,c,m,dt,input);const p=player(s);p.x=c.x;p.z=c.z;p.angle=c.angle;return}const power=m.power*(1+(c.upgrades?.engine||0)*.2),grip=roadGrip(s)*(1+(c.upgrades?.grip||0)*.12)*(m.grip/1.6);
 c.steer=(c.steer||0)+(input.x*.48-(c.steer||0))*Math.min(1,dt*7);c.motionAngle??=c.angle;
 const braking=input.y<0&&c.speed>1;c.braking=braking||input.handbrake;
 c.speed+=(braking?input.y*38:input.y*power)*dt;c.speed*=Math.exp(-dt*(input.handbrake?1.7:.18));
 const nose=surfaceAt(c.x+Math.sin(c.angle)*2,c.z+Math.cos(c.angle)*2),tail=surfaceAt(c.x-Math.sin(c.angle)*2,c.z-Math.cos(c.angle)*2);c.speed-=(nose-tail)/4*9.8*dt;
 if(c.health<=0)c.speed=0;c.speed=clamp(c.speed,-13,m.max*(1+(c.upgrades?.engine||0)*.08));
 const turn=-c.steer*Math.min(1,Math.abs(c.speed)/4)*(1.9/(1+Math.abs(c.speed)/36))*Math.sign(c.speed)*(input.handbrake?1.45:1);c.angle+=turn*dt;
 c.motionAngle+=wrap(c.angle-c.motionAngle)*Math.min(1,dt*grip*(input.handbrake?.7:4));c.slip=wrap(c.angle-c.motionAngle);
 const dx=Math.sin(c.motionAngle)*c.speed*dt,dz=Math.cos(c.motionAngle)*c.speed*dt,steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.65));let moved=0;
 for(let i=0;i<steps;i++){const x=c.x+dx/steps,z=c.z+dz/steps;if(onIsland(x,z)&&(!waterAt(x,z)||bridgeAt(x,z))&&!blocked(x,z,1.1)){c.x=x;c.z=z;moved+=Math.hypot(dx,dz)/steps}else{c.health=clamp(c.health-Math.abs(c.speed)*.4*(1-(c.upgrades?.armor||0)*.18),0,100);c.hitUntil=(s.elapsed||0)+.4;s.stats.crashes=(s.stats.crashes||0)+1;c.speed*=-.22;c.motionAngle=c.angle;break}}
 const p=player(s);p.x=c.x;p.z=c.z;p.angle=c.angle;s.stats.distance+=moved;
}


export function hurt(s,amount,source){const p=player(s),absorbed=Math.min(p.armor||0,amount*.7);p.armor=Math.max(0,(p.armor||0)-absorbed);p.hp=Math.max(0,p.hp-(amount-absorbed));p.hurtUntil=(s.elapsed||0)+.3;if(source)p.hurtAngle=Math.atan2(source.x-p.x,source.z-p.z)}
