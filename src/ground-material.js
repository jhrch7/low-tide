import * as T from '../vendor/three.module.js';
export function groundMaterial(v){const loader=new T.TextureLoader(),maps={};v.groundReady=0;for(const key of ['grass_path_2','forest_floor','sand_03']){const map=loader.load('assets/'+key+'.jpg',()=>v.groundReady++,undefined,e=>v.assetErrors.push('Ground texture: '+key));map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=Math.min(4,v.r.capabilities.getMaxAnisotropy());maps[key]=map}
 const material=new T.MeshStandardMaterial({color:0xffffff,roughness:.98});material.customProgramCacheKey=()=> 'island-ground-1';material.onBeforeCompile=shader=>{Object.assign(shader.uniforms,{groundGrass:{value:maps.grass_path_2},groundForest:{value:maps.forest_floor},groundSand:{value:maps.sand_03}});shader.vertexShader='varying vec3 vGround;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vGround=position;');shader.fragmentShader='varying vec3 vGround;uniform sampler2D groundGrass;uniform sampler2D groundForest;uniform sampler2D groundSand;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
 vec2 uvGround=vGround.xz*.28;
 vec3 ground=texture2D(groundGrass,uvGround).rgb;
 vec3 leaf=texture2D(groundForest,uvGround*.62).rgb;
 vec3 sand=texture2D(groundSand,uvGround*.8).rgb;
 float highland=smoothstep(560.,740.,-vGround.z);
 ground=mix(ground,leaf,highland*.85);
 vec2 radial=vGround.xz/vec2(1150.,1000.);float angle=atan(radial.y,radial.x);float edge=1.+.045*sin(angle*5.)+.04*cos(angle*7.);
 float shore=smoothstep(edge*.83,edge*.96,length(radial));ground=mix(ground,sand,shore);
 float macro=.9+.12*sin(vGround.x*.029)*sin(vGround.z*.023);diffuseColor.rgb*=ground*macro;
 `)};return material}
