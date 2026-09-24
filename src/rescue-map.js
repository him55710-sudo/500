export function inRing(lon,lat,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const [xi,yi]=ring[i],[xj,yj]=ring[j];if(((yi>lat)!==(yj>lat))&&(lon<(xj-xi)*(lat-yi)/(yj-yi)+xi))inside=!inside;}return inside;}
export function regionAt(regions,lon,lat){return regions.find(r=>(r.geometry.type==='Polygon'?[r.geometry.coordinates]:r.geometry.coordinates).some(p=>inRing(lon,lat,p[0])&&!p.slice(1).some(hole=>inRing(lon,lat,hole))))?.name||'ocean';}
export const regionLabel=name=>usStates.find(s=>s.name===name)?.label||({Brazil:'브라질','United States of America':'미국',Canada:'캐나다',Mexico:'멕시코',Argentina:'아르헨티나',Japan:'일본',China:'중국',France:'프랑스',Australia:'호주',ocean:'바다'}[name]||name||'');
import {usStates} from './rescue-us-states.js';
export {usStates};
