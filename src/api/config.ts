import type { AtoaEnvironment } from '../types';

export const ENVIRONMENT_BASE_URLS: Record<AtoaEnvironment, string> = {
  development: 'https://devapi.atoa.me/api/',
  staging: 'https://uatapi.atoa.me/api/',
  production: 'https://api.atoa.me/api/',
};

export function getBaseUrl(environment: AtoaEnvironment): string {
  return ENVIRONMENT_BASE_URLS[environment];
}
