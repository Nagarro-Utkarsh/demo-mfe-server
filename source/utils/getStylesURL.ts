import { TENANT_NAME, TENANT_ENV, CONFIG_SERVER_URL } from '../env.js';

interface StyleManifest {
  generatedAt: string;
  markets: Record<string, Record<string, string>>;
}

const fetchManifest = async (): Promise<StyleManifest> => {
  const response = await fetch(`${CONFIG_SERVER_URL}/manifest.json`, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to fetch style manifest: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

const getStylesURL = async (tenant?: string, env?: string): Promise<string | null> => {
  const resolvedTenant = tenant || TENANT_NAME;
  const resolvedEnv = env || TENANT_ENV;

  if (!resolvedTenant || !resolvedEnv) {
    return null;
  }

  try {
    const manifest = await fetchManifest();
    return manifest.markets?.[resolvedTenant]?.[resolvedEnv] ?? null;
  } catch {
    console.error('Failed to fetch style manifest');
    return null;
  }
};

export { getStylesURL };
