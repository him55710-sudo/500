// Run: node Tools/quality_download.mjs (from the Unreal project directory).
// Powered by Poly Haven: https://polyhaven.com
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../SourceAssets/Quality/', import.meta.url));
const selections = [
  { id: 'ArmChair_01', kind: 'model', resolution: '2k' },
  { id: 'round_wooden_table_01', kind: 'model', resolution: '2k' },
  { id: 'antique_ceramic_vase_01', kind: 'model', resolution: '1k' },
  { id: 'brass_candleholders', kind: 'model', resolution: '1k' },
  { id: 'american_walnut_veneer', kind: 'texture', resolution: '2k' },
  { id: 'white_plaster_02', kind: 'texture', resolution: '2k' },
  { id: 'quatrefoil_jacquard_fabric', kind: 'texture', resolution: '2k' },
  { id: 'potted_plant_01', kind: 'model', resolution: '2k' },
  { id: 'potted_plant_02', kind: 'model', resolution: '2k' },
  { id: 'potted_plant_04', kind: 'model', resolution: '1k' },
];

async function request(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Memory500-QualityStudy/1.0' },
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response;
}

async function acquire(target, descriptor) {
  if (new URL(descriptor.url).hostname !== 'dl.polyhaven.org') {
    throw new Error(`Unexpected download host: ${descriptor.url}`);
  }
  let data;
  try { data = await readFile(target); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const matches = bytes => bytes?.length === descriptor.size &&
    createHash('md5').update(bytes).digest('hex') === descriptor.md5;
  if (!matches(data)) data = Buffer.from(await (await request(descriptor.url)).arrayBuffer());
  if (!matches(data)) throw new Error(`Size/checksum mismatch: ${target}`);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, data);
  return {
    path: path.relative(root, target).replaceAll('\\', '/'),
    url: descriptor.url,
    bytes: data.length,
    md5: descriptor.md5,
    sha256: createHash('sha256').update(data).digest('hex'),
  };
}

await mkdir(root, { recursive: true });
const manifest = { provider: 'Powered by Poly Haven', license: 'CC0-1.0',
  licenseUrl: 'https://polyhaven.com/license', acquiredAt: new Date().toISOString(), assets: [] };
for (const selection of selections) {
  const descriptors = await (await request(`https://api.polyhaven.com/files/${selection.id}`)).json();
  await writeFile(path.join(root, `${selection.id}-files.json`), JSON.stringify(descriptors, null, 2));
  const directory = path.join(root, selection.id);
  const files = [];
  if (selection.kind === 'model') {
    const model = descriptors.gltf?.[selection.resolution]?.gltf;
    if (!model) throw new Error(`Missing glTF for ${selection.id}`);
    files.push(await acquire(path.join(directory, path.basename(new URL(model.url).pathname)), model));
    for (const [relative, descriptor] of Object.entries(model.include)) {
      const target = path.resolve(directory, relative);
      if (!target.startsWith(directory + path.sep)) throw new Error(`Invalid dependency path: ${relative}`);
      files.push(await acquire(target, descriptor));
    }
  } else {
    for (const channel of ['Diffuse', 'nor_dx', 'Rough']) {
      const descriptor = descriptors[channel]?.[selection.resolution]?.jpg;
      if (!descriptor) throw new Error(`Missing ${channel} for ${selection.id}`);
      files.push(await acquire(path.join(directory, `${channel}.jpg`), descriptor));
    }
  }
  manifest.assets.push({ ...selection, source: `https://polyhaven.com/a/${selection.id}`, files });
  await writeFile(path.join(root, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`${selection.id}: ${files.length} verified files, ${(files.reduce((sum,f)=>sum+f.bytes,0)/1048576).toFixed(1)} MiB`);
}
