import type { AtoaEnv } from '../types';

const BASE_URLS: Record<AtoaEnv, string> = {
  sandbox: 'https://devapi.atoa.me/api/',
  prod: 'https://api.atoa.me/api/',
};

export function getBaseUrl(env: AtoaEnv): string {
  return BASE_URLS[env];
}

export const Endpoints = {
  institutions: 'institutions/customer?sendDisabledBanks=true',
  getPaymentDetails: 'payments/get-payment-details',
  securedAuthUrl: 'payments/v1/secure-payment-auth',
  getPaymentStatus: (id: string) => `payments/v2/payment/${id}/status`,
} as const;

/**
 * Appends sandbox env query params matching Flutter's RequestInterceptor logic.
 */
export function applyEnvParam(path: string, env: AtoaEnv): string {
  if (env !== 'sandbox') {
    return path;
  }

  const isPaymentStatus =
    path.includes('payments/v2/payment/') && path.includes('/status');
  const isFetchBanks = path.includes('institutions/customer');

  if (isPaymentStatus) {
    return `${path}?env=sandbox`;
  }
  if (isFetchBanks) {
    return `${path}&env=sandbox`;
  }

  return path;
}
