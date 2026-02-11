import { Colors } from '../constants/colors';
import type { MerchantThemeDetails } from '../types/merchant';

/**
 * Resolves merchant branding colors, falling back to defaults.
 * Matches Flutter's BrandingColorUtility.
 */
export function getBrandingColors(theme?: MerchantThemeDetails): {
  backgroundColor: string;
  foregroundColor: string;
} {
  return {
    backgroundColor: theme?.colorCode || Colors.brandPrimary,
    foregroundColor: theme?.foregroundColor || Colors.white,
  };
}
