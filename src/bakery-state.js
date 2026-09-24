import data from './bakery-data.json' with {type:'json'};
export const bakeryProducts=data.products,bakeryLetter=data.letter;
export const checkoutTotal=bakeryProducts.reduce((sum,p)=>sum+p.price*p.quantity,0);
export const initialBakery=()=>({version:2,drawerOpen:false,keyTaken:false,safeOpen:false,letterTaken:false,cakeTaken:false,bites:0,usbTaken:false,completed:false});
export function loadBakery(raw){
 let p;try{p=typeof raw==='string'?JSON.parse(raw):raw;}catch{return initialBakery();}
 const s=initialBakery();if(!p||![1,2].includes(p.version))return s;
 s.letterTaken=p.letterTaken===true;s.drawerOpen=p.version===1?p.safeOpen===true:p.drawerOpen===true;
 s.keyTaken=s.drawerOpen&&(p.version===1?p.safeOpen===true:p.keyTaken===true);
 s.safeOpen=s.keyTaken&&p.safeOpen===true;s.cakeTaken=s.safeOpen&&p.cakeTaken===true;
 s.bites=s.cakeTaken&&Number.isInteger(p.bites)?Math.max(0,Math.min(3,p.bites)):0;
 s.usbTaken=s.bites===3&&p.usbTaken===true;s.completed=s.usbTaken;return s;
}
export function bakeryTransition(current,e){
 const s=loadBakery(current),deny=message=>({ok:false,state:current,message,effect:'error'});let message='',effect='success';
 switch(e.type){
 case 'unlock':if(s.drawerOpen)return deny('계산대 서랍은 이미 열려 있어.');if(!/^\d{5}$/.test(String(e.code??'').trim())||String(e.code).trim()!==String(checkoutTotal))return deny('철컥… 데스크 위 빵의 수량과 개당 가격을 다시 살펴봐.');s.drawerOpen=true;message='계산대 서랍이 열렸다. 작은 열쇠가 반짝인다.';effect='hatch';break;
 case 'take-key':if(!s.drawerOpen||s.keyTaken)return deny('열린 서랍 안을 살펴봐.');s.keyTaken=true;message='망고시루 보관함의 열쇠를 챙겼다.';break;
 case 'open-cake':if(!s.keyTaken||s.safeOpen)return deny('계산대 서랍의 열쇠가 필요해.');s.safeOpen=true;message='열쇠로 망고시루 보관함을 열었다.';effect='hatch';break;
 case 'take-cake':if(!s.safeOpen||s.cakeTaken)return deny('먼저 열쇠로 망고시루 보관함을 열어 줘.');s.cakeTaken=true;message='ㅋㅋ너가 이걸 참 맛있게 먹었었지';break;
 case 'eat-cake':if(!s.cakeTaken||s.bites===3)return deny('케이크를 먼저 꺼내 줘.');s.bites++;message=s.bites===3?'케이크 속에서 USB가 나왔다!':'달콤한 망고와 크림을 한 입 먹었다.';break;
 case 'take-usb':if(s.bites!==3||s.usbTaken)return deny('케이크 속을 살펴봐.');s.usbTaken=true;message='USB를 챙기자 JUNCTION KOREA 2026으로 향하는 문이 열렸다.';effect='door';break;
 case 'take-letter':if(s.letterTaken)return deny('이 조각은 이미 챙겼어.');s.letterTaken=true;message='찢어진 편지 1/3 조각을 챙겼다.';break;
 default:return deny('지금 할 수 없는 행동이야.');
 }s.completed=s.usbTaken;return {ok:true,state:s,message,effect};
}
export function bakeryObjective(s){return s.usbTaken?'USB를 들고 열린 문으로 가자. 다음은 포스텍 중앙강당.':s.bites===3?'케이크 속 USB를 챙겨 줘.':s.cakeTaken?'ㅋㅋ너가 이걸 참 맛있게 먹었었지 · 망고시루를 맛보자.':s.safeOpen?'금고에서 망고시루를 꺼내 줘.':s.keyTaken?'벽 쪽에 따로 놓인 망고시루 금고를 열쇠로 열어 줘.':s.drawerOpen?'계산대 아래 열린 서랍을 내려다보고 열쇠를 챙겨 줘.':'데스크 위 빵값을 더해 계산대 키패드에 비밀번호를 입력해 줘.';}
