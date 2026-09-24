import {extraIngredients} from './market-catalog.js';
// The employment order is a personal memory, configured only from Hyunsu's answer.
export const employmentOrder=['상동','신대방삼거리','철산'];
export const lineSeven=['상동','부천시청','신중동','춘의','부천종합운동장','까치울','온수','천왕','광명사거리','철산','가산디지털단지','남구로','대림','신풍','보라매','신대방삼거리'];
export const ingredients={shrimp:['손질 새우','한 컵','seafood'],smallshrimp:['작은 칵테일새우','한 컵','seafood'],garlic:['다진 마늘','1회분','produce'],oil:['식용유','1회분','pantry'],rice:['밥','한 공기','produce'],egg:['달걀','한 개','produce'],vegetables:['당근·대파','한 접시','produce'],ketchup:['케첩','계량용','pantry'],chili:['고춧가루','계량용','pantry'],sugar:['설탕','계량용','pantry'],soy:['간장','계량용','pantry'],vinegar:['식초','계량용','pantry'],butter:['버터','한 조각','dairy'],fishsauce:['액젓','1회분','pantry'],pepper:['후추','1회분','pantry'],chocolate:['코팅 초콜릿','200 g','dairy'],biscuit:['과자 막대','6개','dairy'],sprinkles:['아몬드·스프링클','한 컵','dairy'],liner:['도시락 유산지','한 장','pack'],box:['도시락 용기','한 개','pack'],pickles:['치킨무','한 컵','pack'],ribbon:['투명 포장·리본','한 세트','pack']};
Object.assign(ingredients,extraIngredients);
const step=(id,title,detail,need=[],heat='off',visual=0)=>({id,title,detail,need,heat,visual});
export const recipes={
 chili:{name:'원팬 칠리새우 볶음밥',clock:'12시',color:'#bf593f',source:'https://www.10000recipe.com/recipe/6870522',sourceName:'가루씨 · 쉬림프박스',intro:'새우를 튀기지 않고 한 팬에서 볶아 소스를 입힌 뒤, 같은 팬에서 볶은 밥과 담아내요.',steps:[
  step('dry','새우 물기 닦기','해동한 새우의 물기를 키친타월로 꼼꼼하게 닦아요.',['shrimp']),
  step('garlic','마늘 향 내기','중불에 식용유와 마늘을 넣고 타지 않게 볶아요.',['oil','garlic'],'medium',1),
  step('shrimp','새우 앞뒤 익히기','새우가 둥글게 말리고 속이 불투명해질 때까지 뒤집어요.',[],'medium',2),
  step('measure','칠리소스 계량','케첩 2T, 고춧가루·설탕·간장·식초는 각각 1T. 물 2T를 섞어요.',['ketchup','chili','sugar','soy','vinegar'],'off',2),
  step('coat','소스 입혀 졸이기','중불에서 소스를 새우에 골고루 입혀 윤기가 나게 졸여요.',[],'medium',3),
  step('butter','버터·후추로 마무리','약불로 줄여 버터를 녹이고 후추를 더해요.',['butter','pepper'],'low',3),
  step('set-aside','칠리새우 잠시 덜기','완성한 새우는 접시에 덜어 두고 같은 팬을 사용해요.',[],'off',4),
  step('egg-rice','채소·달걀·밥 볶기','당근·대파와 달걀을 볶고 밥을 넣어 고슬고슬하게 풀어요.',['vegetables','egg','rice'],'medium',5),
  step('plate','밥 위에 칠리새우 담기','볶음밥을 깔고 붉은 칠리새우를 겹치지 않게 올려 완성해요.',['box'],'off',6)]},
 chicken:{name:'반반 닭다리 도시락',clock:'3시',color:'#be853e',source:'https://m.bbq.co.kr/menu/menuList_ajax.asp',sourceName:'BBQ 공식 메뉴',intro:'배달의민족 게임 화면에서 BBQ를 찾고, 닭다리만 · 양념 반 / 후라이드 반으로 주문해요.',steps:[
  step('order','BBQ 반반 닭다리 주문','검색 → BBQ → 닭다리만 → 양념 반·후라이드 반으로 주문해요.'),
  step('receive','배달기사에게 받기','주문 후 10초가 되면 입구에서 기사가 상자를 건네줘요.'),
  step('line-box','도시락에 유산지 깔기','소스가 새지 않도록 칸이 있는 용기에 유산지를 먼저 깔아요.',['box','liner'],'off',1),
  step('rice','밥과 치킨무 담기','작은 칸에 밥과 물기를 뺀 치킨무를 담아요.',['rice','pickles'],'off',2),
  step('fried','왼쪽에 후라이드 2개','집게로 바삭한 황금빛 닭다리 두 개를 왼쪽 큰 칸에 담아요.',[],'off',3),
  step('sauced','오른쪽에 양념 2개','붉은 소스의 닭다리 두 개를 오른쪽 칸에 따로 담아요.',[],'off',4),
  step('seal','뚜껑 닫고 리본 묶기','후라이드와 양념이 섞이지 않았는지 확인하고 포장해요.',['ribbon'],'off',6)]},
 garlic:{name:'작은 새우 볶음 도시락',clock:'6시',color:'#648c66',source:'https://www.10000recipe.com/recipe/6934270',sourceName:'달콤스윗맘 · 갈릭새우',intro:'작은 칵테일새우를 마늘·버터로 볶아 밥 옆에 담는 도시락이에요.',steps:[
  step('dry','작은 새우 해동·물기 제거','작은 새우를 해동해 헹구고 키친타월로 물기를 닦아요.',['smallshrimp']),
  step('garlic','마늘 향 내기','식용유와 다진 마늘을 중불에서 볶아요.',['oil','garlic'],'medium',1),
  step('shrimp','새우 앞뒤 볶기','작은 새우를 겹치지 않게 펴고 분홍빛과 불투명한 속살을 확인해요.',[],'medium',2),
  step('season','버터·액젓으로 간하기','약불에서 버터·액젓·후추를 넣어 빠르게 섞어요.',['butter','fishsauce','pepper'],'low',3),
  step('rice','도시락에 밥 깔기','빈 도시락의 한쪽에 밥을 담아 새우 자리도 남겨 둬요.',['box','rice'],'off',4),
  step('plate','새우를 가지런히 담기','작은 새우와 마늘 소스를 밥 옆에 담아 마무리해요.',[],'off',6)]},
 pepero:{name:'마음을 담은 수제 빼빼로',clock:'9시',color:'#a3658e',source:'https://wtable.co.kr/guide/63190',sourceName:'우리의식탁 · 초콜릿 중탕',intro:'초콜릿을 직접 불에 올리지 않고 따뜻한 물 위에서 녹여요. 손잡이를 남기고 코팅해 선물해요.',steps:[
  step('water','중탕 물 50°C 준비','냄비의 물을 50°C로 맞춘 뒤 불을 꺼요. 볼에 물이 들어가면 안 돼요.'),
  step('bowl','마른 볼에 초콜릿 담기','초콜릿을 잘게 나눠 마른 볼에 담고 따뜻한 물 위에 얹어요.',['chocolate'],'off',1),
  step('melt','주걱으로 천천히 저어 녹이기','남은 덩어리가 없어지고 매끈한 윤기가 날 때까지 저어요.',[],'off',2),
  step('dip','막대 6개 초콜릿 입히기','잡을 부분 3cm를 남기고 초콜릿에 담갔다가 천천히 돌려요.',['biscuit'],'off',3),
  step('decorate','토핑과 초콜릿 줄무늬','초콜릿이 굳기 전에 아몬드와 스프링클로 꾸며요.',['sprinkles'],'off',4),
  step('cool','종이 위에서 굳히기','서로 닿지 않게 놓고 표면이 단단해질 때까지 식혀요.',['liner'],'off',5),
  step('wrap','투명 봉투에 담고 리본 묶기','완전히 굳은 여섯 개의 빼빼로를 포장해 선물을 완성해요.',['ribbon'],'off',6)]}
};
export const recipeKeys=Object.keys(recipes);
