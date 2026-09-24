export const VERSION = 1;
export const SAVE_KEY = 'hayoung500.room1.v1';
export const initialState = () => ({version:VERSION,stage:0,letterRead:false,framesSolved:false,safeOpen:false,inventory:[],selected:null,tasted:[],journal:[],completed:false,elapsed:0});
export const objectives = [
 ['아직 펼치지 않은 편지','책상 위에 놓인 현수의 편지를 읽어 보자.'],
 ['네 장의 기억','벽에 나타난 네 추억의 순서를 떠올려 보자.'],
 ['첫 선물의 주인','바이올린 키링을 기다리는 인형을 찾아보자.'],
 ['어디선가 들리는 왈츠','음악이 이끄는 곳의 회전목마를 집어 보자.'],
 ['그림 속 비어 있는 자리','하영의 그림에서 빠진 것을 채워 보자.'],
 ['썸 타던 날의 장소','그림을 그렸던 카페를 떠올려 평상을 옮기자.'],
 ['100일의 맛','고기 모형을 벽의 알맞은 부위에 놓아 보자.'],
 ['세상에서 가장 맛있는','두 스테이크를 모두 맛본 뒤, 한 표를 남기자.'],
 ['첫 번째 문이 열렸다','열린 문으로 걸어가 다음 기억을 만나자.']
];
const notes = [
 '현수가 오로나민 C 대신 고른 음료는 VITA500. 자물쇠가 풀리자 네 장의 액자가 나타났다.',
 '잣절 → 현수 생일 → 필리핀 → 100일 홍대. 노랑 → 초록 → 파랑 → 빨강. 액자에서 바이올린 키링을 찾았다.',
 '2025년 5월 14일, 하영의 생일을 위해 준비한 현수의 첫 선물. 바이올린 인형이 연주를 시작했다.',
 '인생의 회전목마. 음악을 따라가 회전목마를 찾았다.',
 '하영의 그림 속 놀이공원에 회전목마를 채웠다. 이 그림을 그렸던 곳은 어디였지?',
 '9로 평상. 썸 타던 날의 카페를 떠올려 평상을 9에 놓았다. 100일의 고기가 나타났다.',
 '100일 홍대에서 함께 먹은 고기는 살치살이었다.',
 '두 스테이크를 맛보고 현수의 스테이크를 골랐다. 첫 번째 기억의 문이 열렸다.'
];
export function transition(current, event) {
 const s=structuredClone(current); let message='',effect=null,changed=false;
 const deny=(m)=>({state:current,ok:false,message:m,effect:'error'});
 const take=(id)=>{if(!s.inventory.includes(id))s.inventory.push(id);s.selected=id;};
 const use=(id)=>{s.inventory=s.inventory.filter(x=>x!==id);if(s.selected===id)s.selected=null;};
 const advance=()=>{s.journal.push(notes[s.stage]);s.stage++;changed=true;effect='success';};
 switch(event.type){
  case 'read-letter': s.letterRead=true;changed=true;break;
  case 'lock':
   if(s.stage!==0)return deny('자물쇠는 이미 열렸어.');
   if(!s.letterRead)return deny('먼저 책상 위의 편지를 읽어 봐.');
   if(String(event.code).toLowerCase().replace(/\s/g,'')!=='vita500')return deny('찰칵… 아직 잠겨 있다. 편지 속 음료와 숫자를 다시 생각해 보자.');
   advance();effect='reveal';message='철컥. 네 장의 기억이 드러났다.';break;
  case 'frames':
   if(s.stage!==1)return deny('아직 액자 장치가 작동하지 않는다.');
   if(JSON.stringify(event.order)!==JSON.stringify(['yellow','green','blue','red']))return deny('추억의 순서가 조금 다른 것 같아. 처음부터 다시 눌러 보자.');
   if(s.framesSolved)return deny('액자 뒤에 열린 공간을 살펴봐.');
   s.framesSolved=true;changed=true;effect='reveal';message='초록 액자가 움직였다. 뒤에 숨겨진 금고를 살펴보자.';break;
  case 'open-safe':
   if(s.stage!==1||!s.framesSolved||s.safeOpen)return deny('금고는 아직 열 수 없어.');
   s.safeOpen=true;changed=true;effect='hatch';message='금고 안에, 생일에 받았던 바이올린 키링이 있다.';break;
  case 'take-violin':
   if(s.stage!==1||!s.safeOpen)return deny('먼저 액자 뒤 금고를 열어 봐.');
   take('violin');advance();message='금고에서 바이올린 키링을 꺼냈다.';break;
  case 'give-violin':
   if(s.stage!==2||!s.inventory.includes('violin'))return deny('인형의 두 손이 비어 있다. 작은 악기가 필요해 보인다.');
   if(event.doll!=='violinist')return deny('이 인형의 자세는 바이올린을 연주하는 자세가 아닌 것 같아.');
   use('violin');advance();effect='music';message='바이올린 인형이 움직인다. 어디선가 회전하는 소리가 들린다.';break;
  case 'take-carousel':
   if(s.stage!==3)return deny('아직 움직이지 않는 작은 회전목마다.');
   take('carousel');advance();message='회전목마를 조심스럽게 집어 들었다.';break;
  case 'place-carousel':
   if(s.stage!==4||!s.inventory.includes('carousel'))return deny('놀이공원 그림에 무언가 빠져 있다.');
   use('carousel');advance();effect='painting';message='그림 속 놀이공원에 회전목마가 나타났다.';break;
  case 'take-bench':
   if(s.stage!==5)return deny('작은 바퀴가 달린 평상이다. 아직 옮길 이유를 모르겠다.');
   take('bench');changed=true;message='평상을 잡았다. 숫자 타일로 옮겨 E로 내려놓자.';break;
  case 'place-bench':
   if(s.stage!==5||!s.inventory.includes('bench'))return deny('먼저 평상을 잡아 보자.');
   if(event.tile!==9)return deny('평상 아래에서 아무 반응도 없다. 그 카페의 이름을 다시 떠올려 보자.');
   use('bench');take('beef');advance();effect='hatch';message='9번 타일이 열리며 고기 모형이 올라왔다. 고기 모형을 얻었다.';break;
  case 'place-beef':
   if(s.stage!==6||!s.inventory.includes('beef'))return deny('아직 올려놓을 고기가 없다.');
   if(event.cut!=='살치살')return deny('이 부위는 아니었던 것 같아. 100일 홍대의 식사를 떠올려 보자.');
   use('beef');advance();effect='steaks';message='정답. 두 접시의 스테이크가 준비되었다.';break;
  case 'taste':
   if(s.stage!==7||!['hyunsu','alpero'].includes(event.which))return deny('시식은 아직 준비되지 않았다.');
   if(!s.tasted.includes(event.which))s.tasted.push(event.which);
   changed=true;effect='taste';message=event.which==='hyunsu'?'현수의 스테이크. 정성이… 꽤 많이 들어간 맛이다.':'홍대 알페로의 스테이크. 100일의 저녁이 떠오른다.';break;
  case 'vote':
   if(s.stage!==7)return deny('아직 투표할 때가 아니다.');
   if(s.tasted.length!==2)return deny('공정하게 두 스테이크를 모두 맛보고 투표해 줘!');
   if(event.which!=='hyunsu')return deny('…진짜? 한 번만 더 생각해 보면 안 될까? 다시 투표할 수 있다.');
   advance();effect='door';message='사실… 네가 기억해 줘서 기뻐. 다음 방에서도 함께해 줘.';break;
  case 'exit':
   if(s.stage!==8)return deny('문은 아직 잠겨 있다.');
   s.completed=true;changed=true;effect='complete';break;
  case 'select':
   if(!s.inventory.includes(event.item))return deny('가지고 있지 않은 물건이다.');
   s.selected=event.item;changed=true;break;
  default:return deny('알 수 없는 동작이다.');
 }
 return {state:changed?s:current,ok:true,message,effect};
}
export function loadState(raw){
 try{const p=JSON.parse(raw);if(p.version!==VERSION||!Number.isInteger(p.stage)||p.stage<0||p.stage>8)return null;
 if(!Array.isArray(p.inventory)||!p.inventory.every(x=>['violin','carousel','bench','beef'].includes(x))||!Array.isArray(p.tasted)||!p.tasted.every(x=>['hyunsu','alpero'].includes(x))||!Array.isArray(p.journal)||!p.journal.every(x=>typeof x==='string'))return null;
 return {...initialState(),...p,framesSolved:p.framesSolved??p.stage>=2,safeOpen:p.safeOpen??p.stage>=2,elapsed:Number.isFinite(p.elapsed)&&p.elapsed>=0?p.elapsed:0};}catch{return null;}
}
export const hints = [
 ['편지에 유난히 또렷하게 남겨 둔 말이 있어. 숫자 하나, 좋아하던 음료, 그리고 마음을 바꾸겠다는 말. 천천히 이어 봐.','오로나민 C 대신 마실 만한 음료를 떠올려 봐. 우리가 기념하는 숫자가 그 음료 이름에도 들어간다면?','자물쇠의 일곱 칸을 V · I · T · A · 5 · 0 · 0 으로 맞춰 봐. 다 맞췄다면 자물쇠를 당겨 주고.'],
 ['색부터 외우려고 하지 말고, 그날의 우리를 먼저 떠올려 봐. 가장 오래된 기억부터 차례로 놓는 거야.','처음은 잣절에서의 기억, 마지막은 홍대에서 보낸 100일이야. 그 사이 두 날의 순서를 생각해 봐.','잣절 → 현수 생일 → 필리핀 → 100일 홍대. 버튼은 노랑 → 초록 → 파랑 → 빨강 순서로 눌러 줘.'],
 ['2025년 5월 14일. 네 생일을 위해 준비했던 내 첫 선물이야. 그냥 예쁜 장식으로만 가져다 둔 건 아니겠지?','선반 위 인형들의 손과 팔을 자세히 봐. 누군가는 작은 악기 하나를 기다리는 자세로 서 있어.','턱 아래로 악기를 받치는 바이올린 연주 인형에게 키링을 건네 줘. 인형 앞에서 E를 누르면 건넬 수 있어.'],
 ['방금 시작된 곡의 제목을 떠올려 봐. 그 이름을 방 안에서도 발견할 수 있을 거야.','음악과 자막을 살펴보고, 선반 쪽에서 빙글빙글 움직이는 소품을 찾아봐.','서쪽 선반 쪽 작은 회전목마 앞에서 E를 누르고, 회전목마를 집어 들어 봐. 다음 기억에 필요할 거야.'],
 ['그림에 남긴 투덜거림을 다시 읽어 봐. 놀이공원에 꼭 있어야 하는 무언가가 빠져 있대.','손에 든 작은 놀이기구가 들어간다면, 그림 속 빈자리는 어떤 모습이 될까?','회전목마를 가진 채 큰 놀이공원 그림 앞에서 E를 눌러. 빈 곳에 회전목마를 놓으면 새로운 글이 나타날 거야.'],
 ['아직 서로의 마음을 살피던 때, 우리가 그 그림을 그렸던 카페를 떠올려 봐. 그곳 이름이 뭐였지?','그 카페 이름을 방 안에서 표현해 보는 거야. 바닥의 숫자와 옮길 수 있는 가구를 함께 살펴봐.','그곳은 9로 평상. 평상을 E로 잡은 뒤 9번 바닥 타일 앞에서 E로 내려놓아 봐.'],
 ['함께 보낸 100일, 홍대에서 먹었던 고기야. 어떤 부위가 그렇게 맛있었는지 기억나?','가려진 칸을 눌러 부위 이름부터 읽어 봐. 먹었던 이름을 찾았다면 그 칸을 한 번 더 눌러 줘.','우리가 먹었던 부위는 살치살이야. 살치살 덮개를 열고, 같은 칸을 다시 눌러 고기 모형을 놓아 줘.'],
 ['한쪽만 맛보고 고르면 섭섭하지. 두 접시를 모두 한 입씩 먹어 보고 이야기해 줘.','이 투표를 준비한 사람이 누구였더라? 아주 많이 삐친 현수가 기다리는 말이 있을지도 몰라.','두 스테이크를 모두 시식한 뒤 현수의 스테이크에 투표해 줘. 그러면 다음 기억으로 향하는 문이 열릴 거야.'],
 ['잘했어, 하영아. 우리가 함께한 기억을 다 찾아냈네. 이제 방 안에서 달라진 곳을 둘러봐.','액자가 있는 벽의 오른편을 봐. 빛이 새어 나오는 문이 널 기다리고 있어.','열린 문 앞으로 다가가 E를 누르거나 문 안으로 걸어가 봐. 첫 번째 방의 마지막 이야기를 들려줄게.']
];
