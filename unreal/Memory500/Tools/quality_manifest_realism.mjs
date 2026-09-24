import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../SourceAssets/Quality/Realism/', import.meta.url));
const entries = [];
async function visit(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, item.name);
    if (item.isDirectory()) await visit(target);
    else if (/\.(glb|blend|png)$/.test(item.name) || ['trim-plan.json', 'placement.json'].includes(item.name)) {
      const bytes = await readFile(target);
      entries.push({ path: path.relative(root, target).replaceAll('\\', '/'), bytes: bytes.length,
        sha256: createHash('sha256').update(bytes).digest('hex') });
    }
  }
}
await visit(root);
const manifest = {
  purpose: 'Additional object realism pass for MemorySalon_VisualSlice',
  authored: ['Banker lamp', 'Hollow blue glazed vessel', 'Nine micro-surface maps'],
  reusedCC0: ['potted_plant_01', 'potted_plant_02', 'potted_plant_04', 'book_encyclopedia_set_01'],
  providers: ['https://polyhaven.com/license', '../manifest.json', '../../BookUpgrade/manifest.json'],
  files: entries.sort((a, b) => a.path.localeCompare(b.path)),
};
await writeFile(path.join(root, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`${entries.length} files, ${entries.reduce((sum, entry) => sum + entry.bytes, 0)} bytes`);
