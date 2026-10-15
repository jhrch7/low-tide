const sizes={pawn:[22,24],chopshop:[26,28],casino:[28,28],range:[24,40],shelter:[18,22],transport:[24,26],radio:[22,24],police:[24,28],garage:[24,24],warehouse:[22,26],factory:[24,26],clinic:[22,24],bank:[22,24],home:[16,20],hotel:[18,22],club:[24,26],union:[22,24],chapel:[20,26],gallery:[24,26],villa:[24,26],tower:[18,22]};
const cache=new Map();
export function roomPlan(b){if(cache.has(b.id))return cache.get(b.id);const [w,d]=sizes[b.type]||[20,22],props=[],add=(kind,x,z,pw,pd,h=1,solid=true)=>props.push({kind,x,z,w:pw,d:pd,h,solid});
 add('counter',0,-2.8,4,1.3,1.1);
 const dining=['cafe','union','fishery','club'].includes(b.type),home=['home','hotel','villa','shelter'].includes(b.type),industrial=['garage','chopshop','warehouse','factory','dispatch','utility','quarry'].includes(b.type);
 if(dining){for(const x of [-w*.31,w*.31])for(const z of [-6,0,4]){add('table',x,z,2,1.6,.8);add('chair',x,z+1.4,.7,.7,.8);add('chair',x,z-1.4,.7,.7,.8)}add('kitchen',-w/2+1,-d/2+2,1.5,3,2)}
 else if(b.type==='casino'){for(const x of [-8,8])for(const z of [-6,2,7]){add('felt',x,z,3.6,2,.85);add('chair',x,z+1.8,.7,.7,.8)}for(const x of [-10,-6,6,10])add('slot',x,-11,1.2,1,2)}
 else if(b.type==='range'){for(const x of [-7,0,7]){add('lane',x,-10,5.5,18,1,false);add('target',x,-17,1,1,2,false)}add('bench',-8,10,4,1,.8)}
 else if(b.type==='radio'){for(const x of [-7,7])for(const z of [-6,0,6])add('receiver',x,z,2,2,2.2);add('desk',0,-8,4,1.8,1)}
 else if(b.type==='transport'){for(const x of [-7,7])for(const z of [0,5])add('bench',x,z,3,1,.8);add('ticket',-7,-8,3,2,2)}
 else if(b.type==='police'){for(const x of [-7,7])for(const z of [-6,1])add('desk',x,z,3,1.5,.9);for(const x of [-7,7])add('bench',x,7,3,1,.8);add('bars',7,-11,5,.2,3)}
 else if(home){add('sofa',-w*.28,-2.5,3,1.3,.8);add('coffee',-w*.28,0,2,1,.5);add('bed',w*.26,-3,3,4,.6);add('partition',w*.08,0,.18,4,3.4);add('wardrobe',w/2-1,-d/2+2,1,2,2.6)}
 else if(b.type==='clinic'){for(const x of [-7,7])for(const z of [-5,1])add('bed',x,z,2.3,3,.8);add('medical',-w/2+1,-d/2+2,1,2,2.6)}
 else if(b.type==='chapel'){for(const x of [-5,5])for(const z of [-5,-1,3])add('bench',x,z,3,1.1,.8);add('altar',0,-d/2+2,4,1.5,1.1)}
 else if(industrial){if(['garage','chopshop'].includes(b.type))add('workcar',-6,-3,2.1,5,1.5);for(const x of [-w/2+1.5,w/2-1.5])for(const z of [-7,-2,3])add(b.type==='utility'?'cabinet':'shelf',x,z,2,3,2.8);add('bench',5,2,4,1.2,.9)}
 else if(b.type==='gallery'){for(const x of [-8,8])for(const z of [-6,0,5])add('plinth',x,z,1.5,1.5,1.4);add('bench',0,3,4,1,.6)}
 else{for(const x of [-w/2+1.2,w/2-1.2])for(const z of [-6,0])add('bookcase',x,z,1.5,3,2.6);add('desk',-5,2,3,1.5,.9);add('chair',-5,3.5,.8,.8,.9);add(b.type==='bank'?'safe':'cabinet',6,-7,2,2.2,2.5)}
 const plan={w,d,entryZ:d/2-3.5,exitZ:d/2-4.5,theme:home?'home':dining?'dining':industrial?'industrial':b.type,props,obstacles:props.filter(p=>p.solid)};cache.set(b.id,plan);return plan;
}
export function roomFree(plan,x,z,r=.35){return Math.abs(x)<plan.w/2-r&&Math.abs(z)<plan.d/2-r&&!plan.obstacles.some(p=>Math.abs(x-p.x)<p.w/2+r&&Math.abs(z-p.z)<p.d/2+r)}
