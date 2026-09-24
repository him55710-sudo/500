import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';import {dedup,weld,prune,meshopt} from '@gltf-transform/functions';import {MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';
const require=createRequire(import.meta.url);const sharp=require('../node_modules/.pnpm/sharp@0.35.4/node_modules/sharp');
const assets='public/assets/journey',refs='docs/journey-references';await fs.mkdir(refs,{recursive:true});
for(const name of ['meaty','zagee-wrap']){const original=path.join(assets,name+'.png'),archive=path.join(refs,name+'.png');try{await fs.access(original);await fs.copyFile(original,archive);}catch{}await sharp(archive).resize({width:name==='meaty'?1800:1600,withoutEnlargement:true}).webp({quality:91}).toFile(path.join(assets,name+'.webp'));}
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);const glb=path.join(assets,'journey-room.glb'),before=(await fs.stat(glb)).size;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder}),doc=await io.read(glb);
await doc.transform(dedup(),weld(),prune({keepLeaves:true}),meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16,quantizeNormal:12}));await io.write(glb,doc);console.log({glbBefore:before,glbAfter:(await fs.stat(glb)).size});
