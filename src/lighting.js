import * as T from '../vendor/three.module.js';
import {surfaceAt} from './world.js';
export function contactFrame(v){
 if(!v.contacts){const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,2,32,32,32);gradient.addColorStop(0,'rgba(12,19,23,.52)');gradient.addColorStop(.35,'rgba(12,19,23,.32)');gradient.addColorStop(1,'rgba(12,19,23,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);const material=new T.MeshBasicMaterial({map:new T.CanvasTexture(canvas),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});v.contacts=new T.InstancedMesh(new T.PlaneGeometry(1,1),material,256);v.contacts.instanceMatrix.setUsage(T.DynamicDrawUsage);v.contacts.frustumCulled=false;v.contacts.renderOrder=1;v.scene.add(v.contacts)}
 let count=0;const matrix=new T.Matrix4(),q=new T.Quaternion(),floor=new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),-Math.PI/2),pos=new T.Vector3(),scale=new T.Vector3();
 const add=(g,w,d,y)=>{if(!g?.visible||count>=256)return;pos.set(g.position.x,y+.018,g.position.z);q.setFromAxisAngle(new T.Vector3(0,1,0),g.rotation.y).multiply(floor);scale.set(w,d,1);matrix.compose(pos,q,scale);v.contacts.setMatrixAt(count++,matrix)};
 v.heroes.forEach((g,i)=>{if(!v.s.characters[i].swimming&&(i!==v.s.active||!v.s.car))add(g,1.2,.85,v.s.interior?0:surfaceAt(g.position.x,g.position.z))});
 for(const g of v.peopleMeshes?.values()||[])add(g,1.1,.75,surfaceAt(g.position.x,g.position.z));
 for(const g of v.room?.userData.contacts||[])add(g,1.2,.85,0);
 for(const g of v.meshes.values())if(!g.userData.water)add(g,2.25,4.6,surfaceAt(g.position.x,g.position.z));
 v.contacts.count=count;v.contacts.instanceMatrix.needsUpdate=true;
}
