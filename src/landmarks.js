import * as T from '../vendor/three.module.js';
export function marshland(v){
 const water=new T.MeshStandardMaterial({color:0x426e67,roughness:.3,metalness:.25});
 for(let i=0;i<9;i++){
  const x=-780+(i%3)*115,z=650+Math.floor(i/3)*60,pond=new T.Mesh(new T.CircleGeometry(32+i%3*7,32),water);pond.rotation.x=-Math.PI/2;pond.scale.set(1.2,.65,1);pond.position.set(x,.09,z);v.world.add(pond);
  for(let j=0;j<7;j++){
   const a=j*Math.PI*2/7,px=x+Math.cos(a)*35,pz=z+Math.sin(a)*23;
   for(let k=0;k<3;k++){const root=new T.Mesh(new T.CylinderGeometry(.12,.5,3.3,6),v.mat(0x766e52));root.position.set(px+(k-1)*.7,1.4,pz);root.rotation.z=(k-1)*.3;v.world.add(root)}
   const crown=new T.Mesh(new T.SphereGeometry(2.9,8,6),v.mat(j%2?0x557455:0x657f59));crown.scale.set(1.4,.7,1);crown.position.set(px,4.1,pz);v.world.add(crown);
   for(let k=0;k<4;k++){v.box(.12,1.4,.12,0x89936a,px+k*.3,.7,pz+3);v.box(.15,.4,.15,0x7a674e,px+k*.3,1.5,pz+3)}
  }
 }
 for(let i=0;i<28;i++){v.box(12,.08,.8,0x9a8a65,-640,.08,600+i*2.8);if(i%3===0)for(const side of [-1,1]){v.box(.14,1.1,.14,0x8c7f5d,-640+side*5.5,.55,600+i*2.8);v.box(.1,.1,7,0xb8ac83,-640+side*5.5,1.05,600+i*2.8)}}
 for(let i=0;i<8;i++)v.box(2.5,.7,1.2,i%2?0x87a6a0:0xad9d77,-710+i*7,.4,460);
}
export function northlight(v){
 v.box(28,.08,190,0x626d68,610,.08,-700);v.box(78,.08,24,0x7b8375,645,.07,-605);
 for(let i=0;i<9;i++)v.box(.3,.02,7,0xdddcca,610,.14,-780+i*20);
 for(const z of [-786,-614])for(let i=0;i<5;i++)v.box(1.4,.02,8,0xe7e0c8,600+i*5,.14,z);
 for(let i=0;i<20;i++)for(const side of [-1,1]){v.box(.12,.6,.12,0x8d9b8e,610+side*16,.3,-790+i*10);v.box(.3,.12,.3,0xe4bd6c,610+side*16,.65,-790+i*10)}
 const hull=new T.Mesh(new T.CylinderGeometry(1.4,.8,18,16),v.mat(0xd7d4c1,.45,.25));hull.rotation.x=Math.PI/2;hull.position.set(610,2.9,-655);v.world.add(hull);
 v.box(23,.18,3,0xc1c9bc,610,2.8,-655);v.box(5,.18,2,0xaabbb5,610,3.4,-663);v.box(.2,3,3,0x466c70,610,4.1,-663);
 for(const side of [-1,1]){v.box(.25,1.4,.25,0x6c7369,610+side*2,1.6,-655);const wheel=new T.Mesh(new T.CylinderGeometry(.5,.5,.35,12),v.mat(0x303b39));wheel.rotation.z=Math.PI/2;wheel.position.set(610+side*2,.75,-655);v.world.add(wheel)}
 const x=780,z=-625;for(let i=0;i<6;i++){const cylinder=new T.Mesh(new T.CylinderGeometry(3-i*.15,3.2-i*.15,3.5,20),v.mat(i%2?0xbca783:0xdfd7bb));cylinder.position.set(x,1.75+i*3.5,z);v.world.add(cylinder)}
 v.box(5,2,5,0x739c9c,x,22,z);const roof=new T.Mesh(new T.ConeGeometry(4,2,16),v.mat(0x4e6a67));roof.position.set(x,24,z);v.world.add(roof);
 for(let i=0;i<12;i++)v.box(1,1,1,0x8c9380,780+Math.cos(i*Math.PI/6)*10,.5,z+Math.sin(i*Math.PI/6)*10);
}
