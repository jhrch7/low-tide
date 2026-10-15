import {driveBoat,waterRoute} from './marine.js';
import {VEHICLES} from './content.js';
import {flagged,plateFor} from './registrations.js';
import {noticeCrime,tickReports} from './witnesses.js';
import {roadProjection,roadRoute} from './navigation.js';
import {onIsland,waterAt,bridgeAt} from './world.js';
import {player,currentCar,distance,blocked,wrap,toast,clamp,hurt} from './core.js';
export function sight(a,b){const d=distance(a,b);for(let t=2;t<d;t+=3)if(blocked(a.x+(b.x-a.x)*t/d,a.z+(b.z-a.z)*t/d,.1,true))return false;return true}
export function crime(s,severity=1,range=90){return noticeCrime(s,severity,sight,range)}
export function arrest(s){s.stats.arrests++;s.cash=Math.max(0,s.cash-300-s.heat*100);s.heat=0;s.search=0;s.police=[];s.hotCars={};s.pendingReports=[];s.race=null;s.practice=null;s.car=null;s.interior=null;const p=player(s);Object.assign(p,{x:-320,z:-180,hp:100});s.mission=null;s.stage=0;s.job=null;s.heist=null;s.flags.arrested=true;s.flags.partnerSpot=null;s.dialogueQueue=[];toast(s,'Released on bail · fine paid · active operation cancelled. Your leads remain available.')}
function dispatch(s,p){const marine=waterAt(p.x,p.z)&&(!bridgeAt(p.x,p.z)||VEHICLES.find(v=>v.id===currentCar(s)?.model)?.water),units=Math.min(4,Math.ceil(s.heat)),needed=marine?Math.max(0,Math.min(2,units)-s.police.filter(u=>u.model==='lancha').length):Math.max(0,units-s.police.filter(u=>u.model!=='lancha').length);for(let i=0;i<needed&&s.police.length<6;i++){let point;if(marine){for(let j=0;j<24;j++){const a=(i+j)*Math.PI/12,x=p.x+Math.cos(a)*145,z=p.z+Math.sin(a)*145;if(waterAt(x,z)&&Math.abs(x)<1500&&Math.abs(z)<1350){point={x,z};break}}}else point=roadProjection({x:p.x+145*Math.cos(i*2),z:p.z+145*Math.sin(i*2)});if(!point)continue;s.nextUnit=(s.nextUnit||0)+1;s.police.push({id:'police-'+s.nextUnit,model:marine?'lancha':'solano',...point,angle:0,speed:0,health:120,color:marine?0x426679:0xd4dedb,upgrades:{},police:true,unit:s.nextUnit})}}
function driveUnit(u,target,dt,direct){dt=Math.min(dt,.1);const model=VEHICLES.find(m=>m.id===u.model);if(model?.water){u.routeClock=(u.routeClock||0)-dt;if(!u.route?.length||u.routeClock<=0){u.route=waterRoute(u,target);u.routeClock=3}while(u.route?.length&&distance(u,u.route[0])<8)u.route.shift();const next=u.route?.[0]||target,heading=Math.atan2(next.x-u.x,next.z-u.z);u.navStats??={distance:0};driveBoat({stats:u.navStats},u,model,dt,{x:clamp(-wrap(heading-u.angle)*2,-1,1),y:distance(u,target)<10?-1:1});return}
 u.routeClock=(u.routeClock||0)-dt;
 if(!direct&&(!u.route?.length||u.routeClock<=0||distance(u.routeGoal||target,target)>35)){u.route=roadRoute(u,target);u.routeGoal={...target};u.routeClock=4}
 while(u.route?.length&&distance(u,u.route[0])<5)u.route.shift();const next=direct?target:u.route?.[0]||target,d=distance(u,next),heading=Math.atan2(next.x-u.x,next.z-u.z),turn=wrap(heading-u.angle);
 u.angle+=turn*Math.min(1,dt*3);const desired=d<3?0:direct?Math.min(32,8+d*.2):Math.abs(turn)>.65?7:22;u.speed+=(desired-u.speed)*Math.min(1,dt*2.4);
 const dx=Math.sin(u.angle)*u.speed*dt,dz=Math.cos(u.angle)*u.speed*dt;
 if(onIsland(u.x+dx,u.z+dz)&&(!waterAt(u.x+dx,u.z+dz)||bridgeAt(u.x+dx,u.z+dz))&&!blocked(u.x+dx,u.z+dz,1)){u.x+=dx;u.z+=dz}else{u.speed*=.5;u.routeClock=0}
}
function ambientPatrols(s,dt){s.patrols??=[{id:'patrol-0',model:'solano',x:0,z:-190,angle:0,speed:0,health:120,color:0xd4dedb,police:true,upgrades:{},stop:0},{id:'patrol-1',model:'solano',x:640,z:-520,angle:0,speed:0,health:120,color:0xd4dedb,police:true,upgrades:{},stop:3}];const stops=[{x:-320,z:-180},{x:0,z:540},{x:640,z:540},{x:640,z:-540},{x:-640,z:-540},{x:0,z:-180}],p=player(s),car=currentCar(s);for(const u of s.patrols){if(u.health<=0){u.deadClock=(u.deadClock||0)+dt;if(u.deadClock>120&&distance(u,p)>150){Object.assign(u,{x:640,z:-520,health:120,deadClock:0,route:null})}continue}let target=s.heat>0?s.lastKnown:stops[u.stop];if(!target)target=stops[0];if(distance(u,target)<18)u.stop=(u.stop+1)%stops.length;driveUnit(u,target,dt,false);if(s.heat<=0&&!s.interior&&car&&flagged(s,car.id)&&distance(u,p)<48&&Math.abs(wrap(Math.atan2(p.x-u.x,p.z-u.z)-u.angle))<1.2&&sight(u,p)){s.heat=Math.min(3,s.hotCars[car.id].heat);s.search=45;s.lastKnown={x:p.x,z:p.z};toast(s,'Patrol recognized '+plateFor(car)+'. Lose them or change the registration.')}}}
export function tickPolice(s,dt,input={}){
 tickReports(s,dt);ambientPatrols(s,Math.min(dt,.1));s.police??=[];if(s.heat<=0){s.seen=false;return}s.search??=45;const p=player(s),worldP=s.interior?s.interior.return:p;dispatch(s,worldP);s.seen=false;
 const car=currentCar(s);if(input.surrender&&car)car.speed*=Math.exp(-dt*4);
 for(const u of s.police){
  if(u.health<=0)continue;const d=distance(u,worldP),range=(s.time<6||s.time>19)?((s.flags.blackoutUntil||0)>(s.elapsed||0)?35:65):100,sees=!s.interior&&d<range*(p.crouched?.65:1)*(s.weather==='rain'?.72:1)&&(d<35||Math.abs(wrap(Math.atan2(p.x-u.x,p.z-u.z)-u.angle))<1.35)&&sight(u,p);
  if(sees){s.seen=true;s.lastKnown={x:p.x,z:p.z,angle:p.angle};s.search=45}
  let goal=s.lastKnown||worldP;
  if(!sees&&distance(u,goal)<18){u.searchClock=(u.searchClock||0)-dt;if(!u.searchPoint||u.searchClock<=0){const a=(s.elapsed||0)*.07+u.unit*1.8;u.searchPoint=u.model==='lancha'?(waterRoute(u,{x:goal.x+Math.sin(a)*170,z:goal.z+Math.cos(a)*170}).at(-1)||goal):roadProjection({x:goal.x+Math.sin(a)*170,z:goal.z+Math.cos(a)*170});u.searchClock=12}goal=u.searchPoint}
  if(sees&&u.unit>=2&&car&&u.model!=='lancha'){goal=roadProjection({x:p.x+Math.sin(p.angle)*130,z:p.z+Math.cos(p.angle)*130});u.tactic='intercept'}else u.tactic=sees?'pursuit':'search';
  driveUnit(u,goal,dt,sees&&u.unit<2&&d<40&&sight(u,p));
  if(d<5&&!s.interior){if(!car||Math.abs(car.speed)<3||input.surrender)s.arrestMeter=(s.arrestMeter||0)+dt*(input.surrender?2:1);if(s.heat>=3&&!input.surrender)hurt(s,dt*6)}
 }
 if(!s.seen){s.search-=dt;s.arrestMeter=Math.max(0,(s.arrestMeter||0)-dt);if(s.search<=0){s.heat=Math.max(0,s.heat-1);s.search=22;if(s.heat===0){s.police=[];toast(s,'Pursuit lost. The island remembers what happened.')}}}
 if((s.arrestMeter||0)>4){s.arrestMeter=0;arrest(s)}
}
