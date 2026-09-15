import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

process.env.FIREBASE_ADMIN_PROJECT_ID ??= 'vasco-e2e';
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= '127.0.0.1:9099';

const build = spawnSync(process.execPath, [resolve('node_modules/next/dist/bin/next'), 'build'], {
  env: process.env,
  stdio: 'inherit',
});

if (build.status !== 0) process.exit(build.status ?? 1);

const standaloneRoot = resolve('.next/standalone');
const assets = [
  { source: resolve('public'), destination: resolve(standaloneRoot, 'public') },
  { source: resolve('.next/static'), destination: resolve(standaloneRoot, '.next/static') },
];

for (const { source, destination } of assets) {
  if (!existsSync(source)) continue;
  mkdirSync(destination, { recursive: true });
  cpSync(source, destination, { recursive: true });
}

process.env.PORT = '3100';
process.env.HOSTNAME = '::';

await import('../.next/standalone/server.js');
