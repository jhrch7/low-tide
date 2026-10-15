import {boatBody} from './marine-view.js';
import * as T from '../vendor/three.module.js';
import {mergeGeometries} from '../vendor/BufferGeometryUtils.js';
export function vehicleBody(v,c,m){if(m.water)return boatBody(v,c,m);
 const g=new T.Group(),w=m.width,l=m.length,h=m.height,body=m.body||'sedan',paint=new T.MeshPhysicalMaterial({color:c.color??0x426769,roughness:.28,metalness:.7,clearcoat:1,clearcoatRoughness:.17}),glass=new T.MeshPhysicalMaterial({color:0x526e7c,roughness:.12,metalness:.08,transparent:true,opacity:.42,depthWrite:false,side:T.DoubleSide,clearcoat:1}),dark=v.mat(0x141b20,.88),trim=v.mat(0xaab8bf,.24,.9),rubber=v.mat(0x15191b,.96),seat=v.mat(0x262a28,.9),wheels=[];
 const box=(a,b,d,mat,x,y,z)=>v.box(a,b,d,mat,x,y,z,g);
 const beam=(from,to,r,mat)=>{const a=new T.Vector3(...from),b=new T.Vector3(...to),o=new T.Mesh(new T.CylinderGeometry(r,r,a.distanceTo(b),6),mat);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.sub(a).normalize());g.add(o);return o};
 const shell=(points,width,mat)=>{const shape=new T.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth:width,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:2,steps:1});geo.translate(0,0,-width/2);geo.rotateY(-Math.PI/2);const mesh=new T.Mesh(geo,mat);mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);return mesh};
 const radius=body==='truck'?.49:body==='bike'?.34:body==='suv'||body==='pickup'?.4:.34,axle=l*.31;
 if(body==='bike'){
  beam([0,.43,-.75],[0,.83,.5],.065,trim);beam([0,.43,.75],[0,1.15,.55],.055,trim);box(.43,.3,.6,paint,0,.85,.25);box(.4,.12,.7,seat,0,1,-.35);box(.8,.07,.08,trim,0,1.17,.7);box(.32,.18,.15,0xf5dda4,0,1.05,.85);beam([.16,.45,-.65],[.16,.52,.4],.045,trim);
 }else{
  const outline=[[-l/2,.37],[-l*.49,.67],[-l*.37,.87],[l*.38,.84],[l*.49,.62],[l/2,.37]];
  for(const center of [axle,-axle]){const r=radius+.06;outline.push([center+r,.37]);for(let i=0;i<=16;i++){const a=i*Math.PI/16;outline.push([center+r*Math.cos(a),.37+r*Math.sin(a)])}}
  outline.push([-l/2,.37]);shell(outline,w,paint);
  box(w*.94,.1,.15,dark,0,.47,l/2+.01);box(w*.96,.12,.14,dark,0,.46,-l/2-.015);box(w*.91,.13,l*.48,dark,0,.34,0);
  if(body==='truck'){
   box(w*.98,2.1,l*.55,0xbab9ac,0,1.6,-l*.18);box(w*.92,1.7,l*.29,paint,0,1.2,l*.31);box(w*.83,.65,.04,glass,0,1.65,l*.46);
   for(const side of [-1,1]){box(.025,.65,.8,glass,side*w*.47,1.65,l*.29);for(let i=0;i<8;i++)box(.04,1.9,.06,trim,side*w*.5,1.6,-l*.43+i*l*.07)}
  }else if(body==='van'){
   shell([[-l*.43,.85],[-l*.4,h-.15],[l*.22,h-.15],[l*.4,1.2],[l*.43,.85]],w*.94,paint);box(w*.83,.7,.025,glass,0,1.65,l*.39);for(const x of [-w*.48,w*.48]){box(.025,.7,1,glass,x,1.65,l*.23);box(.02,.025,l*.4,trim,x,1.02,-.5);box(.05,.055,.25,trim,x,1.16,.65)}
  }else{
   const rear=body==='pickup'?-.12:['estate','hatch','suv'].includes(body)?-.42:-.32,front=body==='muscle'?.19:.2,roofRear=rear+.15,roofFront=front-.08,base=.87,roof=h-.09;
   const cabin=shell([[l*rear,base],[l*roofRear,roof],[l*roofFront,roof],[l*(front+.18),base]],w*.82,glass);cabin.name='transparent-cabin';
   box(w*.83,.075,l*(roofFront-roofRear)+.07,paint,0,roof+.04,l*(roofFront+roofRear)/2);
   for(const x of [-w*.42,w*.42]){
    beam([x,base,l*rear],[x,roof,l*roofRear],.035,paint);beam([x,base,l*(front+.18)],[x,roof,l*roofFront],.04,paint);beam([x,base,-.08],[x,roof,-.08],.032,dark);
    box(.035,.04,l*(front+.18-rear),trim,x,.87,l*(front+.18+rear)/2);box(.035,.02,l*.31,dark,x,.66,-l*.02);box(.04,.055,.2,trim,x,1.0,-l*.13);
    if(body!=='coupe'&&body!=='muscle')box(.04,.05,.19,trim,x,.94,-l*.32);
    // Seats, dash and console remain visible through the cabin rather than an opaque window block.
    box(.44,.19,.52,seat,x*.51,.64,.03);const back=box(.44,.47,.13,seat,x*.51,.91,-.23);back.rotation.x=-.15;box(.28,.18,.12,seat,x*.51,1.16,-.3);
    if(body!=='pickup')box(.44,.33,.4,seat,x*.51,.8,-l*.24);
    box(.16,.11,.28,paint,x*1.13,1.02,l*.22);box(.02,.08,.19,glass,x*1.22,1.03,l*.22);
   }
   box(w*.72,.13,.3,dark,0,.92,l*.25);box(.19,.16,.8,dark,0,.69,-.06);
   const steering=new T.Mesh(new T.TorusGeometry(.18,.018,5,16),rubber);steering.position.set(w*.215,1.04,l*.21);steering.rotation.x=-.3;g.add(steering);
   // Front and rear pane trim, bonnet shut lines and radiator opening give each silhouette readable scale.
   for(const z of [l*(front+.18),l*rear])box(w*.8,.035,.03,dark,0,.89,z);
   box(w*.83,.015,.018,dark,0,.847,l*.39);box(w*.81,.015,.018,dark,0,.869,-l*.38);
   if(body==='pickup'){box(w*.83,.04,l*.28,dark,0,.89,-l*.33);for(const x of [-w*.44,w*.44])box(.12,.3,l*.29,paint,x,1,-l*.33)}
   if(['rally','muscle'].includes(body)){box(w*.8,.065,.26,paint,0,h+.06,-l*.4);for(const x of [-.4,.4])box(.06,.22,.08,dark,x,h-.07,-l*.4)}
  }
  for(const x of [-w*.35,w*.35]){box(w*.23,.15,.025,0xe8e7d1,x,.71,l/2+.034);box(w*.23,.13,.025,0xb02d22,x,.71,-l/2-.034)}
  box(w*.46,.16,.035,dark,0,.58,l/2+.045);for(let i=0;i<3;i++)box(w*.45,.014,.04,trim,0,.53+i*.05,l/2+.07);box(.43,.11,.02,0xe4e6dc,0,.53,-l/2-.08);box(.32,.025,.025,dark,0,.53,-l/2-.093);
  for(const x of [-w*.3,w*.3])beam([x,.35,-l/2-.09],[x,.35,-l/2+.15],.046,trim);
 }
 const xs=body==='bike'?[0]:[-w/2,w/2];for(const x of xs)for(const z of [-axle,axle]){
  const group=new T.Group();group.position.set(x,radius+.03,z);group.userData.front=z>0;
  const tire=new T.Mesh(new T.CylinderGeometry(radius,radius,body==='bike'?.13:.22,20),rubber);tire.rotation.z=Math.PI/2;group.add(tire);
  for(const side of body==='bike'?[-1,1]:[Math.sign(x)]){
   const rim=new T.Mesh(new T.TorusGeometry(radius*.66,.023,5,16),trim);rim.rotation.y=Math.PI/2;rim.position.x=side*.12;group.add(rim);
   const disc=new T.Mesh(new T.CylinderGeometry(radius*.57,radius*.57,.015,16),v.mat(0x5b6164,.6,.7));disc.rotation.z=Math.PI/2;disc.position.x=side*.105;group.add(disc);
   for(let i=0;i<5;i++){const a=i*Math.PI*2/5,spoke=new T.Mesh(new T.BoxGeometry(.025,.055,radius*1.18),trim);spoke.rotation.x=a;spoke.position.x=side*.125;group.add(spoke)}
  }
  // Merge the stationary rim pieces in each wheel; one wheel remains one rotating group.
  mergeParts(group);g.add(group);wheels.push(group);
 }
 if(c.police){box(1,.12,.3,0x204cae,0,h+.2,.1);box(.5,.12,.3,0xbf332b,.3,h+.2,.1)}
 mergeParts(g,new Set(wheels));g.userData.model=c.model;g.userData.wheels=wheels;g.userData.cabin=body!=='bike';return g;
}
function mergeParts(group,skip=new Set()){
 const batches=new Map();group.updateMatrixWorld(true);for(const child of [...group.children]){if(skip.has(child)||!child.isMesh||child.material.transparent)continue;child.updateMatrix();const geometry=child.geometry.index?child.geometry.toNonIndexed():child.geometry.clone();geometry.applyMatrix4(child.matrix);const key=child.material.uuid;if(!batches.has(key))batches.set(key,{mat:child.material,parts:[]});batches.get(key).parts.push(geometry);child.geometry.dispose();group.remove(child)}
 for(const {mat,parts} of batches.values()){const geo=mergeGeometries(parts,false);for(const p of parts)p.dispose();const mesh=new T.Mesh(geo,mat);mesh.castShadow=mesh.receiveShadow=true;group.add(mesh)}
}
