import {WORLD_BUILDINGS,STREET_PROPS,VEHICLES} from './content.js';
import {surfaceAt,heightAt} from './world.js';
const pointHeight=(p)=>surfaceAt(p.x,p.z)+(p.height??(p.crouched?1.02:1.43));
export function traceShot(s,a,b){
 const ax=a.x,az=a.z,ay=pointHeight(a),by=pointHeight(b),d=Math.hypot(b.x-ax,b.z-az),steps=Math.max(1,Math.ceil(d/.45)),within=o=>{const px=Math.max(10,(o.w||0)/2+1),pz=Math.max(10,(o.d||0)/2+1);return o.x>=Math.min(ax,b.x)-px&&o.x<=Math.max(ax,b.x)+px&&o.z>=Math.min(az,b.z)-pz&&o.z<=Math.max(az,b.z)+pz};
 const buildings=WORLD_BUILDINGS.filter(within),props=STREET_PROPS.filter(within),cars=[...s.cars,...s.traffic||[],...s.police||[],...s.patrols||[]].filter(c=>c.id!==a.id&&c.id!==b.id&&within(c));
 for(let i=1;i<steps;i++){const t=i/steps,x=ax+(b.x-ax)*t,z=az+(b.z-az)*t,y=ay+(by-ay)*t;
  for(const o of buildings)if(Math.abs(x-o.x)<o.w/2&&Math.abs(z-o.z)<o.d/2&&y<heightAt(o.x,o.z)+o.h)return {x,z,height:y-surfaceAt(x,z),kind:'wall',id:o.id};
  for(const o of props)if(Math.abs(x-o.x)<o.w/2&&Math.abs(z-o.z)<o.d/2&&y<heightAt(o.x,o.z)+o.h)return {x,z,height:y-surfaceAt(x,z),kind:'prop',id:o.id};
  for(const c of cars){const m=VEHICLES.find(m=>m.id===c.model);if(!m)continue;const dx=x-c.x,dz=z-c.z,lx=Math.cos(c.angle)*dx-Math.sin(c.angle)*dz,lz=Math.sin(c.angle)*dx+Math.cos(c.angle)*dz;if(Math.abs(lx)<m.width/2&&Math.abs(lz)<m.length/2&&y<surfaceAt(c.x,c.z)+m.height*.88)return{x,z,height:y-surfaceAt(x,z),kind:'car',id:c.id}}
  if(y<heightAt(x,z)+.03)return {x,z,height:.03,kind:'ground'};
 }
 return null;
}
export const clearShot=(s,a,b)=>!traceShot(s,a,b);
