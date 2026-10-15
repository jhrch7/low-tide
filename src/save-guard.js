import {WORK} from './jobs.js';import {HEISTS} from './heists.js';import {COURSES} from './racing.js';import {ENTERPRISES} from './business.js';import {WEAPONS} from './combat.js';import {DISTRICTS,VEHICLES} from './content.js';
const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x),number=(x,min=-1e10,max=1e10)=>Number.isFinite(x)&&x>=min&&x<=max,point=p=>object(p)&&number(p.x,-5000,5000)&&number(p.z,-5000,5000),unique=a=>new Set(a).size===a.length;
export function boundedSaveShape(s){let count=0;function walk(x,depth){if(++count>100000||depth>20)return false;if(x==null||typeof x==='boolean')return true;if(typeof x==='number')return Number.isFinite(x);if(typeof x==='string')return x.length<=20000;if(Array.isArray(x))return x.length<=5000&&x.every(v=>walk(v,depth+1));if(!object(x))return false;return Object.entries(x).every(([k,v])=>!['__proto__','constructor','prototype'].includes(k)&&k.length<160&&walk(v,depth+1))}return walk(s,0)}
export function validExtras(s){
 for(const key of ['flags','rep','stats','settings','inventory'])if(s[key]!=null&&!object(s[key]))return false;
 for(const key of ['bank','income','elapsed','businessClock','missionClock','search'])if(s[key]!=null&&!number(s[key],0,1e10))return false;
 if(s.rep&&!Object.values(s.rep).every(n=>number(n,-100,100)))return false;if(s.stats&&!Object.values(s.stats).every(n=>number(n,0,1e12)))return false;
 const settings=s.settings||{};if(settings.quality!=null&&!['auto','performance','balanced','high'].includes(settings.quality))return false;if(settings.sound!=null&&typeof settings.sound!=='boolean')return false;if(settings.radio!=null&&!['off','harbor','deadAir','costa'].includes(settings.radio))return false;
 if(settings.sensitivity!=null&&!number(settings.sensitivity,.2,3)||settings.reducedMotion!=null&&typeof settings.reducedMotion!=='boolean')return false;
 if(['volume','musicVolume'].some(k=>settings[k]!=null&&!number(settings[k],0,1))||settings.score!=null&&typeof settings.score!=='boolean')return false;
 const inv=s.inventory||{};if(inv.weapon!=null&&!WEAPONS[inv.weapon]||inv.mods!=null&&!object(inv.mods))return false;if(inv.medkits!=null&&!number(inv.medkits,0,100000))return false;if(inv.owned!=null&&(!Array.isArray(inv.owned)||inv.owned.length>20||!inv.owned.every(id=>WEAPONS[id])))return false;
 const vehicle=c=>object(c)&&typeof c.id==='string'&&VEHICLES.some(v=>v.id===c.model)&&point(c)&&number(c.angle)&&number(c.health,0,c.police?200:100)&&['speed','steer','motionAngle','slip'].every(k=>c[k]==null||number(c[k]));
 if(!unique(s.cars.map(c=>c.id))||s.car!=null&&!s.cars.some(c=>c.id===s.car))return false;
 for(const key of ['traffic','police','patrols'])if(s[key]!=null&&(!Array.isArray(s[key])||s[key].length>100||!s[key].every(vehicle)))return false;
 if(s.npcs!=null&&(!Array.isArray(s.npcs)||s.npcs.length>400||!s.npcs.every(n=>object(n)&&typeof n.id==='string'&&['civilian','guard'].includes(n.role)&&point(n)&&number(n.hp,0,100)&&number(n.angle)&&['idle','walk','talk','flee','down','hostile','suspicious','rest'].includes(n.state))))return false;
 if(s.waypoint!=null&&!point(s.waypoint)||s.lastKnown!=null&&!point(s.lastKnown))return false;
 if(s.flags?.partnerSpot!=null&&(!point(s.flags.partnerSpot)||s.flags.partnerSpot.angle!=null&&!number(s.flags.partnerSpot.angle)))return false;
 if(s.pendingReports!=null&&(!Array.isArray(s.pendingReports)||s.pendingReports.length>400||!s.pendingReports.every(r=>point(r)&&typeof r.witness==='string'&&number(r.clock,-1,60)&&number(r.severity,0,5))))return false;
 if(s.raceRecords!=null&&(!object(s.raceRecords)||!Object.entries(s.raceRecords).every(([id,r])=>COURSES.some(c=>c.id===id)&&object(r)&&number(r.time,0,1000)&&number(r.rank,1,3))))return false;
 if(s.heistCooldown!=null&&(!object(s.heistCooldown)||!Object.entries(s.heistCooldown).every(([id,n])=>HEISTS.some(h=>h.id===id)&&number(n,0,1e10))))return false;
 if(s.job){const def=WORK.find(j=>j.id===s.job.id);if(!def||!Number.isInteger(s.job.stage)||s.job.stage<0||s.job.stage>=def.steps.length||!number(s.job.clock,0,1000))return false}
 if(s.heist&&(!HEISTS.some(h=>h.id===s.heist.id)||!['approach','breach','escape'].includes(s.heist.phase)||!['quiet','loud'].includes(s.heist.approach)||!number(s.heist.clock,0,240)||!number(s.heist.pins,0,3)||!number(s.heist.failures,0,10000)))return false;
 if(s.race){const r=s.race,def=COURSES.find(c=>c.id===r.id);if(!def||typeof r.active!=='boolean'||!Number.isInteger(r.stage)||r.stage<1||r.stage>def.points.length||!number(r.clock,0,1000)||!number(r.countdown,0,3)||!Array.isArray(r.rivals)||r.rivals.length!==2||!r.rivals.every(vehicle)||r.active&&!s.cars.some(c=>c.id===r.car))return false}
 if(s.practice&&(!object(s.practice)||typeof s.practice.active!=='boolean'||!number(s.practice.clock,0,100)||!number(s.practice.rounds,0,15)||!number(s.practice.hits,0,15)))return false;
 if(s.casino){const c=s.casino,card=c=>object(c)&&Number.isInteger(c.rank)&&number(c.rank,1,13)&&['C','D','H','S'].includes(c.suit);if(!['player','settled'].includes(c.phase)||![50,100,300].includes(c.stake)||![c.deck,c.player,c.dealer].every(a=>Array.isArray(a)&&a.length<=52&&a.every(card)))return false;const all=[...c.deck,...c.player,...c.dealer];if(all.length!==52||!unique(all.map(c=>c.rank+c.suit)))return false}
 if(s.supplies!=null&&(!object(s.supplies)||!Object.entries(s.supplies).every(([k,n])=>['spares','medical','provisions'].includes(k)&&Number.isInteger(n)&&number(n,0,10))))return false;
 if(s.photos!=null&&(!object(s.photos)||!Array.isArray(s.photos.places)||!unique(s.photos.places)||!s.photos.places.every(id=>DISTRICTS.some(d=>d.id===id))||!Number.isInteger(s.photos.shots)||!number(s.photos.shots,0,1e10)))return false;
 if(s.businessLevels!=null&&(!object(s.businessLevels)||!Object.entries(s.businessLevels).every(([k,n])=>ENTERPRISES.some(e=>e.id===k)&&Number.isInteger(n)&&number(n,0,2))))return false;
 if(s.businesses!=null&&(!Array.isArray(s.businesses)||!unique(s.businesses)||!s.businesses.every(id=>ENTERPRISES.some(e=>e.id===id))))return false;
 if(s.exploration){const e=s.exploration;if(!object(e))return false;for(const key of ['found','seen','districts'])if(e[key]!=null&&(!Array.isArray(e[key])||!unique(e[key])||!e[key].every(id=>key==='districts'?DISTRICTS.some(d=>d.id===id):/^memory-[1-9][0-9]*$/.test(id))))return false}
 for(const key of ['storyLog','dialogueQueue'])if(s[key]!=null&&(!Array.isArray(s[key])||s[key].length>(key==='storyLog'?160:30)||!s[key].every(l=>object(l)&&typeof l.text==='string'&&typeof l.title==='string')))return false;
 return true;
}
