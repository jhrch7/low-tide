import * as T from '../vendor/three.module.js';
import {animateActor} from './actors.js';
import {surfaceAt} from './world.js';
const V=(x,y,z)=>new T.Vector3(x,y,z),base=n=>n.replace(/_\d+$/,'');
function point(b){return b.getWorldPosition(new T.Vector3())}
function turn(b,child,t){const origin=point(b),current=point(child).sub(origin).normalize(),desired=t.clone().sub(origin).normalize(),world=new T.Quaternion().setFromUnitVectors(current,desired).multiply(b.getWorldQuaternion(new T.Quaternion()));b.quaternion.copy(b.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(world));b.updateMatrixWorld(true)}
export function limb(rig,upper,lower,end,target,pole){const find=name=>rig.skeleton.bones.find(b=>base(b.name)==='mixamorig'+name),c=find(end),ancestor=(child,name)=>{for(let p=child?.parent;p;p=p.parent)if(base(p.name)==='mixamorig'+name)return p;return null},b=ancestor(c,lower)||find(lower),a=ancestor(b,upper)||find(upper);if(!a||!b||!c)return;const origin=point(a),l1=origin.distanceTo(point(b)),l2=point(b).distanceTo(point(c));if(l1<.001||l2<.001)return;const direction=target.clone().sub(origin),d=T.MathUtils.clamp(direction.length(),Math.abs(l1-l2)+.001,l1+l2-.001);direction.normalize();const x=(l1*l1-l2*l2+d*d)/(2*d),perp=pole.clone().sub(origin);perp.addScaledVector(direction,-perp.dot(direction)).normalize();const elbow=origin.clone().addScaledVector(direction,x).addScaledVector(perp,Math.sqrt(Math.max(0,l1*l1-x*x)));turn(a,b,elbow);turn(b,c,target)}
export function seatedActor(g,c,m,dt){
 if(!g.userData.mixer)return false;animateActor(g,false,false,dt);if(g.userData.gun)g.userData.gun.visible=false;
 const bike=m.body==='bike',top=bike?2.0:m.body==='truck'?2.25:m.body==='van'?2.0:m.height-.08,seatX=bike?0:m.width*.215*(m.passenger?-1:1);
 const ground=Number.isFinite(c.seatSurface)?c.seatSurface:m.water?-.4:surfaceAt(c.x,c.z),front=surfaceAt(c.x+Math.sin(c.angle)*2,c.z+Math.cos(c.angle)*2),rear=surfaceAt(c.x-Math.sin(c.angle)*2,c.z-Math.cos(c.angle)*2),slope=m.water?0:-Math.atan2(front-rear,4),rotation=new T.Quaternion().setFromEuler(new T.Euler(slope,c.angle,0,'YXZ'));
 const offset=V(seatX,top-1.77,bike?-.2:-.04).applyQuaternion(rotation);g.position.set(c.x+offset.x,ground+offset.y,c.z+offset.z);g.quaternion.copy(rotation);g.updateMatrixWorld(true);
 const local=(x,y,z)=>V(x,y,z).applyQuaternion(rotation).add(V(c.x,ground,c.z));
 for(const rig of g.userData.rigs){
  for(const [side,sign]of [['Right',-1],['Left',1]]){
   const foot=rig.skeleton.bones.find(b=>base(b.name)==='mixamorig'+side+'Foot'),footQ=foot?.getWorldQuaternion(new T.Quaternion()),ankle=local(seatX+sign*(bike?.3:.14),bike?.67:m.water?.68:.18,bike?-.05:.67),kneePole=local(seatX+sign*.15,top-.77,.95);
   limb(rig,side+'UpLeg',side+'Leg',side+'Foot',ankle,kneePole);
   if(foot&&footQ){foot.quaternion.copy(foot.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(footQ));foot.updateMatrixWorld(true)}
   const steer=(c.steer||0)*.16,hand=m.passenger?local(seatX+sign*.15,top-.6,.35):local(seatX+sign*.16+steer,top-.43+sign*steer*.5,bike?.7:m.length*.21-.02),elbow=local(seatX+sign*.43,top-.6,.28);
   limb(rig,side+'Arm',side+'ForeArm',side+'Hand',hand,elbow);
  }
 }
 g.userData.seated=true;return true;
}

export function crouchActor(g,amount=.36){
 if(!g.userData.rigs)return;g.updateMatrixWorld(true);const feet=[];for(const rig of g.userData.rigs)for(const side of ['Right','Left']){const foot=rig.skeleton.bones.find(b=>base(b.name)==='mixamorig'+side+'Foot');if(foot&&!feet.some(f=>f.side===side)){let primary=foot;for(let p=foot.parent;p?.isBone;p=p.parent)if(base(p.name)==='mixamorig'+side+'Foot')primary=p;feet.push({rig:{skeleton:{bones:[primary]}},side,foot:primary,target:point(primary),q:primary.getWorldQuaternion(new T.Quaternion())})}}
 g.userData.root.position.y-=amount;g.updateMatrixWorld(true);for(const f of feet){const pole=g.localToWorld(V(f.side==='Right'?-.18:.18,.5,1));limb(f.rig,f.side+'UpLeg',f.side+'Leg',f.side+'Foot',f.target,pole);f.foot.quaternion.copy(f.foot.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(f.q));f.foot.updateMatrixWorld(true)}
}
