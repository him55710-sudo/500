import layout from './junction-layout.json' with {type:'json'};
export {layout};
export const routeAnswer=layout.route.slice(1).map((p,i)=>p[0]>layout.route[i][0]?'R':p[0]<layout.route[i][0]?'L':p[1]>layout.route[i][1]?'D':'U').join('');
export const redLines=['팔랑귀 팔랑귀 that’s ( )','눈치나 살피기 that’s ( )','도가니 사리기 that’s ( )','넘어가 울타리 ( )'];
export const ipadLetter='하영아, 잘지냈지? 우리가 벌써 500일이됐네. 우리 정말 각자의 인생에서 참 많이 고생한것 같아. 서로 힘들때 도와주고 서로의 인생에 가장 큰 부분을 차지하게 된것 같아. 근데 너는 나를 버리고 500일 기념일을 보내지 않다니... 나에 대한 사랑이 식은 거겠지? 내가 평소에 많이 못해줘서그런 것 같아. 미안. 근데 나는 더이상 못참겠더라. 너가 날 더이상 좋아하지 않는 다는 사실이. 머리가 깨질듯이 아팠어. 그래서 나는 기억 삭제술을 진행할거야. 의사 선생님이 이 수술을 하면 난 더이상 너에 대한 기억을 못하게 된대. 그치만 단 한가지 방법이 있어. 바로 진심어린 500일 편지를 써주면 되는거야. 뭐 어차피 너는 쓰지도 못하겠지만 혹시나해서......';
export const initialJunction=()=>({version:1,usbInserted:false,redPowered:false,redPresses:0,redSolved:false,drinks:[],trashed:[],bluePowered:false,coatSpawned:false,coatTaken:false,blueSolved:false,minions:[],offered:false,brandSolved:false,dressed:false,complimented:false,yellowSolved:false,phase:'explore',phaseTime:0,tabletRead:false,draft:'',letterSent:false,completed:false});
const phases=['explore','collapse','tablet','letter','recovery','walk','hearts','complete'];
const list=v=>Array.isArray(v)?v:[];
export function loadJunction(raw){
 const s=initialJunction();if(raw?.version!==1)return s;
 for(const k of ['usbInserted','redPowered','redSolved','bluePowered','coatSpawned','coatTaken','blueSolved','offered','brandSolved','dressed','complimented','yellowSolved','tabletRead','letterSent','completed'])s[k]=raw[k]===true;
 s.redPowered=s.usbInserted&&s.redPowered;s.redPresses=s.redPowered&&Number.isInteger(raw.redPresses)?Math.max(0,Math.min(8,raw.redPresses)):0;s.redSolved=s.redPowered&&s.redPresses===8;
 s.drinks=s.redSolved?[...new Set(list(raw.drinks).filter(x=>['victory','top'].includes(x)))]:[];s.trashed=s.drinks.filter(x=>list(raw.trashed).includes(x));s.bluePowered=s.trashed.length===2;
 s.coatSpawned=s.bluePowered&&s.coatSpawned;s.coatTaken=s.coatSpawned&&s.coatTaken;s.blueSolved=s.coatTaken;
 s.minions=[...new Set(list(raw.minions).filter(x=>[0,1,2].includes(x)))];s.offered=s.blueSolved&&s.minions.length===3&&s.offered;s.brandSolved=s.offered&&s.brandSolved;s.dressed=s.brandSolved&&s.dressed;s.complimented=s.dressed&&s.complimented;s.yellowSolved=s.complimented&&s.yellowSolved;
 s.phase=s.complimented&&phases.includes(raw.phase)?raw.phase:'explore';if(s.complimented&&s.phase==='explore')s.phase='collapse';
 s.phaseTime=Number.isFinite(raw.phaseTime)?Math.max(0,Math.min(30,raw.phaseTime)):0;s.draft=typeof raw.draft==='string'?raw.draft.slice(0,12000):'';
 s.tabletRead=s.yellowSolved&&s.tabletRead;s.letterSent=s.tabletRead&&s.draft.trim().length>0&&s.letterSent;
 if(['recovery','walk','hearts','complete'].includes(s.phase)&&!s.letterSent)s.phase=s.tabletRead?'letter':'tablet';s.completed=s.letterSent&&s.phase==='complete';return s;
}
const norm=v=>String(v??'').toLowerCase().replace(/\s/g,'');
export function junctionTransition(current,e){
 const s=loadJunction(current),deny=message=>({ok:false,state:current,message,effect:'error'});let message='',effect='success';
 switch(e.type){
 case 'insert-usb':if(s.usbInserted)return deny('USB는 이미 연결했어.');s.usbInserted=true;message='성심당의 USB를 연결했다. 미로가 암호의 지도였어.';break;
 case 'route':if(!s.usbInserted||s.redPowered)return deny('USB를 연결한 빨강 모니터부터 확인해 줘.');if(String(e.value)!==routeAnswer)return deny('경로가 달라. START에서 빨강 모니터까지, 방향이 바뀔 때마다 하나씩 기록해 봐.');s.redPowered=true;message='빨강 모니터에 전원이 들어왔다.';break;
 case 'red-button':if(!s.redPowered||s.redSolved)return deny('먼저 빨강 모니터의 전원을 켜 줘.');if(e.color!==(s.redPresses<6?'red':'green')){s.redPresses-=s.redPresses%2;return {ok:true,state:s,message:'이 구절의 두 번 누르기를 다시 해 봐.',effect:'error'};}s.redPresses++;s.redSolved=s.redPresses===8;message=s.redSolved?'빨강 광선이 강당 위로 뻗어 오른다.':s.redPresses%2?'한 번 더.':'다음 구절이 나타났다.';break;
 case 'take-drink':if(!s.redSolved||!['victory','top'].includes(e.id)||s.drinks.includes(e.id))return deny('빨강 퍼즐을 먼저 마쳐 줘.');s.drinks.push(e.id);message=(e.id==='victory'?'VICTORY 탄산수':'T.O.P 커피')+'를 들었다.';break;
 case 'trash':if(!s.redSolved||!s.drinks.includes(e.id)||s.trashed.includes(e.id))return deny('버릴 물건을 먼저 들어 줘.');s.trashed.push(e.id);s.bluePowered=s.trashed.length===2;message=s.bluePowered?'두 물건을 버리자 파랑 모니터가 켜졌다.':'쓰레기통에 넣었다.';break;
 case 'seconds':if(!s.bluePowered||s.coatSpawned)return deny('파랑 모니터의 단서를 먼저 밝혀 줘.');if(norm(e.value)!=='3seconds')return deny('숫자와 seconds를 함께 적어 봐.');s.coatSpawned=true;message='모니터 아래에서 옷이 나왔다. 뒤에 빨간 +5가 새겨져 있다.';break;
 case 'take-coat':if(!s.coatSpawned||s.coatTaken)return deny('나온 옷을 살펴봐.');s.coatTaken=true;s.blueSolved=true;message='옷을 들자 파랑 광선과 가운데의 파랑 불이 켜졌다.';break;
 case 'minion':if(![0,1,2].includes(e.id)||s.minions.includes(e.id))return deny('이미 챙긴 인형이야.');s.minions.push(e.id);message=`미니언 인형 ${s.minions.length} / 3`;break;
 case 'offer':if(!s.blueSolved||s.minions.length!==3||s.offered)return deny('빨강과 파랑을 완성하고, 미니언 인형 세 개를 모아 줘.');s.offered=true;message='세 인형을 바치자 옷에 관한 문제가 나타났다.';break;
 case 'brand':if(!s.offered||s.brandSolved)return deny('먼저 세 인형을 제단에 놓아 줘.');if(norm(e.value)!=='8seconds')return deny('그 짧은 시간에, 옷 뒤의 숫자를 더해 봐.');s.brandSolved=true;message='너는 항상 이 옷을 싫어했어. 난 좋아했는데....';break;
 case 'dress':if(!s.brandSolved||s.dressed)return deny('먼저 이 옷의 이름을 알아내 줘.');s.dressed=true;message='현수에게 옷을 입혔다. 따뜻한 한마디를 건네 보자.';break;
 case 'compliment':if(!s.dressed||s.complimented)return deny('현수에게 옷을 먼저 입혀 줘.');s.complimented=true;s.phase='collapse';s.phaseTime=0;message='“현수야, 정말 잘 어울려. 멋있어!”';break;
 case 'tick':{
  if(!['collapse','recovery','walk','hearts'].includes(s.phase)||!Number.isFinite(e.dt)||e.dt<=0)return deny('');
  s.phaseTime+=Math.min(e.dt,.25);const length={collapse:8,recovery:8,walk:7,hearts:8}[s.phase];
  if(s.phase==='collapse'&&s.phaseTime>=4)s.yellowSolved=true;
  if(s.phaseTime>=length){s.phaseTime=0;s.phase={collapse:'tablet',recovery:'walk',walk:'hearts',hearts:'complete'}[s.phase];if(s.phase==='complete')s.completed=true;}effect=null;break;}
 case 'read-tablet':if(!s.yellowSolved||s.phase!=='tablet')return deny('세 빛이 모이는 곳을 살펴봐.');s.tabletRead=true;message='아이패드에 현수의 마지막 편지가 남아 있다.';effect='paper';break;
 case 'envelope':if(!s.tabletRead)return deny('아이패드의 편지를 먼저 읽어 줘.');s.phase='letter';s.phaseTime=0;message='편지봉투를 열었다. 하고 싶은 말을 자유롭게 적어 줘.';effect='paper';break;
 case 'draft':if(!s.tabletRead||s.letterSent)return deny('지금은 편지를 고칠 수 없어.');s.draft=String(e.value??'').slice(0,12000);effect=null;break;
 case 'send-letter':if(s.phase!=='letter'||!s.draft.trim())return deny('현수에게 전하고 싶은 말을 적어 줘.');s.letterSent=true;s.phase='recovery';s.phaseTime=0;message='직접 쓴 500일 편지를 현수에게 건넸다.';effect='paper';break;
 default:return deny('아직 할 수 없는 일이야.');
 }return {ok:true,state:s,message,effect};
}
export function junctionObjective(s){return s.completed?'500일 방탈출을 완료하였습니다':s.phase==='letter'?'편지봉투를 열어 진심을 적고 현수에게 보내 줘.':s.phase==='tablet'?'세 광선이 모인 곳의 아이패드를 읽어 줘.':s.phase!=='explore'?'현수의 기억이 움직이고 있어…':s.dressed?'현수에게 잘 어울린다고 칭찬해 줘.':s.brandSolved?'그 옷을 현수에게 입혀 줘.':s.offered?'3초와 옷 뒤의 +5. 이 옷의 이름은?':s.blueSolved?`미로의 미니언 인형을 모아 가운데 제단에 놓아 줘. ${s.minions.length} / 3`:s.coatSpawned?'파랑 모니터 아래의 옷을 직접 들어 줘.':s.bluePowered?'파랑 화면의 빈칸을 숫자와 seconds로 채워 줘.':s.redSolved?'BLUE를 떠올려 봐. VICTORY 탄산수와 T.O.P 커피를 쓰레기통에 넣어 줘.':s.redPowered?'화면의 한 구절마다 빨강 또는 초록 버튼을 두 번 눌러 줘.':s.usbInserted?'START에서 빨강 모니터까지 이동한 방향을 입력해 줘.':'미로를 지나 빨강 모니터에 성심당의 USB를 연결해 줘.';}
