import {loadCharacter} from './character-assets.js';
import {prepareActorLOD} from './render-budget.js';
import * as T from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {clone} from '../vendor/SkeletonUtils.js';
const motions=['Idle','Walk','Run'];
const baseName=name=>name.replace(/_\d+$/,'');
function skins(root){return root.getObjectsByProperty('isSkinnedMesh',true).sort((a,b)=>b.geometry.attributes.position.count-a.geometry.attributes.position.count)}
function updateSkinBounds(root){root.updateMatrixWorld(true);for(const mesh of skins(root)){mesh.skeleton.update();mesh.computeBoundingBox()}}
export function fit(root){root.updateMatrixWorld(true);const rig=skins(root)[0]?.skeleton,right=rig?.bones.find(b=>baseName(b.name)==='mixamorigRightArm'),left=rig?.bones.find(b=>baseName(b.name)==='mixamorigLeftArm');if(right&&left){const axis=right.getWorldPosition(new T.Vector3()).sub(left.getWorldPosition(new T.Vector3()));axis.y=0;if(axis.lengthSq()>.0001){const yaw=-Math.PI/2-Math.atan2(axis.x,axis.z);root.quaternion.premultiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),yaw))}}updateSkinBounds(root);const box=new T.Box3().setFromObject(root),height=box.max.y-box.min.y;root.scale.multiplyScalar(1.83/height);updateSkinBounds(root);root.position.y-=new T.Box3().setFromObject(root).min.y;root.updateMatrixWorld(true);return height}
function rigGroups(root){const used=new Set();return skins(root).filter(mesh=>{const key=mesh.skeleton.bones.map(b=>b.uuid).join('/');if(used.has(key))return false;used.add(key);return true})}
export function clipsFor(target,source){
 // Preserve target bind lengths/scales. Transfer world rotation deltas rather than
 // applying absolute source translations between rigs authored in different units.
 const sourceRigs=rigGroups(source.scene),targetRigs=rigGroups(target.scene);
 const rest=new Map([...new Set([...sourceRigs,...targetRigs].flatMap(r=>r.skeleton.bones))].map(b=>[b,{p:b.position.clone(),q:b.quaternion.clone(),s:b.scale.clone()}]));
 const restore=()=>{for(const [b,t] of rest){b.position.copy(t.p);b.quaternion.copy(t.q);b.scale.copy(t.s)}source.scene.updateMatrixWorld(true);target.scene.updateMatrixWorld(true)};
 source.scene.updateMatrixWorld(true);target.scene.updateMatrixWorld(true);
 const sourceBones=new Map(sourceRigs[0].skeleton.bones.map(b=>[baseName(b.name),b]));
 const sourceBind=new Map([...sourceBones].map(([name,b])=>[name,{q:b.getWorldQuaternion(new T.Quaternion()),p:b.getWorldPosition(new T.Vector3())}]));
 const depth=b=>{let n=0;for(let p=b.parent;p;p=p.parent)n++;return n};
 const bones=[...new Set(targetRigs.flatMap(r=>r.skeleton.bones))].filter(b=>sourceBones.has(baseName(b.name))).sort((a,b)=>depth(a)-depth(b));
 const bind=new Map(bones.map(b=>{
  const name=baseName(b.name),from=sourceBones.get(name),q=b.getWorldQuaternion(new T.Quaternion()),child=b.children.find(c=>c.isBone&&c.position.lengthSq()>1e-8&&baseName(c.name)!==baseName(b.name)&&sourceBones.has(baseName(c.name)));
  if(child){const sourceChild=sourceBones.get(baseName(child.name)),a=child.getWorldPosition(new T.Vector3()).sub(b.getWorldPosition(new T.Vector3())).normalize(),v=sourceChild.getWorldPosition(new T.Vector3()).sub(from.getWorldPosition(new T.Vector3())).normalize();q.premultiply(new T.Quaternion().setFromUnitVectors(a,v))}
  return [b,{q,p:b.position.clone()}];
 }));
 const clips=[];
 for(const original of source.animations.filter(c=>motions.includes(c.name))){
  const mixer=new T.AnimationMixer(source.scene),action=mixer.clipAction(original),frames=Math.ceil(original.duration*24)+1,times=new Float32Array(frames),data=new Map(bones.map(b=>[b,{q:new Float32Array(frames*4),p:new Float32Array(frames*3)}]));action.play();
  for(let i=0;i<frames;i++){
   const time=original.duration*i/(frames-1);times[i]=time;mixer.setTime(Math.min(time,original.duration-1e-5));source.scene.updateMatrixWorld(true);
   for(const bone of bones){
    const name=baseName(bone.name),from=sourceBones.get(name),rest=bind.get(bone),rotation=from.getWorldQuaternion(new T.Quaternion()).multiply(sourceBind.get(name).q.clone().invert()).multiply(rest.q);
    bone.quaternion.copy(bone.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(rotation)).normalize();
    bone.position.copy(rest.p);
    if(name==='mixamorigHips'){
     const dy=from.getWorldPosition(new T.Vector3()).y-sourceBind.get(name).p.y;
     const offset=new T.Vector3(0,dy,0).applyQuaternion(bone.parent.getWorldQuaternion(new T.Quaternion()).invert()).divide(bone.parent.getWorldScale(new T.Vector3()));bone.position.add(offset);
    }
    bone.updateMatrixWorld(true);bone.quaternion.toArray(data.get(bone).q,i*4);bone.position.toArray(data.get(bone).p,i*3);
   }
  }
  const tracks=[];for(const bone of bones){tracks.push(new T.QuaternionKeyframeTrack(bone.name+'.quaternion',times,data.get(bone).q));if(baseName(bone.name)==='mixamorigHips')tracks.push(new T.VectorKeyframeTrack(bone.name+'.position',times,data.get(bone).p))}
  clips.push(new T.AnimationClip(original.name,original.duration,tracks));action.stop();mixer.uncacheRoot(source.scene);restore();
 }
 restore();return clips;
}
export async function loadActors(view){
 try{
  const loader=new GLTFLoader(),[female,male,guard]=await Promise.all([loadCharacter(loader,'megan'),loadCharacter(loader,'civilian'),loadCharacter(loader,'soldier')]);
  const civilianFemale=female;for(const template of [female,male,guard])fit(template.scene);
  view.actorTemplates={female,male,guard,civilianFemale};view.actorClips={civilianFemale:civilianFemale.animations,guard:guard.animations.filter(c=>motions.includes(c.name)),female:motions.every(n=>female.animations.some(c=>c.name===n))?female.animations:clipsFor(female,guard),male:motions.every(n=>male.animations.some(c=>c.name===n))?male.animations:clipsFor(male,guard)};
  guard.scene.updateMatrixWorld(true);
  view.heroes.forEach(g=>view.scene.remove(g));view.heroes=view.s.characters.map(c=>{const g=actor(view,c.id==='mara'?'female':'male');view.scene.add(g);return g});
  for(const g of view.peopleMeshes?.values()||[])view.scene.remove(g);view.peopleMeshes?.clear();view.actorsReady=true;prepareActorLOD(view).catch(e=>view.assetErrors.push('Character LOD: '+e.message));
 }catch(e){view.assetErrors.push('Character assets: '+e.message)}
}
export function actor(view,variant){
 const root=clone(view.actorTemplates[variant].scene),height=fit(root),g=new T.Group();g.add(root);root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false}});
 const mixer=new T.AnimationMixer(root),actions=Object.fromEntries(view.actorClips[variant].map(c=>[c.name,mixer.clipAction(c)])),rigs=rigGroups(root),primary=rigs[0],boneMap=new Map(rigs.flatMap(r=>r.skeleton.bones).map(b=>[baseName(b.name),b]));
 g.userData={mixer,actions,root,defaultRootY:root.position.y,current:'Idle',variant,sourceHeight:height,scale:root.scale.x,rigs,boneMap,restBones:new Map(rigs.flatMap(r=>r.skeleton.bones).map(b=>[b,b.quaternion.clone()]))};root.updateMatrixWorld(true);
 const hand=boneMap.get('mixamorigRightHand');
 if(hand){
  const gun=new T.Group(),metal=new T.MeshStandardMaterial({color:0x30383c,metalness:.7,roughness:.35}),barrel=new T.Mesh(new T.BoxGeometry(.07,.11,.3),metal),grip=new T.Mesh(new T.BoxGeometry(.06,.14,.08),metal);barrel.position.z=.1;grip.position.y=-.1;gun.add(barrel,grip);
  gun.scale.setScalar(1/Math.max(.0001,Math.abs(hand.getWorldScale(new T.Vector3()).x)));const finger=boneMap.get('mixamorigRightHandMiddle1')||boneMap.get('mixamorigRightHandIndex1')||hand.children.find(c=>c.isBone);if(finger){const direction=finger.getWorldPosition(new T.Vector3()).sub(hand.getWorldPosition(new T.Vector3())).normalize().applyQuaternion(hand.getWorldQuaternion(new T.Quaternion()).invert());gun.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),direction)}hand.add(gun);g.userData.gun=gun;gun.visible=false;
 }
 actions.Idle?.play();mixer.update(0);return g;
}
export function animateActor(g,moving,sprint,dt,aim=false){
 if(!g.userData.mixer)return false;
 g.userData.root.position.y=g.userData.defaultRootY;const wanted=moving?(sprint?'Run':'Walk'):'Idle';
 if(g.userData.current!==wanted){g.userData.actions[g.userData.current]?.fadeOut(.2);g.userData.actions[wanted]?.reset().fadeIn(.2).play();g.userData.current=wanted}
 g.userData.mixer.update(dt);if(g.userData.gun)g.userData.gun.visible=aim;
 if(aim){
  g.updateMatrixWorld(true);const target=g.position.clone().add(new T.Vector3(Math.sin(g.rotation.y)*4,1.45,Math.cos(g.rotation.y)*4));
  for(const rig of g.userData.rigs)for(const tag of ['mixamorigRightArm','mixamorigRightForeArm']){
   const bone=rig.skeleton.bones.find(b=>baseName(b.name)===tag),child=bone?.children.find(c=>c.isBone&&c.position.lengthSq()>1e-8&&baseName(c.name)!==baseName(bone.name));if(!bone||!child)continue;
   const direction=target.clone().sub(bone.getWorldPosition(new T.Vector3())).normalize().applyQuaternion(bone.parent.getWorldQuaternion(new T.Quaternion()).invert());bone.quaternion.setFromUnitVectors(child.position.clone().normalize(),direction);bone.updateMatrixWorld(true);
  }
 }
 return true;
}
export function styleActor(g,color){
 if(g.userData.outfitBase)g.userData.outfitBase.value=g.position.y;
 if(!g.userData.root||g.userData.outfit===color||color==null)return;g.userData.outfit=color;g.userData.outfitBase??={value:g.position.y};
 g.userData.root.traverse(o=>{if(!o.isMesh)return;const list=Array.isArray(o.material)?o.material:[o.material];o.userData.originalWardrobe??=list;const converted=o.userData.originalWardrobe.map(original=>{const material=original.clone(),tint=new T.Color(color);material.customProgramCacheKey=()=>"clothing-height-mask-v2";material.onBeforeCompile=shader=>{shader.uniforms.outfitTint={value:tint};shader.uniforms.outfitBase=g.userData.outfitBase;shader.vertexShader='uniform float outfitBase; varying float outfitHeight;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n outfitHeight=(modelMatrix*vec4(transformed,1.)).y-outfitBase;');shader.fragmentShader='uniform vec3 outfitTint; varying float outfitHeight;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n float neutral=step(abs(diffuseColor.r-diffuseColor.g),.035)*step(abs(diffuseColor.g-diffuseColor.b),.035);float lightCloth=smoothstep(.16,.4,min(diffuseColor.r,min(diffuseColor.g,diffuseColor.b)));float darkCloth=step(.018,diffuseColor.g)*step(diffuseColor.g,.18);float body=step(.35,outfitHeight)*step(outfitHeight,1.42);diffuseColor.rgb=mix(diffuseColor.rgb,outfitTint*(.6+diffuseColor.g),neutral*max(lightCloth,darkCloth)*body*.72);')};return material});if(o.userData.hasWardrobe)for(const material of list)material.dispose();o.userData.hasWardrobe=true;o.material=Array.isArray(o.material)?converted:converted[0]});
}
