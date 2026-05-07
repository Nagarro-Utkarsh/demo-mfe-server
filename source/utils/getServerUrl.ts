import { getAppConstants, getAppServerConfigs } from './readNewConfigs';
import { CONTENT_STACK } from './service-keys';

const isDevMachine = (): boolean => process.env.NEXT_PUBLIC_LOCAL_MACHINE === 'true';

const getServerUrl = (serviceKey: string, country?: string, locale?: string): string => {
  const constants = getAppConstants();

  if (isDevMachine()) {
    return constants.NEXT_PUBLIC_DEV_API_URL;
  }

  const configs = (country && locale ? getAppServerConfigs(country, locale) : {}) as Record<
    string,
    unknown
  >;

  if (configs.ENABLE_PUBLIC_CMS_APIS && serviceKey === CONTENT_STACK) {
    return `${configs.DEFAULT_HOST_URL}/api`;
  }

  return `http://${serviceKey}.${configs.NEXT_SSR_BASE_PATH ?? ''}`;
};

export default getServerUrl;
