import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dedup,weld,prune,meshopt} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';
import fs from 'node:fs/promises';
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
for(const file of ['coaster-environment.glb','coaster-car.glb','room-two-rotunda.glb']){
 const path='public/assets/'+file,before=(await fs.stat(path)).size,doc=await io.read(path);
 await doc.transform(dedup(),weld(),prune(),meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16,quantizeNormal:12}));await io.write(path,doc);
 console.log(file,before,'->',(await fs.stat(path)).size);
}
