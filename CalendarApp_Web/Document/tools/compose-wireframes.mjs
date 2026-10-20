import { readFile, realpath, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname, basename, relative, isAbsolute, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

const clone = value => structuredClone(value);
const fail = message => { throw new Error(message); };

// CalendarApp document adapter: composition is a local authoring contract,
// not an external-reference feature of the shared WireFrame renderer.
export async function composeWireframe(inputPath) {
  const input = await realpath(inputPath);
  const folder = dirname(input);
  const document = JSON.parse(await readFile(input, 'utf8'));
  if (document.schema_version !== 3) fail('Expected v3 input');
  if (!document.composition) return document;
  const contract = document.composition;
  if (contract.version !== 1 || !Array.isArray(contract.includes)) fail('Invalid composition contract');
  const output = clone(document);
  delete output.composition;
  const ids = new Set(output.components.map(component => component.id));
  if (ids.size !== output.components.length) fail('Duplicate local component ID');
  const included = new Set();
  for (const item of contract.includes) {
    if (!/^COMMON-\d{3}\.json$/.test(item.file) || included.has(item.file)) fail('Invalid or duplicate common file');
    included.add(item.file);
    const target = await realpath(resolve(folder, item.file));
    if (dirname(target) !== folder) fail('Common reference escapes authoring folder');
    const common = JSON.parse(await readFile(target, 'utf8'));
    if (common.schema_version !== 3 || common.type !== 'common_area' || common.composition) fail('Invalid or recursive common definition');
    if (common.id !== basename(item.file, '.json') || common.screen.id !== common.id) fail('Common ID mismatch');
    if (!common.applies_to?.includes(document.screen.id)) fail('Common does not apply to screen');
    if (JSON.stringify(common.screen.viewport) !== JSON.stringify(document.screen.viewport) || common.screen.unit !== document.screen.unit) fail('Coordinate basis mismatch');
    const components = clone(common.components);
    const localIds = new Set(components.map(component => component.id));
    const roots = components.filter(component => !component.parent);
    if (localIds.size !== components.length) fail('Duplicate common component ID');
    if (!item.mounts || Object.keys(item.mounts).length !== roots.length) fail('Every common root needs one mount');
    for (const root of roots) {
      const mount = item.mounts[root.id];
      if (!mount || !ids.has(mount.parent)) fail('Invalid mount parent');
      root.parent = mount.parent;
      root.scope = 'parent';
      root.rect = clone(mount.rect);
    }
    for (const [id, patch] of Object.entries(item.overrides || {})) {
      const component = components.find(candidate => candidate.id === id);
      if (!component) fail(`Unknown override target: ${id}`);
      if (Object.keys(patch).some(key => !['text', 'states', 'style', 'rect', 'visible', 'properties'].includes(key))) fail('Override changes shared responsibility');
      Object.assign(component, clone(patch));
    }
    for (const component of components) {
      if (ids.has(component.id)) fail(`Duplicate composed ID: ${component.id}`);
      ids.add(component.id);
      output.components.push(component);
    }
    output.derivation.sources = [...new Set([...output.derivation.sources, ...common.derivation.sources])];
  }
  const byId = new Map(output.components.map(component => [component.id, component]));
  for (const component of output.components) {
    const visited = new Set([component.id]);
    let parent = component.parent;
    while (parent && parent !== output.frame.id) {
      if (!byId.has(parent) || visited.has(parent)) fail('Missing or cyclic parent');
      visited.add(parent);
      parent = byId.get(parent).parent;
    }
    if (!['x', 'y', 'w', 'h'].every(key => Number.isFinite(component.rect?.[key])) || component.rect.w <= 0 || component.rect.h <= 0) fail('Invalid measured geometry');
  }
  return output;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [input, destination] = process.argv.slice(2);
  if (!input || !destination) fail('Usage: node compose-wireframes.mjs input.json output.json');
  const folder = await realpath(dirname(resolve(input)));
  const output = resolve(destination);
  if (extname(output) !== '.json') fail('Derived output must be a JSON file');
  const local = relative(folder, output);
  if (local === '' || (!local.startsWith('..') && !isAbsolute(local))) fail('Derived output must be outside the authoring folder');
  const composed = await composeWireframe(input);
  await mkdir(dirname(output), { recursive: true });
  const outputFolder = await realpath(dirname(output));
  const realLocal = relative(folder, outputFolder);
  if (realLocal === '' || (!realLocal.startsWith('..') && !isAbsolute(realLocal))) fail('Output folder resolves into authoring folder');
  try {
    const existing = await realpath(output);
    const existingLocal = relative(folder, existing);
    if (existingLocal === '' || (!existingLocal.startsWith('..') && !isAbsolute(existingLocal))) fail('Output resolves to an authoring file');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  await writeFile(output, JSON.stringify(composed, null, 2) + '\n', 'utf8');
  process.stdout.write(JSON.stringify({ screen: composed.screen.id, components: composed.components.length, output }) + '\n');
}
