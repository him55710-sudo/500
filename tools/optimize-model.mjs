import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dedup,weld,prune,join,meshopt} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';
import fs from 'node:fs/promises';
const path='public/assets/memory-room.glb';
const before=(await fs.stat(path)).size;
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const document=await io.read(path);
document.getRoot().listNodes().find(n=>n.getName()==='Doll_dancer')?.setScale([.9,.9,.9]);
const names=new Set(document.getRoot().listNodes().map(n=>n.getName()));
const decorative=node=>{
 for(let n=node;n;n=n.getParentNode())if(/^(SalonPilaster|ArchedWindow|SalonMirror)/.test(n.getName()))return true;
 return /^Architecture_/.test(node.getName())&&!/Walnut_plank/.test(node.getName());
};
await document.transform(dedup(),join({filter:decorative,cleanup:false}),weld(),prune({keepLeaves:true,keepAttributes:true}),meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16,quantizeNormal:12}));
for(const name of ['Hayoung','Carousel','Doll_violinist','Bench','ExitDoor','ViolinKeyring']){
 if(!names.has(name)||!document.getRoot().listNodes().some(n=>n.getName()===name))throw new Error('Missing interactive node '+name);
}
await io.write(path,document);
const after=(await fs.stat(path)).size;
const report={beforeBytes:before,afterBytes:after,savedPercent:Math.round((1-after/before)*100)};
await fs.writeFile('test-results/model-optimization.json',JSON.stringify(report,null,2));console.log(report);
