import {plateFor} from './registrations.js';
import * as T from '../vendor/three.module.js';import {limb} from './seated.js';
export function weaponView(g,inv){
 const gun=g.userData.gun;if(!gun)return;const signature=[inv.weapon,inv.mods?.suppressor,inv.mods?.optic,inv.mods?.damage,inv.mods?.finish].join('/');if(gun.userData.signature===signature)return;gun.userData.signature=signature;const materials=new Set();for(const o of [...gun.children]){o.traverse(n=>{n.geometry?.dispose();if(n.material)materials.add(n.material)});gun.remove(o)}for(const m of materials)m.dispose();
 const long=inv.weapon!=='pistol',metal=new T.MeshStandardMaterial({color:inv.mods?.finish==='sand'?0x968b68:inv.mods?.finish==='marine'?0x32606a:0x252d32,roughness:.34,metalness:.7}),dark=new T.MeshStandardMaterial({color:0x171d20,roughness:.85}),glass=new T.MeshStandardMaterial({color:0x66959d,roughness:.15,metalness:.6});
 const box=(w,h,d,m,x,y,z)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);gun.add(o)};
 const tube=(r,l,m,y,z)=>{const o=new T.Mesh(new T.CylinderGeometry(r,r,l,10),m);o.rotation.x=Math.PI/2;o.position.set(0,y,z);gun.add(o)};
 if(!long){box(.065,.09,.24,metal,0,.02,.09);box(.055,.13,.075,dark,0,-.08,.015);tube(.018,.07,dark,.02,.24)}
 else{const rifle=inv.weapon==='rifle',shotgun=inv.weapon==='shotgun',len=rifle?.52:shotgun?.62:.28;box(.085,.11,.28,metal,0,.01,.13);box(.065,.18,.1,dark,0,-.1,.08);tube(.022,len,metal,.015,.35+len*.28);box(.08,.08,shotgun?.28:.18,dark,0,-.02,.37);box(.085,.13,.25,dark,0,-.01,-.15);if(!shotgun)box(.065,.2,.1,metal,0,-.13,.23)}
 const end=long?(inv.weapon==='rifle'?.76:inv.weapon==='shotgun'?.86:.52):.28;if(inv.mods?.suppressor)tube(.033,.23,dark,.02,end+.08);if(inv.mods?.optic){tube(.032,.15,dark,.12,long?.22:.12);box(.045,.025,.03,glass,0,.12,(long?.22:.12)+.077)}if(inv.mods?.damage)tube(.027,.055,metal,.02,end);
 g.userData.longGun=long;gun.userData.weapon=inv.weapon;gun.userData.attachments=Object.keys(inv.mods||{}).filter(k=>inv.mods[k]);
}
export function supportWeapon(g){if(!g.userData.longGun||!g.userData.gun?.visible)return;g.updateMatrixWorld(true);const target=g.userData.gun.localToWorld(new T.Vector3(0,-.04,.36)),pole=g.localToWorld(new T.Vector3(.45,1,.1));for(const rig of g.userData.rigs)limb(rig,'LeftArm','LeftForeArm','LeftHand',target,pole)}
export function carCosmetics(v,g,c,m){const plate=v.label(plateFor(c),.43);plate.position.set(0,.53,-m.length/2-(['bmw','porsche','ferrari'].includes(c.model)?-.22:.11));plate.rotation.y=Math.PI;g.add(plate);
 const colors={silver:0xb6c1c6,gold:0xb3985c,black:0x343e44},color=colors[c.cosmetic?.rims];if(color!=null)for(const wheel of g.userData.wheels||[])wheel.traverse(o=>{if(!o.isMesh||!o.material?.color||o.material.color.getHSL({}).l<.18)return;o.material=o.material.clone();o.material.color.setHex(color);o.material.metalness=.85});
 if(c.cosmetic?.kit&&m.body!=='bike'&&!m.water){for(const z of [-m.length*.45,m.length*.45])v.box(m.width*1.02,.055,.32,0x1b2429,0,.32,z,g);for(const x of [-m.width*.49,m.width*.49])v.box(.08,.12,m.length*.43,0x1b2429,x,.35,0,g);v.box(m.width*.76,.06,.27,0x25313a,0,m.height+.12,-m.length*.4,g)}
}
