export enum RenderMode {
  SSR = 'ssr',
  CSR = 'csr',
}

export interface FragmentConfig {
  name: string;
  label?: string;
  description?: string;
  defaultMode?: RenderMode;
}

export interface NavFragment {
  name: string;
  label: string;
  description: string;
}

export interface FragmentPayload {
  js: string;
  css: string;
  html: string;
  jsUrl: string;
  props: unknown;
  cssUrl: string;
  mountId: string;
}

export type ConfigType = Record<string, string | object>;

export interface ConfigDataInterface {
  configs: ConfigType;
  secrets: ConfigType | {};
}
