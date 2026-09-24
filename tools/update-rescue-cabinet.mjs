// Replace only cabinet meshes; keep the current room's characters and every other asset.
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {copyToDocument,prune,meshopt} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const path='public/assets/rescue/rescue-room.glb',doc=await io.read(path),source=await io.read('public/assets/rescue/trophy-cabinet.glb');
for(const name of ['Cabinet','CabinetDoor']){
 const target=doc.getRoot().listNodes().find(n=>n.getName()===name),replacement=source.getRoot().listNodes().find(n=>n.getName()===name);
 if(!target||!replacement)throw Error('Missing cabinet node '+name);
 for(const child of target.listChildren())target.removeChild(child);
 const copied=copyToDocument(doc,source,replacement.listChildren());
 for(const child of replacement.listChildren())target.addChild(copied.get(child));
}
const buffer=doc.getRoot().listBuffers()[0];
for(const accessor of doc.getRoot().listAccessors())accessor.setBuffer(buffer);
for(const extra of doc.getRoot().listBuffers().slice(1))extra.dispose();
await doc.transform(prune({keepLeaves:true}),meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16,quantizeNormal:12}));
await io.write(path,doc);console.log('Only Cabinet / CabinetDoor meshes replaced in the current rescue room.');
