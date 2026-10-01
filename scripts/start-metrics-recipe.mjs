// Isolated loopback recipe; never loads the user's .env or production secrets.
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

if (['.env', '.env.local', '.env.development', '.env.development.local'].some(existsSync)) {
  throw new Error('Use an isolated worktree without env files');
}
const tokenPath = process.argv[2];
if (!tokenPath) throw new Error('Expected path to local BFF metrics credential');
const child = spawn(process.execPath, [resolve('node_modules/next/dist/bin/next'), 'dev', '--webpack', '--hostname', '127.0.0.1', '--port', '3012'], {
  stdio: 'inherit',
  env: { ...process.env, BFF_METRICS_ENABLED: 'true', BFF_METRICS_TOKEN: readFileSync(tokenPath, 'utf8').trim(),
    NEXT_PUBLIC_BUCKET_HOSTNAME: 'storage.example.invalid',
    VASCO_API_URL: 'http://127.0.0.1:8008', FIREBASE_ADMIN_PROJECT_ID: 'vasco-e2e', FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099' },
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', code => { process.exitCode = code ?? 1; });
