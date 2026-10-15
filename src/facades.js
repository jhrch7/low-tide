import * as T from '../vendor/three.module.js';
export function facadeDetails(v,b,g){
 const stone=v.mat(0xa5a48e,.95),iron=v.mat(0x4b5f59,.65,.2),wood=v.mat(0x7e7154,.83),trim=v.mat(0xd4c9ad,.8);
 v.box(b.w+.6,12,b.d+.6,stone,0,-5.9,0,g);
 const front=b.d/2+.35;if(b.enterable){for(let i=0;i<3;i++)v.box(3.4+i*.4,.16,1.2-i*.25,stone,0,.08+i*.16,front+.7-i*.3,g);for(const side of [-1,1]){v.box(.15,3.1,.15,trim,side*1.35,1.6,front,g);v.box(.3,.3,.3,trim,side*1.35,3.05,front,g)}if(b.district==='old'){const arch=new T.Mesh(new T.TorusGeometry(1.35,.14,7,20,Math.PI),trim);arch.position.set(0,3.05,front);g.add(arch)}}
 for(const x of [-b.w*.27,b.w*.27]){const ac=v.box(1.5,.85,.6,0x9aa89a,x,3.9,front+.2,g);const fan=new T.Mesh(new T.CylinderGeometry(.27,.27,.05,16),iron);fan.rotation.x=Math.PI/2;fan.position.set(x+.35,3.9,front+.55);g.add(fan);for(let i=0;i<4;i++)v.box(.65,.035,.03,iron,x-.3,3.65+i*.15,front+.55,g)}
 for(const x of [-b.w*.31,b.w*.31])for(const y of [5,8.3])if(y<b.h-1){for(const side of [-1,1]){v.box(.55,2,.12,wood,x+side*1.25,y,front-.1,g);for(let j=0;j<7;j++)v.box(.5,.05,.13,trim,x+side*1.25,y-.8+j*.25,front,g)}}
 const tank=new T.Mesh(new T.CylinderGeometry(1.1,1.1,2,16),iron);tank.position.set(-b.w*.28,b.h+1.1,-b.d*.2);tank.castShadow=true;g.add(tank);v.box(.1,b.h+2,.1,iron,-b.w*.45,(b.h+2)/2,-b.d/2-.2,g);for(let i=0;i<4;i++)v.box(.7,.04,.04,trim,b.w*.28,b.h+.4+i*.22,0,g);
}
