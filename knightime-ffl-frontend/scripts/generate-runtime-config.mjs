import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';


const isVercelBuild = process.env.VERCEL === '1';
const configuredUrl = process.env.PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, '') ?? '';

if (isVercelBuild && !configuredUrl) {
  throw new Error(
    'PUBLIC_API_BASE_URL is required for Vercel builds. Set it to the deployed FastAPI URL.',
  );
}

if (isVercelBuild && !configuredUrl.startsWith('https://')) {
  throw new Error('PUBLIC_API_BASE_URL must use HTTPS for Vercel builds.');
}

const outputPath = resolve('public/runtime-config.js');
const runtimeConfig = `window.__KNIGHTIME_CONFIG__ = ${JSON.stringify({
  apiBaseUrl: configuredUrl,
})};\n`;

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, runtimeConfig, 'utf8');

console.log(
  configuredUrl
    ? `Configured API base URL: ${configuredUrl}`
    : 'Configured local API hostname fallback on port 8000',
);
