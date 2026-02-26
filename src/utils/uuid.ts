/**
 * React Native compatible UUID v4 generator
 * Based on RFC4122 compliant implementation without Node.js dependencies
 */

function getRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  const crypto = (globalThis as Record<string, unknown>).crypto as
    | { getRandomValues: (arr: Uint8Array) => Uint8Array }
    | undefined;
  if (typeof crypto?.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytes;
}

export function generateUUID(): string {
  const bytes = getRandomBytes(16);

  // Set version (4) and variant bits
  /* eslint-disable no-bitwise */
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40; // Version 4
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80; // Variant 10
  /* eslint-enable no-bitwise */

  // Convert to hex string with dashes
  const hex: string[] = [];
  bytes.forEach((b) => {
    hex.push(b.toString(16).padStart(2, '0'));
  });

  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-');
}
