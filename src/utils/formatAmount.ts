/**
 * Formats a numeric amount with a currency symbol.
 * Defaults to GBP (£) when no currency is provided or currency is 'GBP'.
 */
export function formatAmount(
  amount: number,
  currency?: string | null,
): string {
  const symbol = !currency || currency === 'GBP' ? '£' : currency;
  return `${symbol}${amount.toFixed(2)}`;
}
