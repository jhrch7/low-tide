export function storyLine(s,text,title='The Vale siblings'){
 if(!text)return;s.storyLog??=[];s.dialogueQueue??=[];
 const line={title,text,time:s.time,mission:s.mission};s.storyLog.push(line);if(s.storyLog.length>160)s.storyLog.shift();s.dialogueQueue.push(line);
}
export function abandonMission(s){if(!s.mission)return false;s.npcs=(s.npcs||[]).filter(n=>n.operation!==s.mission);s.mission=null;s.stage=0;s.missionClock=0;s.flags.partnerSpot=null;s.dialogueQueue=[];return true}
export const escapeText=text=>String(text).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
