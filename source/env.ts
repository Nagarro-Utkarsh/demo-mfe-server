import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env from the same directory as this file
config({ path: resolve(__dirname, '.env') });

// ─── Typed env constants ──────────────────────────────────────────────────────

/** Port the Fastify server listens on. Default: 3001 */
export const PORT = Number(process.env.PORT) || 3001;

/** Host address the server binds to. Default: 0.0.0.0 */
export const HOST = process.env.HOST ?? '0.0.0.0';

/** Whether to open the browser automatically on server start. Default: true */
export const OPEN_BROWSER = process.env.OPEN_BROWSER;

export const TENANT_NAME = process.env.TENANT_NAME;

export const COUNTRY_CODE = process.env.COUNTRY_CODE;

export const TENANT_ENV = process.env.TENANT_ENV;

export const CONFIG_SERVER_URL = process.env.CONFIG_SERVER_URL ?? 'http://localhost:4001';
