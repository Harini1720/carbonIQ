import { build } from 'esbuild';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const frontendDirectory = resolve(scriptDirectory, '..');
const backendEntry = resolve(frontendDirectory, '..', 'backend', 'app.js');

await build({
  entryPoints: [backendEntry],
  outfile: resolve(frontendDirectory, 'dist-desktop', 'backend.cjs'),
  bundle: true,
  platform: 'node',
  format: 'cjs',
  packages: 'bundle',
  external: ['node:*'],
  sourcemap: false
});
