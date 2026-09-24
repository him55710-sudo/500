import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dedup,weld,prune,meshopt} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
const file='public/assets/world-spaces/sungsimdang-room.glb';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const before=(await fs.stat(file)).size,doc=await io.read(file);
for(const n of doc.getRoot().listNodes()){
 if(n.getExtras().asset_id)n.setName(n.getExtras().asset_id);
 if(n.getName().startsWith('Gate_01_to_02_Pivot'))n.setName('Gate_01_to_02_Pivot');
 if(n.getName().startsWith('Spawn_01'))n.setName('Spawn_01');
}
await doc.transform(dedup(),weld(),prune({keepLeaves:true}),meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16,quantizeNormal:12}));
await io.write(file,doc);
const check=await io.read(file),nodes=check.getRoot().listNodes();
const breads=nodes.filter(n=>n.getExtras().product_name),gate=nodes.find(n=>n.getName()==='Gate_01_to_02_Pivot');
assert.equal(breads.length,86);assert.equal(new Set(breads.map(n=>n.getExtras().product_name)).size,5);
const order=breads.filter(n=>n.getExtras().checkout_item);
assert.equal(order.length,27);assert.equal(order.reduce((sum,n)=>sum+n.getExtras().unit_price,0),92500);
for(const id of ['BakerySafeHinge','MangoSiruCake','BakeryLetterFragment','BakeryCashDrawer','BakeryCakeKey','BakeryCakeUSB'])assert.ok(nodes.some(n=>n.getName()===id));
assert.equal(gate.getExtras().requires,'usbTaken');assert.ok(gate.listChildren().length>=7);
assert.ok(nodes.some(n=>n.getName().startsWith('Full enclosure')));assert.ok(nodes.some(n=>n.getName().startsWith('Removable ceiling')));
const result={bytesBefore:before,bytesAfter:(await fs.stat(file)).size,breads:breads.length,products:[...new Set(breads.map(n=>n.getExtras().product_name))],gateChildren:gate.listChildren().length,meshes:check.getRoot().listMeshes().length};
await fs.writeFile('docs/sungsimdang-references/asset-validation.json',JSON.stringify(result,null,2));console.log(result);
