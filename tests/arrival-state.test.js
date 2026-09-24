import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialArrival,loadArrival,arrivalTransition,arrivalBlocked} from '../src/arrival-state.js';

test('the landing key is required once before unlocking the kitchen door',()=>{
 const fresh=initialArrival();
 assert.equal(arrivalTransition(fresh,'unlock-door').ok,false);
 assert.deepEqual(fresh,{keyTaken:false,doorUnlocked:false});
 const taken=arrivalTransition(fresh,'take-key');
 assert.equal(taken.ok,true);
 assert.equal(arrivalTransition(taken.state,'take-key').ok,false);
 const unlocked=arrivalTransition(taken.state,'unlock-door');
 assert.equal(unlocked.ok,true);
 assert.equal(unlocked.state.doorUnlocked,true);
 assert.equal(arrivalTransition(unlocked.state,'unlock-door').ok,false);
 assert.deepEqual(loadArrival(JSON.parse(JSON.stringify(unlocked.state))),unlocked.state);
});

test('old and malformed saves cannot skip the landing lock',()=>{
 for(const raw of [undefined,null,{},'key',{doorUnlocked:true},{keyTaken:'true',doorUnlocked:true}])assert.deepEqual(loadArrival(raw),initialArrival());
 assert.deepEqual(loadArrival({keyTaken:true}),{keyTaken:true,doorUnlocked:false});
});

test('landing exit only becomes walkable after the door has swung clear',()=>{
 for(const angle of [0,-.7,-1.4])for(const z of [-12.6,-13.4,-14.3])assert.equal(arrivalBlocked(0,z,angle),true);
 for(const z of [-11.5,-12.6,-13.4,-14.3])assert.equal(arrivalBlocked(0,z,-Math.PI*.52),false);
 assert.equal(arrivalBlocked(0,0,-Math.PI*.52),true,'fountain remains solid');
 assert.equal(arrivalBlocked(0,14,-Math.PI*.52),true,'no exit through arrival portal');
 assert.equal(arrivalBlocked(2,-14,-Math.PI*.52),true,'passage has solid sides');
 assert.equal(arrivalBlocked(0,-15.4,-Math.PI*.52),true,'passage has a back wall');
 assert.equal(arrivalBlocked(-1.3,-11.5,-Math.PI*.52),true,'open door leaf remains solid');
});
