import getEnv from './getEnvVariable';

const isDevEnvironment = () => {
  return getEnv('NEXT_PUBLIC_LOCAL_MACHINE');
};

export default isDevEnvironment;
