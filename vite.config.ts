import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

// Load frontend/.env.global (shared across all apps). Vite doesn't load a
// parent-folder `.env.global` automatically, so we read it here and inject it.
function readGlobalEnv(): Record<string, string> {
  const file = resolve(here, '..', '.env.global');
  if (!existsSync(file)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const i = trimmed.indexOf('=');
    out[trimmed.slice(0, i).trim()] = trimmed.slice(i + 1).trim();
  }
  return out;
}

export default defineConfig(({ mode }) => {
  const global = readGlobalEnv();
  // App-local env (.env, .env.local, .env.[mode]) overrides the global only when non-empty.
  const local = loadEnv(mode, here, '');
  const env: Record<string, string> = { ...global };
  for (const [key, value] of Object.entries(local)) {
    if (value) env[key] = value;
  }

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(
        env.VITE_API_URL ?? 'http://localhost:3000',
      ),
      'import.meta.env.VITE_AGENCY_ID': JSON.stringify(
        env.VITE_AGENCY_ID ?? '',
      ),
    },
  };
});
