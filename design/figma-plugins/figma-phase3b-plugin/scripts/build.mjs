import { build, context } from 'esbuild';
import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const options = {
  absWorkingDir: projectRoot,
  entryPoints: ['./src/code.ts'],
  outfile: resolve(projectRoot, 'dist/code.js'),
  bundle: true,
  platform: 'browser',
  format: 'iife',
  target: 'es2020',
  logLevel: 'info',
};

await mkdir(resolve(projectRoot, 'dist'), { recursive: true });
await copyFile(resolve(projectRoot, 'src/ui.html'), resolve(projectRoot, 'dist/ui.html'));

if (process.argv.includes('--watch')) {
  const ctx = await context(options);
  await ctx.watch();
  console.log('Watching TypeScript. If src/ui.html changes, rerun npm run build.');
} else {
  await build(options);
}
