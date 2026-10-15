import {PROMENADE_PROPS} from './promenade-layout.js';
import {STORY_AFTER} from './story-after.js';
import {COAST_PROPS} from './scenic-route.js';
import {NETWORK_BUILDINGS} from './island-network.js';
import {generateStreetProps} from './streets.js';
import {STORY_NORTH} from './story-north.js';
import {NORTH_BUILDINGS} from './north.js';
import {STORY_MARSH} from './story-marsh.js';
import {MARSH_BUILDINGS} from './marsh.js';
import {STORY_RIDGE} from './story-ridge.js';
import {RIDGE_BUILDINGS} from './ridge.js';
import {STORY_FOREST} from './story-forest.js';
import {FOREST_BUILDINGS} from './forest.js';
import {STORY_WORKS} from './story-works.js';
import {WORKS_BUILDINGS} from './works.js';
import {STORY_BEACH} from './story-beach.js';
import {BEACH_BUILDINGS} from './beach.js';
import {generateScenery} from './world.js';
import {FLEET} from './fleet.js';
import {STORY_ONE} from './story-one.js';
import {PORT_BUILDINGS} from './port.js';
export const VERSION='0.1.0';
export const DISTRICTS=[
{id:'port',name:'Port Sol',x:-320,z:180,color:0xaeb8b8,description:'Union docks. Salt, diesel and old debts.'},
{id:'old',name:'Old Quarter',x:-320,z:-180,color:0xe0cbb1,description:'Limestone lanes beneath the cathedral.'},
{id:'beach',name:'Playa Azul',x:160,z:540,color:0xf2d3bc,description:'Beach clubs, tourists and borrowed money.'},
{id:'works',name:'Cinder Works',x:480,z:180,color:0x899b9b,description:'Warehouses and the island’s night shift.'},
{id:'ridge',name:'Mirador',x:0,z:-540,color:0xe1dcd0,description:'Gated fortunes overlooking the port.'},
{id:'marsh',name:'Salt Marsh',x:-640,z:540,color:0x979e78,description:'A coast that hides what the tide gives back.'},
{id:'forest',name:'Sierra Verde',x:-480,z:-720,color:0xa5ae8b,description:'Pine roads, quarry cuts and radio shadows.'},
{id:'north',name:'Northlight',x:640,z:-540,color:0xc9c6b5,description:'Airstrip, lighthouse and the edge of the island.'}
];
export const BUILDINGS=[...NETWORK_BUILDINGS,...NORTH_BUILDINGS,...MARSH_BUILDINGS,...RIDGE_BUILDINGS,...FOREST_BUILDINGS,...WORKS_BUILDINGS,...PORT_BUILDINGS,...BEACH_BUILDINGS,
{id:'vale',name:'Vale Motors',district:'old',x:-285,z:-140,w:22,d:20,h:9,type:'garage',color:0xb7c5c0,enterable:true},
{id:'cafe',name:'Café Lucero',district:'old',x:-365,z:-140,w:20,d:18,h:13,type:'cafe',color:0xe4b597,enterable:true},
{id:'archive',name:'Municipal Archive',district:'old',x:-285,z:-240,w:26,d:24,h:19,type:'archive',color:0xe3d3b7,enterable:true},
{id:'flat',name:'Mara’s Apartment',district:'old',x:-365,z:-240,w:21,d:22,h:16,type:'home',color:0xc5ccc1,enterable:true}
];
export const VEHICLES=[...FLEET,{id:'porsche',name:'Porsche 911 Carrera 4S',kind:'licensed model / rear-engine coupe',length:4.519,width:1.852,height:1.3,power:21,max:67,grip:1.95,color:0xa32d26,price:41000},{id:'bmw',name:'BMW M4 Competition',kind:'licensed model / performance coupe',length:4.79,width:1.89,height:1.43,power:22,max:68,grip:1.85,color:0x9daba8,price:45000},{id:'ferrari',name:'Ferrari 458 Italia',kind:'licensed model / supercar',length:4.53,width:1.94,height:1.21,power:24,max:76,grip:1.9,color:0xb92421,price:38000},{id:'solano',name:'Solano S6',kind:'sport sedan',length:4.7,width:1.9,height:1.45,power:17,max:52,grip:1.6,color:0x214d52,price:0}];
export const MISSIONS=[...STORY_AFTER,...STORY_ONE,...STORY_BEACH,...STORY_WORKS,...STORY_FOREST,...STORY_RIDGE,...STORY_MARSH,...STORY_NORTH,
{id:'m01',actor:'mara',chapter:1,title:'Salt in the Engine',requires:[],reward:450,intro:'Rafi has bought your father’s debt. A delivery might buy you time.',outro:'The envelope was wet. Someone had already opened it.',steps:[{kind:'talk',at:'cafe',text:'Meet Aunt Ines at Café Lucero.',dialogue:'Ines: Your father left a key. Not money. Never money.'},{kind:'drive',point:{x:-320,z:180},text:'Take the Solano to Port Sol.'},{kind:'inspect',point:{x:-335,z:170},text:'Collect Rafi’s water-stained envelope.',dialogue:'Rafi: No questions. Put it in your father’s old tool chest.'},{kind:'deliver',at:'vale',text:'Bring the envelope into Vale Motors.',dialogue:'Mara: Nico’s badge number. Why is his number in here?'}]},
{id:'n01',actor:'nico',chapter:1,title:'The Returned Badge',requires:[],reward:400,intro:'A diver has vanished. Your badge came back in his pocket.',outro:'Mara is holding the same thread from the other end.',steps:[{kind:'inspect',point:{x:-335,z:170},text:'Inspect the abandoned diver’s bag.',dialogue:'Nico: Salt on everything except the badge. It was planted.'},{kind:'talk',at:'archive',text:'Ask Alma at the Municipal Archive about the permit.',dialogue:'Alma: Meridian bought the seabed before the first survey.'},{kind:'inspect',at:'archive',text:'Read the amended dredging permit.',dialogue:'Nico: Dad signed a witness statement. The day before he died.'},{kind:'talk',at:'vale',text:'Find Mara at Vale Motors.',dialogue:'Nico: We need to talk about Dad. Mara: Get in line.'}]}
];
export const JOBS=[];
export function districtAt(x,z){return DISTRICTS.reduce((a,b)=>Math.hypot(x-a.x,z-a.z)<Math.hypot(x-b.x,z-b.z)?a:b)}

export const SCENERY=generateScenery(BUILDINGS);export const WORLD_BUILDINGS=[...BUILDINGS,...SCENERY];

export const STREET_PROPS=[...generateStreetProps(WORLD_BUILDINGS),...COAST_PROPS,...PROMENADE_PROPS];
