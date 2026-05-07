interface NextRouter {
  pathname: string;
  push?: (url: string) => void;
  refresh?: () => void;
}

interface Window {
  NEXT_ROUTER?: NextRouter;
}

declare module '*.jpg';
declare module '*.png';
declare module '*.svg';
declare module '*.jpeg';
declare module '*.module.module.scss';
declare module '*.module.scss';

interface Window {
  NEXT_ROUTER?: Record<string, any>;
}
