/**
 * Compress room background GLBs: texture compression only (no pruning).
 * The Bg models are texture-heavy backgrounds - aggressive pruning destroys them.
 * Usage: node scripts/compress-room-models.mjs
 */

import { stat } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { textureCompress } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';

const ROOT = path.resolve('public/models');

const models = [
  [path.join(ROOT, 'originals/Bg7.glb'), path.join(ROOT, 'Bg7.glb')],
  [path.join(ROOT, 'originals/Bg3.glb'), path.join(ROOT, 'Bg3.glb')],
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

  // Only compress textures - do NOT prune or dedup (these are texture-heavy bg models)
  // PNG->WebP conversion without resize (originals are large baked backdrop textures)
  await document.transform(
    textureCompress({
      encoder: sharp,
      targetFormat: 'webp',
    })
  );

  await io.write(outputPath, document);

  const afterSize = await formatSize(outputPath);
  console.log(`  ${name}: ${beforeSize} -> ${afterSize}`);
}

async function main() {
  console.log('=== Room Background Model Compression (texture-only) ===\n');

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
