import {toast} from './core.js';
export function plateFor(c){let n=73;for(const ch of c.id+'/'+(c.plateCounter||0))n=(n*31+ch.charCodeAt(0))>>>0;return 'IS '+n.toString(36).toUpperCase().padStart(6,'0').slice(-6)}
export function flagged(s,id){return !!id&&(s.hotCars?.[id]?.until||0)>(s.elapsed||0)}
export function changePlate(s,c){if(!c||s.seen||s.cash<350){toast(s,'A new registration needs $350 and no visual pursuit.');return false}s.cash-=350;c.plateCounter=(c.plateCounter||0)+1;if(s.hotCars)delete s.hotCars[c.id];toast(s,'New registration · '+plateFor(c)+' · $350');return true}
