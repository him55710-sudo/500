import fs from 'node:fs/promises';
const path='src/rescue-world.js';let s=await fs.readFile(path,'utf8');s=s.replace("for(const name of ['Coat','Knit'])if(part(p,name))part(p,name).visible=s.warmed","for(const name of ['Coat','Knit','Sleeve-1','Sleeve1'])if(part(p,name))part(p,name).visible=s.warmed");
s=s.replace("if(rope.visible){const a=world.player.clone().add(v(.28,1.0,.15)),b=people[3].position.clone().add(v(-.2,1.05,.1));rope.geometry.setFromPoints([a,b]);}",`if(s.holding||this.transition&&s.completed){
    world.avatar.updateMatrixWorld(true);const lower=world.avatar.getObjectByName('LowerArm.R'),npc=people[3],arm=part(npc,'Arm-1');npc.updateMatrixWorld(true);
    const hand=lower?lower.localToWorld(v(0,.23,0)):world.player.clone().add(v(.3,1,.1));
    if(arm){const local=npc.worldToLocal(hand.clone()).sub(arm.position);arm.quaternion.setFromUnitVectors(v(-.03,-.67,.07).normalize(),local.clone().normalize());arm.scale.setScalar(THREE.MathUtils.clamp(local.length()/.675,.7,1.25));}
   }
   rope.visible=false;
   for(const p of people)for(const sign of [-1,1]){const arm=part(p,'Arm'+sign),sleeve=part(p,'Sleeve'+sign);if(arm&&sleeve){sleeve.quaternion.copy(arm.quaternion);sleeve.scale.copy(arm.scale);}}`);
await fs.writeFile(path,s);
let t=await fs.readFile('tests/rescue.mjs','utf8');t=t.replaceAll("await page.locator('#continue').click();","await startButton('#continue');").replaceAll("await page.locator('#princess-preview').click();","await startButton('#princess-preview');");await fs.writeFile('tests/rescue.mjs',t);
