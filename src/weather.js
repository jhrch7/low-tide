const cycle=['clear','cloudy','rain','cloudy'];
export function tickWeather(s,dt){s.weatherClock=(s.weatherClock||0)+dt;if(s.weatherClock>=180){s.weatherClock-=180;s.weatherPhase=((s.weatherPhase??Math.max(0,cycle.indexOf(s.weather)))+1)%cycle.length;s.weather=cycle[s.weatherPhase]}}
export const roadGrip=s=>s.weather==='rain'?.78:1;
