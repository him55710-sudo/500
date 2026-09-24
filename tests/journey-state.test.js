import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialJourney,journeyTransition as step,loadJourney,menu} from '../src/journey-state.js';
function route(){let s=initialJourney();const act=e=>{const r=step(s,e);assert.equal(r.ok,true,r.message);s=r.state;return s;};return {act,read:()=>s};}
test('Complete China puzzle chain, case-insensitive passwords, gates and ten-second flight',()=>{const {act,read}=route();assert.equal(step(read(),{type:'unlock',code:'china'}).ok,false);act({type:'chat'});assert.equal(step(read(),{type:'unlock',code:'other'}).ok,false);act({type:'unlock',code:' CHINA '});act({type:'photo'});act({type:'computer',code:'MeAtY'});assert.equal(step(read(),{type:'scan',aligned:false}).ok,false);act({type:'scan',aligned:true});act({type:'church'});assert.equal(step(read(),{type:'bowl',seat:'6A'}).ok,false);assert.equal(step(read(),{type:'serve'}).ok,false);act({type:'bowl',seat:'6B'});act({type:'serve'});act({type:'board'});act({type:'sit',seat:'3B'});for(let i=0;i<39;i++)act({type:'flight-tick',dt:.25});assert.equal(read().arrived,false);assert.equal(step(read(),{type:'disembark'}).ok,false);act({type:'flight-tick',dt:.25});assert.equal(read().flight,10);act({type:'disembark'});act({type:'dine'});for(const f of menu.filter(m=>m.liked))act({type:'pick',id:f.id});assert.equal(read().satisfied,true);for(const type of ['share-meal','reminisce','tea','drink','hear-cup','inspect-cup','key','exit'])act({type});assert.deepEqual(loadJourney(read()),read());});
test('Disliked foods never enter the table; duplicate picks rejected without blocking recovery',()=>{let s={...initialJourney(),zone:'restaurant',dining:true};for(const f of [...menu.filter(m=>!m.liked),...menu.filter(m=>m.liked)]){const r=step(s,{type:'pick',id:f.id});assert.equal(r.ok,true);s=r.state;if(!s.satisfied)assert.equal(step(s,{type:'pick',id:f.id}).ok,false);}assert.deepEqual(new Set(s.chosen),new Set(['beef','watermelon','noodles','bokchoy','chicken']));assert.equal(s.satisfied,true);assert.equal(step(s,{type:'key'}).ok,false);});
test('Restore clamps malformed data and impossible progress',()=>{const s=loadJourney({version:1,zone:'threshold',chosen:['beef','beef','tofu','fake'],rejected:['beef'],flight:Infinity,tea:true,completed:true,key:true});assert.equal(s.zone,'hell');assert.deepEqual(s.chosen,[]);assert.equal(s.key,false);assert.equal(s.completed,false);assert.equal(s.flight,0);});

const dinner=()=>({...initialJourney(),zone:'restaurant',chat:true,freed:true,photo:true,computer:true,ticket:true,served:true,seat:'2B',flight:10,arrived:true,dining:true,chosen:menu.filter(f=>f.liked).map(f=>f.id),satisfied:true});
test('Dinner and cup discovery cannot be skipped, repeated or lost on reload',()=>{
 let s=dinner();const events=['share-meal','reminisce','tea','drink','hear-cup','inspect-cup','key','exit'];
 for(let i=0;i<events.length;i++){
  for(const type of events.slice(i+1)){const r=step(s,{type});assert.equal(r.ok,false,`${type} skipped ${events[i]}`);assert.deepEqual(r.state,s);}
  assert.equal(step({...s,zone:'hell'},{type:events[i]}).ok,false);
  const r=step(s,{type:events[i]});assert.equal(r.ok,true,r.message);s=r.state;
  assert.equal(step(s,{type:events[i]}).ok,false,'Cannot repeat a completed beat');
  assert.deepEqual(loadJourney(JSON.parse(JSON.stringify(s))),s);
 }
});
test('Legacy tea and key saves keep earned items, while a sip does not reveal the key',()=>{
 const legacy=dinner();for(const field of ['mealShared','reminisced','cupHeard','cupInspected'])delete legacy[field];
 const tea=loadJourney({...legacy,tea:true});assert.equal(tea.tea,true);assert.equal(tea.reminisced,true);assert.equal(tea.cupInspected,false);
 const sip=loadJourney({...legacy,tea:true,drank:true});assert.equal(sip.drank,true);assert.equal(sip.cupHeard,false);assert.equal(step(sip,{type:'key'}).ok,false);
 const complete=loadJourney({...legacy,tea:true,drank:true,key:true,completed:true,zone:'threshold'});assert.equal(complete.key,true);assert.equal(complete.cupInspected,true);assert.equal(complete.completed,true);
 const premature=loadJourney({...dinner(),reminisced:true,cupHeard:true,cupInspected:true});assert.equal(premature.reminisced,false);assert.equal(premature.cupInspected,false);
});
