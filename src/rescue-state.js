export const rescueInitial=()=>({version:1,room:0,cabinetOpen:false,medicine:false,healed:false,selected:[],paid:[],warmed:false,pins:{blue:null,red:null},board:false,fed:false,quake:false,holding:false,completed:false});
export function loadRescue(raw){const s=rescueInitial();if(!raw||raw.version!==1)return s;for(const k of ['cabinetOpen','medicine','healed','warmed','board','fed','quake','holding','completed'])s[k]=raw[k]===true;s.room=Number.isInteger(raw.room)?Math.max(0,Math.min(4,raw.room)):0;s.selected=Array.isArray(raw.selected)?[...new Set(raw.selected.filter(x=>typeof x==='string'))].slice(0,2):[];s.paid=Array.isArray(raw.paid)?raw.paid.filter(x=>typeof x==='string').slice(0,2):[];for(const color of ['blue','red'])if(raw.pins?.[color]&&Number.isFinite(raw.pins[color].lon)&&Number.isFinite(raw.pins[color].lat)&&typeof raw.pins[color].region==='string')s.pins[color]={lon:raw.pins[color].lon,lat:raw.pins[color].lat,region:raw.pins[color].region};if(!s.healed)s.room=0;else if(!s.warmed)s.room=Math.min(s.room,1);else if(!s.fed)s.room=Math.min(s.room,2);if(!s.quake){s.holding=false;s.completed=false;s.room=Math.min(s.room,2);}if(s.completed){s.room=4;s.holding=false;}return s;}
export function rescueTransition(current,e){const s=structuredClone(current),deny=message=>({ok:false,state:current,message});let message='',effect='paper';
 switch(e.type){
 case 'open-cabinet':if(s.room!==0||s.cabinetOpen)return deny('이미 열린 보관함이야.');s.cabinetOpen=true;message='보관함이 열렸어. 트로피 사이를 뒤져 보자.';effect='hatch';break;
 case 'search':if(s.room!==0||!s.cabinetOpen)return deny('먼저 보관함의 문을 열어 줘.');if(s.medicine||s.healed)return deny('약은 이미 찾았어.');s.medicine=true;message='대상 트로피가 포진한 곳에서 현수의 약을 찾았다!';break;
 case 'medicine':if(s.room!==0||!s.medicine||s.healed)return deny('현수를 위한 약을 먼저 찾아 줘.');s.medicine=false;s.healed=true;effect='success';message='고마워, 하영아. 이제 조금 살 것 같아.';break;
 case 'next':if(s.room===0&&s.healed)s.room=1;else if(s.room===1&&s.warmed)s.room=2;else if(s.room===2&&s.fed){s.room=3;s.quake=true;}else return deny('현수에게 필요한 것을 먼저 전해 줘.');message=s.room===3?'긴급 지진 경보! 현수의 손을 잡아 줘.':'앞방의 문이 닫히고 다음 기억이 열린다.';effect='door';break;
 case 'select':if(s.room!==1||s.warmed)return deny('지금은 옷을 고를 수 없어.');if(!e.validIds?.includes(e.id))return deny('진열대에 없는 옷이야.');if(s.selected.includes(e.id))s.selected=s.selected.filter(id=>id!==e.id);else{if(s.selected.length===2)return deny('두 벌을 골랐어. 바꾸려면 선택한 옷을 다시 눌러 줘.');s.selected.push(e.id);}s.paid=[];message=`옷 ${s.selected.length} / 2벌을 골랐어.`;break;
 case 'pay':if(s.room!==1||s.selected.length!==2)return deny('옷 두 벌을 골라 직원에게 건네 줘.');if(s.paid.length)return deny('이미 계산한 쇼핑백이 있어.');s.paid=[...s.selected];effect='success';message='게임 속 결제 완료. 쇼핑백을 현수에게 전해 줘.';break;
 case 'clothes':if(s.room!==1||s.paid.length!==2)return deny('먼저 직원에게 두 벌을 계산해 줘.');if(!s.paid.includes('polo-navy')||!s.paid.includes('tomboy-coat')){s.paid=[];return {ok:true,state:s,message:'내가 기억하는 옷은 아닌 것 같아… 직원이 교환해 준대. 다시 골라 줄래?',effect:'error'};}s.warmed=true;effect='success';message='남색 폴로 집업에 TOMBOY 코트! 이제 따뜻해. 고마워 ♡';break;
 case 'pin':if(s.room!==2||s.fed||!['blue','red'].includes(e.color)||!Number.isFinite(e.lon)||!Number.isFinite(e.lat)||e.lon< -180||e.lon>180||e.lat< -90||e.lat>90||typeof e.region!=='string')return deny('지도에서 핀을 놓을 위치를 골라 줘.');s.pins[e.color]={lon:e.lon,lat:e.lat,region:e.region};s.board=false;message=e.region==='ocean'?'여기는 바다야. 육지를 찾아 줘.':'핀을 꽂았어. 두 장소를 이어 읽어 봐.';break;
 case 'board':if(s.room!==2||s.pins.blue?.region!=='Texas'||s.pins.red?.region!=='Brazil')return deny('파란 핀과 빨간 핀의 위치를 다시 생각해 보자.');s.board=true;message='텍사스 vs 브라질 — 제안할 이름판을 챙겼어.';effect='success';break;
 case 'propose':if(s.room!==2||!s.board||s.fed)return deny('지도 아래 이름판을 완성해서 가져와 줘.');s.fed=true;s.board=false;effect='success';message='맞아, 텍사스 데 브라질! 역시 하영이는 내 마음을 아네.';break;
 case 'hold':if(s.room!==3||!s.quake||s.holding)return deny('현수는 바로 옆에 있어.');s.holding=true;message='현수의 손을 잡았다. 함께 400일 방으로 이동하자!';break;
 case 'escape':if(s.room!==3||!s.holding)return deny('현수의 손을 잡고 함께 나가야 해!');s.completed=true;s.holding=false;s.room=4;effect='success';message='현수 구출 성공. 함께 400일 방에 도착했어.';break;
 default:return deny('아직 할 수 없는 동작이야.');
 }return {ok:true,state:s,message,effect};}
export const rescueObjectives=[
 '침대에 누운 현수를 위해 숨겨진 약을 찾아 줘.',
 '추워하는 현수를 위해 두 벌을 골라 계산하고 건네 줘.',
 '세계지도에 두 핀을 꽂아 현수가 가고 싶은 식당을 완성해 줘.',
 '현수의 손을 잡고 함께 400일 방의 출구로 이동해 줘.',
 '현수 구출 성공! 함께 400일 방에 도착했어.'
];
