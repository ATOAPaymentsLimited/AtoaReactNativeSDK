import type { AtoaEnvironment } from '../types';

export const ENVIRONMENT_BASE_URLS: Record<AtoaEnvironment, string> = {
  development: 'https://devapi.atoa.me/api/',
  staging: 'https://uatapi.atoa.me/api/',
  production: 'https://api.atoa.me/api/',
};

export const CARD_CHECKOUT_BASE_URLS: Record<AtoaEnvironment, string> = {
  development: 'https://devapp.atoa.me/',
  staging: 'https://uat.atoa.me/',
  production: 'https://atoa.me/',
};

// Safari user-agent so the checkout page doesn't show a "switch browser" dialog on iOS.
export const IOS_USER_AGENT =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

export function getBaseUrl(environment: AtoaEnvironment): string {
  return ENVIRONMENT_BASE_URLS[environment];
}

export function getCardCheckoutUrl(
  environment: AtoaEnvironment,
  checkoutId: string,
  businessName: string
): string {
  const baseUrl = CARD_CHECKOUT_BASE_URLS[environment];
  const params = new URLSearchParams({
    checkoutId,
    businessName,
    deviceOrigin: 'SDK_MOBILE_APP',
  });
  return `${baseUrl}card-checkout?${params.toString()}`;
}
