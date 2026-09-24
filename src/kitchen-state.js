import {employmentOrder,ingredients,recipes,recipeKeys} from './kitchen-data.js';
export const initialKitchen=()=>({version:1,lights:false,bag:{},progress:Object.fromEntries(recipeKeys.map(k=>[k,0])),orderAt:null,received:false,completed:false});
export function loadKitchen(value){
 const s=initialKitchen();if(!value||value.version!==1)return s;s.lights=value.lights===true;
 for(const k of Object.keys(ingredients))if(Number.isInteger(value.bag?.[k])&&value.bag[k]>0&&value.bag[k]<=9)s.bag[k]=value.bag[k];
 for(const k of recipeKeys){const n=value.progress?.[k];if(Number.isInteger(n)&&n>=0&&n<=recipes[k].steps.length)s.progress[k]=n;}
 s.orderAt=Number.isFinite(value.orderAt)&&value.orderAt>0?value.orderAt:null;s.received=value.received===true&&s.orderAt!==null;s.completed=recipeKeys.every(k=>s.progress[k]===recipes[k].steps.length);return s;
}
export function kitchenTransition(current,event,{order=employmentOrder,now=Date.now()}={}){
 const s=structuredClone(current),deny=message=>({ok:false,state:current,message});
 if(event.type==='power'){
  if(s.lights)return deny('이미 불이 켜졌어.');if(!order)return deny('현수의 근무 기간 순서를 아직 설정하지 않았어요.');
  if(JSON.stringify(event.stations)!==JSON.stringify(order))return deny('머물렀던 기간을 다시 떠올려 봐. 짧게 일한 곳부터야.');s.lights=true;return{ok:true,state:s,message:'딸깍. 우리의 두 번째 식탁에 불이 켜졌다.',effect:'power'};
 }
 if(!s.lights)return deny('먼저 빛나는 7호선 문제를 풀어 불을 켜자.');
 if(event.type==='take'){
  if(!ingredients[event.item])return deny('이 재료는 진열대에 없어.');if((s.bag[event.item]||0)>=9)return deny('가방에 충분히 담았어.');s.bag[event.item]=(s.bag[event.item]||0)+1;return{ok:true,state:s,message:ingredients[event.item][0]+'을 담았다.',effect:'paper'};
 }
 if(event.type==='return'){
  if(!ingredients[event.item]||!(s.bag[event.item]>0))return deny('가방에 없는 재료야.');s.bag[event.item]--;if(!s.bag[event.item])delete s.bag[event.item];return{ok:true,state:s,message:ingredients[event.item][0]+'을 진열대에 돌려놓았다.',effect:'paper'};
 }
 const r=recipes[event.recipe];if(!r)return deny('작업대를 먼저 골라 줘.');const index=s.progress[event.recipe],step=r.steps[index];if(!step)return deny('이미 정성껏 완성한 요리야.');
 if(event.type==='order'){
  if(event.recipe!=='chicken'||step.id!=='order')return deny('주문은 이미 접수했어.');
  if(event.brand!=='BBQ'||event.cut!=='drumsticks'||event.flavor!=='half')return deny('BBQ · 닭다리만 · 양념 반 / 후라이드 반을 확인해 줘.');s.orderAt=now;s.progress.chicken++;return{ok:true,state:s,effect:'order',message:'주문 접수! 10초 뒤 배달기사가 도착해.'};
 }
 if(event.type!=='cook')return deny('작업을 선택해 줘.');
 if(event.action!==step.id)return deny('레시피 순서를 확인해 줘. 지금은 ‘'+step.title+'’ 차례야.');
 if(event.recipe==='chicken'&&step.id==='order')return deny('휴대폰에서 먼저 주문해 줘.');
 if(step.id==='receive'){
  if(s.orderAt===null||now<s.orderAt+10000)return deny('배달 중이야. 잠시만 기다려 줘.');s.received=true;
 }
 if((event.heat||'off')!==step.heat)return deny('불 세기를 '+({off:'끄기',low:'약불',medium:'중불'})[step.heat]+'로 맞춰 줘.');
 if(step.id==='measure'&&JSON.stringify(event.amounts)!==JSON.stringify([2,1,1,1,1]))return deny('소스는 케첩 2T, 나머지 네 가지는 각각 1T야.');
 if(step.id==='water'&&event.temperature!==50)return deny('따뜻한 물 50°C로 준비해 줘.');
 const missing=step.need.filter(k=>!(s.bag[k]>0));if(missing.length)return deny('중앙 마트에서 '+missing.map(k=>ingredients[k][0]).join(', ')+'을 가져와 줘.');
 for(const k of step.need){s.bag[k]--;if(!s.bag[k])delete s.bag[k];}s.progress[event.recipe]++;
 s.completed=recipeKeys.every(k=>s.progress[k]===recipes[k].steps.length);
 return{ok:true,state:s,effect:s.progress[event.recipe]===r.steps.length?'complete-dish':'cook',message:s.completed?'네 가지 요리에 담긴 마음을 모두 찾았어.':step.title+' 완료.'};
}
