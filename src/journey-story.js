// Each beat stays on screen until the player chooses the next action.
export function journeyStory(s){
 if(s.key)return {id:'found',chapter:'다음 기억 앞에서',title:'오늘의 여행을 주머니에 담고',art:'key',narration:'손바닥 위 작은 열쇠에 붉은 조명이 비친다.\n현수는 먼저 일어나지 않고, 네가 준비될 때까지 기다린다.',quote:'“다음 문 너머에도 우리 이야기가 있겠지?\n천천히 가자. 오늘처럼 같이.”',button:'열쇠를 챙기고 자리에서 일어나기'};
 if(s.cupInspected)return {id:'revealed',chapter:'컵 속의 비밀',title:'차 안에 숨겨진 작은 열쇠',art:'key',narration:'뚜껑을 열고 안을 들여다본다.\n차 사이로 금빛 고리와 작은 톱니가 보인다. 열쇠다.',quote:'“여기 들어 있었네… 저 문에 맞을까?”\n현수도 몸을 가까이 기울여 컵 안을 바라본다.',button:'작은 열쇠를 조심히 꺼내기',event:'key'};
 if(s.cupHeard)return {id:'sound',chapter:'차 한 잔의 여운',title:'달그락. 잠깐, 무슨 소리지?',art:'cup',narration:'컵을 내려놓는 순간, 단단한 무언가가 부딪힌다.\n얼음 소리와는 조금 다르다. 컵을 살짝 기울이자 다시 한 번, 달그락.',quote:'“자기야, 이 안에 뭐가 있는 것 같아.”\n현수가 말을 멈추고 네 손에 든 컵을 바라본다.',button:'뚜껑을 열어 컵 안 살펴보기',event:'inspect-cup'};
 if(s.drank)return {id:'after-sip',chapter:'차 한 잔의 여운',title:'달콤한 차 향이 남는다',art:'cup',narration:'한 모금 천천히 마신다.\n매콤했던 입안이 부드러워지고, 시원한 차 향이 퍼진다.\n둘 사이로 잠깐 편안한 침묵이 흐른다.',quote:'“어때, 맛있지? 매운 거 먹고 나니까 더 좋다.”',button:'차의 여운을 느끼며 컵 내려놓기',event:'hear-cup'};
 if(s.tea)return {id:'received',chapter:'식사 후, 작은 선물',title:'두 손에 전해진 차 한 잔',art:'cup',narration:'검은 뚜껑 아래 남색 무늬가 둘러진 컵.\nZAGEE라는 글자를 따라 손끝을 움직여 본다.\n방금까지 분주했던 식탁이 조금 조용해졌다.',quote:'“많이 걸었지? 잠깐 쉬면서 마셔.”',button:'ZAGEE를 천천히 한 모금 마시기',event:'drink'};
 if(s.reminisced)return {id:'offered',chapter:'식사 후, 작은 선물',title:'이번에는 내가 챙겨 줄게',art:'cup',narration:'접시를 비우고도 이야기는 한참 이어졌다.\n현수가 가방을 뒤적이더니, 아껴 둔 차 한 잔을 꺼낸다.',quote:'“내가 좋아하는 거 다 기억해 줘서 고마워.\n이건 내가 자기 주려고 챙겨 왔어.”',button:'현수가 건네는 ZAGEE 받기',event:'tea'};
 if(s.mealShared)return {id:'meal',chapter:'둘만의 식탁',title:'낯선 도시에서, 익숙한 우리',art:'meal',narration:'보글보글 끓는 국물에 소고기와 청경채를 넣는다.\n당면을 건져 나누고, 치킨과 시원한 수박에도 손을 뻗는다.\n정신없던 여행도 지금은 조금 느리게 흘러간다.',quote:'“아까는 감옥에 있었는데, 이제 자기랑 여기서 밥 먹네.\n어디를 가든 같이 먹으니까 좋다.”',button:'현수와 오늘의 여행 이야기 나누기',event:'reminisce'};
 return {id:'table',chapter:'둘만의 식탁',title:'우리 앞에 모인 다섯 접시',art:'meal',narration:'마지막 접시를 내려놓자, 현수의 표정이 환해진다.\n머리 위 붉은 조명이 식탁을 물들이고,\n옆에서는 음식 레일이 여전히 천천히 돌고 있다.',quote:'“다 내가 좋아하는 것들이네. 역시 자기밖에 없어.\n이제 우리, 따뜻할 때 같이 먹자.”',button:'현수와 마주 앉아 천천히 먹기',event:'share-meal'};
}
