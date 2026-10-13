import { build, context } from 'esbuild';
import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const options = {
  absWorkingDir: root,
  entryPoints: ['./src/code.ts'],
  outfile: resolve(root, 'dist/code.js'),
  bundle: true,
  platform: 'browser',
  format: 'iife',
  target: 'es2020',
};
await mkdir(resolve(root, 'dist'), { recursive: true });
await copyFile(resolve(root, 'src/ui.html'), resolve(root, 'dist/ui.html'));
if (process.argv.includes('--watch')) {
  const ctx = await context(options);
  await ctx.watch();
  console.log('Watching TypeScript; rerun build after changing ui.html.');
} else {
  await build(options);
}
