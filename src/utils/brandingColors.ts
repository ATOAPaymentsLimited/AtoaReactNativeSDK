import { Colors } from '../constants/colors';
import type { MerchantThemeDetails } from '../types/merchant';

/**
 * Resolves merchant branding colors.
 * Returns null when no merchant theme is provided (use default LedgerButton styling).
 */
export function getBrandingColors(theme?: MerchantThemeDetails): {
  backgroundColor: string;
  foregroundColor: string;
} | null {
  if (!theme?.colorCode && !theme?.foregroundColor) {
    return null;
  }
  return {
    backgroundColor: theme.colorCode || Colors.brandPrimary,
    foregroundColor: theme.foregroundColor || Colors.white,
  };
}
