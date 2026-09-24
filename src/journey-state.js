export const menu = [
 {id:'beef',name:'소고기',liked:true,color:'#cf5364'}, {id:'brisket',name:'양지',liked:false,color:'#975043'},
 {id:'watermelon',name:'수박',liked:true,color:'#ed4656'}, {id:'tofu',name:'취두부',liked:false,color:'#77734a'},
 {id:'noodles',name:'당면',liked:true,color:'#dbc294'}, {id:'mushroom',name:'버섯',liked:false,color:'#c4a58a'},
 {id:'bokchoy',name:'청경채',liked:true,color:'#63a73d'}, {id:'cilantro',name:'고수',liked:false,color:'#297b38'},
 {id:'chicken',name:'치킨',liked:true,color:'#d5973e'}, {id:'quail',name:'메추리알',liked:false,color:'#e4d1ae'}
];
export const initialJourney=()=>({version:1,zone:'hell',chat:false,freed:false,photo:false,computer:false,ticket:false,bowl:false,served:false,seat:null,flight:0,arrived:false,dining:false,chosen:[],rejected:[],satisfied:false,tea:false,drank:false,key:false,completed:false});
export function loadJourney(raw){
 const s=initialJourney();if(raw?.version!==1)return s;
 for(const k of ['chat','freed','photo','computer','ticket','bowl','served','arrived','dining','satisfied','tea','drank','key','completed'])s[k]=raw[k]===true;
 s.chosen=[...new Set((Array.isArray(raw.chosen)?raw.chosen:[]).filter(id=>menu.some(m=>m.id===id&&m.liked)))].slice(0,5);
 s.rejected=[...new Set((Array.isArray(raw.rejected)?raw.rejected:[]).filter(id=>menu.some(m=>m.id===id&&!m.liked)))];
 s.freed=s.chat&&s.freed;s.photo=s.freed&&s.photo;s.computer=s.photo&&s.computer;s.ticket=s.computer&&s.ticket;s.served=s.ticket&&s.served;s.bowl=s.ticket&&s.bowl&&!s.served;
 s.seat=s.served&&/^([1-3][AB])$/.test(raw.seat)?raw.seat:null;s.flight=s.seat&&Number.isFinite(raw.flight)?Math.max(0,Math.min(10,raw.flight)):0;
 s.arrived=s.flight>=10&&s.arrived;s.dining=s.arrived&&s.dining;if(!s.dining){s.chosen=[];s.rejected=[];}
 s.satisfied=s.dining&&s.chosen.length===5&&s.satisfied;s.tea=s.satisfied&&s.tea;s.drank=s.tea&&s.drank;s.key=s.drank&&s.key;s.completed=s.key&&s.completed;
 s.zone=s.completed?'threshold':s.arrived&&raw.zone==='restaurant'?'restaurant':s.arrived?'plane':s.served&&raw.zone==='plane'?'plane':s.ticket&&raw.zone==='church'?'church':'hell';return s;
}
export function journeyTransition(current,e){
 const s=structuredClone(current),deny=message=>({ok:false,state:current,message});let message='',effect='paper';
 switch(e.type){
 case 'chat':if(s.zone!=='hell')return deny('책상의 휴대폰을 찾아 줘.');s.chat=true;message='숫자 사이의 점은 글자의 경계 같아.';break;
 case 'unlock':if(s.zone!=='hell'||!s.chat||s.freed)return deny('책상에 놓인 휴대폰부터 확인해 줘.');if(String(e.code).trim().toLowerCase()!=='china')return deny('철컥… 아직 잠겨 있어.');s.freed=true;message='현수를 구했어! 감옥 안에 사진이 남아 있어.';effect='hatch';break;
 case 'photo':if(!s.freed||s.zone!=='hell')return deny('먼저 감옥의 자물쇠를 열어 줘.');s.photo=true;message='우리, 여기서 먹었었지? 식당 이름은 다섯 글자.';break;
 case 'computer':if(!s.photo||s.zone!=='hell')return deny('감옥에 남은 사진을 먼저 살펴봐.');if(String(e.code).trim().toLowerCase()!=='meaty')return deny('비밀번호가 일치하지 않아.');s.computer=true;message='화면에 입국 서류와 QR이 나타났어.';effect='success';break;
 case 'scan':if(!s.computer||s.zone!=='hell'||!e.aligned)return deny('게임 속 카메라 중앙에 컴퓨터 QR을 맞춰 줘.');s.ticket=true;message='현수의 탑승권을 받았어. 게이트와 좌석을 읽어 봐.';effect='success';break;
 case 'church':if(!s.ticket||s.zone!=='hell')return deny('먼저 중국행 탑승권을 찾아 줘.');s.zone='church';message='작은 계단 위, 새하얀 교회가 펼쳐진다.';break;
 case 'hell':if(s.zone!=='church')return deny('계단으로 돌아가 줘.');s.zone='hell';break;
 case 'bowl':if(s.zone!=='church'||!s.ticket||s.bowl||s.served)return deny('지금은 가져갈 수 없어.');if(e.seat!=='6B')return deny('여기에는 아무것도 없어. 탑승권을 다시 읽어 봐.');s.bowl=true;message='6B에서 육회비빔밥을 챙겼어.';break;
 case 'serve':if(s.zone!=='church'||!s.bowl||s.served)return deny('승무원이 팔짱을 낀 채 길을 막는다. “배가 고파서 움직이기 싫어요…”');s.bowl=false;s.served=true;message='“육회비빔밥! 감사합니다. 두 분, 퍼스트 클래스로 안내할게요.”';effect='success';break;
 case 'board':if(s.zone!=='church'||!s.served)return deny('승무원이 아직 탑승을 막고 있어.');s.zone='plane';message='우리 둘만의 퍼스트 클래스. 마음에 드는 자리에 앉아 줘.';break;
 case 'sit':if(s.zone!=='plane'||s.arrived||s.seat||!/^([1-3][AB])$/.test(e.seat))return deny('지금은 자리를 바꿀 수 없어.');s.seat=e.seat;s.flight=0;message='안전벨트를 매 주세요. 연태로 출발합니다.';break;
 case 'flight-tick':if(s.zone!=='plane'||!s.seat||s.arrived||!Number.isFinite(e.dt)||e.dt<=0)return deny('아직 출발하지 않았어.');s.flight=Math.min(10,s.flight+Math.min(e.dt,.25));if(s.flight>=10){s.arrived=true;message='연태에 도착했습니다. 두 분, 즐거운 여행 되세요!';effect='success';}break;
 case 'disembark':if(!s.arrived||s.zone!=='plane')return deny('비행기가 도착할 때까지 기다려 줘.');s.zone='restaurant';message='레드카펫 계단 아래, 용가훠궈의 붉은 홀이 보인다.';break;
 case 'dine':if(s.zone!=='restaurant')return deny('용가훠궈의 자리에 앉아 줘.');s.dining=true;message='“자기야, 내가 좋아하는 메뉴 다섯 개만 골라 줄래?”';break;
 case 'pick':{if(!s.dining||s.zone!=='restaurant'||s.satisfied)return deny('먼저 현수와 함께 자리에 앉아 줘.');const food=menu.find(m=>m.id===e.id);if(!food)return deny('레일에 없는 메뉴야.');if([...s.chosen,...s.rejected].includes(food.id))return deny('한 번 집은 메뉴는 다시 가져올 수 없어.');if(!food.liked){s.rejected.push(food.id);message=`“${food.name}은 내가 안 좋아하는 거야…” 현수가 접시를 옆으로 밀어 두었다. 식탁에는 올리지 않는다.`;effect='error';}else{s.chosen.push(food.id);message=`${food.name}을 건졌어. ${s.chosen.length} / 5`;if(s.chosen.length===5){s.satisfied=true;message='“다 내가 좋아하는 것들이네! 역시 자기밖에 없어. 차 하나 줄게.”';effect='success';}}break;}
 case 'tea':if(!s.satisfied||s.tea)return deny('현수에게 줄 다섯 메뉴를 먼저 완성해 줘.');s.tea=true;message='현수가 ZAGEE 차를 건넸어.';break;
 case 'drink':if(!s.tea||s.drank)return deny('먼저 현수가 주는 차를 받아 줘.');s.drank=true;message='한 모금… 달그락? 컵 안에 뭔가 있어!';break;
 case 'key':if(!s.drank||s.key)return deny('차를 마시고 컵 안을 살펴봐.');s.key=true;message='컵 속에서 500일로 향하는 열쇠를 찾았어.';effect='hatch';break;
 case 'exit':if(!s.key||s.zone!=='restaurant')return deny('문에 맞는 열쇠가 필요해.');s.completed=true;s.zone='threshold';message='400일의 기억을 완성했어. 이제, 500일로.';effect='success';break;
 default:return deny('아직 할 수 없는 동작이야.');
 }return {ok:true,state:s,message,effect};
}
export function journeyObjective(s){return s.completed?'500일로 이어지는 문이 열렸어.':s.key?'열쇠로 500일을 향하는 문을 열어 줘.':s.drank?'컵 안의 반짝이는 물건을 꺼내 봐.':s.tea?'현수가 준 ZAGEE를 한 모금 마셔 봐.':s.satisfied?'현수가 선물하는 차를 받아 줘.':s.dining?`현수가 좋아하는 서로 다른 메뉴 다섯 개. ${s.chosen.length} / 5`:s.zone==='restaurant'?'레드카펫 계단을 내려가 현수와 자리에 앉아 줘.':s.arrived?'도착했어. 출구로 걸어가 비행기에서 내려 줘.':s.seat?'연태로 비행 중… 곧 도착합니다.':s.zone==='plane'?'우리 둘뿐인 퍼스트 클래스. 어느 자리든 골라 앉아 줘.':s.served?'웃는 승무원의 안내를 받아 비행기에 올라 줘.':s.bowl?'육회비빔밥을 배고픈 승무원에게 건네 줘.':s.ticket?'탑승권의 게이트와 좌석을 따라가 봐.':s.computer?'하영이의 휴대폰 카메라로 컴퓨터의 QR을 비춰 봐.':s.photo?'사진 속 식당 이름으로 컴퓨터를 열어 줘.':s.freed?'현수가 있던 감옥 안의 사진을 살펴봐.':'책상의 휴대폰에 남은 대화로 현수의 감옥을 열어 줘.';}
