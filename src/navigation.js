import {COAST_ROAD} from './scenic-route.js';
import {ROAD_X,ROAD_Z,onIsland} from './world.js';
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const nodes=ROAD_X.flatMap((x,i)=>ROAD_Z.map((z,j)=>({x,z,i,j}))).filter(n=>onIsland(n.x,n.z));
const edges=[];for(const a of nodes)for(const b of nodes)if((a.i===b.i&&b.j===a.j+1)||(a.j===b.j&&b.i===a.i+1))edges.push({a,b,length:dist(a,b)});
const coastNodes=COAST_ROAD.filter((_,i)=>i%8===0||i===COAST_ROAD.length-1).map((p,i,list)=>{const existing=nodes.find(n=>dist(n,p)<1);if(existing)return existing;const n={...p,i:100+i,j:100};nodes.push(n);return n});for(let i=1;i<coastNodes.length;i++)edges.push({a:coastNodes[i-1],b:coastNodes[i],length:dist(coastNodes[i-1],coastNodes[i])});
export function roadProjection(p){let best;for(const e of edges){const dx=e.b.x-e.a.x,dz=e.b.z-e.a.z,t=Math.max(0,Math.min(1,((p.x-e.a.x)*dx+(p.z-e.a.z)*dz)/(e.length*e.length))),q={x:e.a.x+dx*t,z:e.a.z+dz*t};const d=dist(p,q);if(!best||d<best.d)best={...q,d,a:e.a,b:e.b}}return best}
export function roadRoute(start,goal){
 const a=roadProjection(start),b=roadProjection(goal),cost=new Map(nodes.map(n=>[n,Infinity])),previous=new Map(),open=new Set(nodes);
 for(const n of [a.a,a.b])cost.set(n,dist(a,n));
 while(open.size){const n=[...open].reduce((x,y)=>cost.get(x)<cost.get(y)?x:y);open.delete(n);if(!Number.isFinite(cost.get(n)))break;for(const edge of edges){const next=edge.a===n?edge.b:edge.b===n?edge.a:null;if(!next||!open.has(next))continue;const candidate=cost.get(n)+edge.length;if(candidate<cost.get(next)){cost.set(next,candidate);previous.set(next,n)}}}
 const end=[b.a,b.b].sort((x,y)=>cost.get(x)+dist(x,b)-cost.get(y)-dist(y,b))[0],path=[];for(let n=end;n;n=previous.get(n))path.unshift({x:n.x,z:n.z});
 if(a.a===b.a&&a.b===b.b)return [{x:a.x,z:a.z},{x:b.x,z:b.z}];return [{x:a.x,z:a.z},...path,{x:b.x,z:b.z}];
}
export function drivingRoute(start,goal,heading=0){
 const a=roadProjection(start),b=roadProjection(goal),angle=v=>Math.atan2(Math.sin(v),Math.cos(v)),direction=(p,q)=>Math.atan2(q.x-p.x,q.z-p.z),adj=n=>edges.filter(e=>e.a===n||e.b===n).map(e=>e.a===n?e.b:e.a);
 if(a.a===b.a&&a.b===b.b&&Math.abs(angle(direction(a,b)-heading))<2.2)return [{x:a.x,z:a.z},{x:b.x,z:b.z}];
 const open=[],best=new Map();for(const n of [a.a,a.b]){const d=dist(a,n),turn=Math.abs(angle(direction(a,n)-heading));if(turn>2.5&&d<35)continue;const cost=d+turn*25;const state={node:n,heading:d>1?direction(a,n):heading,cost,key:n.i+','+n.j+'/start'};best.set(state.key,cost);open.push(state)}
 if(!open.length){const n=[a.a,a.b].sort((x,y)=>dist(x,a)-dist(y,a))[0];open.push({node:n,heading,cost:dist(a,n),key:'fallback'})}
 let winner,total=Infinity;while(open.length){open.sort((x,y)=>x.cost-y.cost);const s=open.shift();if(s.cost>total)break;if(s.node===b.a||s.node===b.b){const d=dist(s.node,b),turn=d<1?0:Math.abs(angle(direction(s.node,b)-s.heading));if(turn<2.6||adj(s.node).length===1){const cost=s.cost+d+turn*25;if(cost<total){total=cost;winner=s}}}for(const n of adj(s.node)){const h=direction(s.node,n),turn=Math.abs(angle(h-s.heading));if(turn>2.6&&adj(s.node).length>1)continue;const cost=s.cost+dist(s.node,n)+turn*25,key=n.i+','+n.j+'/'+s.node.i+','+s.node.j;if(cost>=(best.get(key)??Infinity))continue;best.set(key,cost);open.push({node:n,heading:h,cost,key,parent:s})}}
 if(!winner)return roadRoute(start,goal);const route=[];for(let s=winner;s;s=s.parent)route.unshift({x:s.node.x,z:s.node.z});return [{x:a.x,z:a.z},...route,{x:b.x,z:b.z}].filter((p,i,list)=>i===0||dist(p,list[i-1])>.5);
}
