export const FACTIONS=[{id:'locals',name:'Island residents',text:'Trust earned through help and lost through violence.'},{id:'union',name:'Port Sol Union',text:'Working crews, witnesses and the common coast.'},{id:'rafi',name:'Rafi’s network',text:'Criminal contacts and the island’s informal freight.'},{id:'meridian',name:'Meridian',text:'The private security company defending the trust.'}];
export function reputation(s,id){return Math.max(-100,Math.min(100,s.rep?.[id]||0))}
export function changeRep(s,id,amount){s.rep??={};s.rep[id]=Math.max(-100,Math.min(100,reputation(s,id)+amount))}
export function missionReputation(s,m){changeRep(s,'meridian',-3);changeRep(s,m.actor==='mara'?'rafi':m.actor==='nico'?'locals':'union',m.actor==='both'?5:3);if(m.id==='j12'){changeRep(s,'locals',s.flags.ending==='public'?20:5);changeRep(s,'union',10);changeRep(s,'rafi',s.flags.ending==='network'?30:-10)}}
export function servicePrice(s,cost){const trust=reputation(s,'locals');return Math.round(cost*(trust>=40?.85:trust<=-25?1.25:1))}
export function standing(s,id){const value=reputation(s,id);return value>=40?'Trusted':value<=-40?'Hostile':value>10?'Known':value<-10?'Unwelcome':'Neutral'}
