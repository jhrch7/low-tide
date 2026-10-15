import {restore,toast} from './core.js';
export function rememberMission(s){const checkpoint=structuredClone(s);delete checkpoint.missionCheckpoint;checkpoint.notices=[];checkpoint.effects=[];s.missionCheckpoint=checkpoint}
export function retryMission(s){if(!s.mission||!s.missionCheckpoint||s.missionCheckpoint.mission!==s.mission)return false;const next=restore(s.missionCheckpoint);rememberMission(next);for(const key of Object.keys(s))delete s[key];Object.assign(s,next);toast(s,'Lead restarted from its starting save.');return true}
