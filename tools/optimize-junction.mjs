import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';import {dedup,weld,prune,meshopt} from '@gltf-transform/functions';import {MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';import assert from 'node:assert/strict';
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const file='public/assets/world-spaces/junction-finale.glb',doc=await io.read(file);
for(const n of doc.getRoot().listNodes())if(n.getExtras().asset_id)n.setName(n.getExtras().asset_id);
await doc.transform(dedup(),weld(),prune({keepLeaves:true}),meshopt({encoder:MeshoptEncoder,level:'medium'}));await io.write(file,doc);
for(const name of ['RedScreen','BlueScreen','SignalRed','SignalYellow','SignalBlue','Minion_0','Minion_1','Minion_2','IPad','RewardCoat','JunctionHyunsu'])assert.ok(doc.getRoot().listNodes().some(n=>n.getName()===name),name);
console.log('Junction export verified: two screens, three lamps, three dolls, coat, iPad and Hyunsu');
