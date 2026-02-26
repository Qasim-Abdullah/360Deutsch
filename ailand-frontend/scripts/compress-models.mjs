/**
 * Compress GLB models: Draco mesh compression + texture resizing via sharp.
 * Usage: node scripts/compress-models.mjs
 */

import { readFile, writeFile, stat } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { NodeIO } from '@gltf-transform/core';
import { KHRDracoMeshCompression, ALL_EXTENSIONS } from '@gltf-transform/extensions';
import {
  dedup,
  draco,
  textureCompress,
  prune,
  quantize,
} from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';

const ROOT = path.resolve('public/models');
const LEVEL1 = path.join(ROOT, 'levels/level1');

// Models to compress: [inputPath, outputPath]
const models = [
  // Level 1
  [path.join(LEVEL1, 'originals/chair.glb'), path.join(LEVEL1, 'chair.glb')],
  [path.join(LEVEL1, 'originals/book.glb'), path.join(LEVEL1, 'book.glb')],
  [path.join(LEVEL1, 'originals/comp.glb'), path.join(LEVEL1, 'comp.glb')],
  [path.join(LEVEL1, 'originals/piano.glb'), path.join(LEVEL1, 'piano.glb')],
  [path.join(LEVEL1, 'originals/wall_watch.glb'), path.join(LEVEL1, 'wall_watch.glb')],
  // Room models
  [path.join(ROOT, 'originals/Bg7.glb'), path.join(ROOT, 'Bg7.glb')],
  [path.join(ROOT, 'originals/Bg3.glb'), path.join(ROOT, 'Bg3.glb')],
  [path.join(ROOT, 'originals/Room_Portfolio.glb'), path.join(ROOT, 'Room_Portfolio.glb')],
];

async function formatSize(filepath) {
  try {
    const s = await stat(filepath);
    const mb = s.size / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(s.size / 1024).toFixed(0)} KB`;
  } catch {
    return 'N/A';
  }
}

async function compressModel(inputPath, outputPath) {
  const name = path.basename(outputPath);
  const beforeSize = await formatSize(inputPath);
  console.log(`\nCompressing ${name} (${beforeSize})...`);

  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      'draco3d.decoder': await draco3d.createDecoderModule(),
      'draco3d.encoder': await draco3d.createEncoderModule(),
    });

  const document = await io.read(inputPath);

  // 1. Remove duplicate resources
  await document.transform(dedup());

  // 2. Prune unused data
  await document.transform(prune());

  // 3. Quantize mesh attributes
  await document.transform(quantize());

  // 4. Compress textures with sharp (resize large textures + convert to WebP)
  await document.transform(
    textureCompress({
      encoder: sharp,
      targetFormat: 'webp',
      resize: [1024, 1024],
    })
  );

  // 5. Apply Draco mesh compression
  await document.transform(
    draco({
      compressionLevel: 7,
      quantizePositionBits: 14,
      quantizeNormalBits: 10,
      quantizeTexcoordBits: 12,
      quantizeColorBits: 8,
    })
  );

  await io.write(outputPath, document);

  const afterSize = await formatSize(outputPath);
  console.log(`  ${name}: ${beforeSize} -> ${afterSize}`);
}

async function main() {
  console.log('=== GLB Model Compression ===\n');

  for (const [input, output] of models) {
    try {
      await compressModel(input, output);
    } catch (err) {
      console.error(`  ERROR compressing ${path.basename(input)}: ${err.message}`);
    }
  }

  console.log('\n=== Done ===');
}

main();
