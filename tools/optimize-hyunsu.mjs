import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dedup,weld,prune,meshopt,textureCompress} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';
const sharp=createRequire(import.meta.url)('../node_modules/.pnpm/sharp@0.35.4/node_modules/sharp');
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
const file='public/assets/characters/hyunsu.glb';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const doc=await io.read(file),before=(await fs.stat(file)).size;
await doc.transform(
 textureCompress({encoder:sharp,targetFormat:'webp',resize:[1024,1024],quality:92,slots:/^(?!normalTexture).*$/}),
 textureCompress({encoder:sharp,targetFormat:'webp',resize:[512,512],quality:96,slots:/^normalTexture$/}),
);
await doc.transform(dedup(),weld(),prune({keepLeaves:true}),meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16,quantizeNormal:12}));
await io.write(file,doc);console.log({before,after:(await fs.stat(file)).size});
