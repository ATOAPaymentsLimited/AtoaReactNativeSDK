import type { AtoaEnv } from '../types';

export const Endpoints = {
  institutions: 'institutions/customer?sendDisabledBanks=true',
  getPaymentDetails: 'payments/get-payment-details',
  securedAuthUrl: 'payments/v1/secure-payment-auth',
  getPaymentStatus: (id: string) => `payments/v2/payment/${id}/status`,
} as const;

/**
 * Appends sandbox env query params when running in sandbox mode.
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
