/**
 * React Native compatible UUID v4 generator
 * Based on RFC4122 compliant implementation without Node.js dependencies
 */
export function generateUUID(): string {
  // Use Math.random() as fallback for React Native
  const getRandomValues = (arr: Uint8Array) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  };

  const bytes = new Uint8Array(16);
  getRandomValues(bytes);

  // Set version (4) and variant bits
  bytes[6] = (bytes[6]! & 0x0f) | 0x40; // Version 4
  bytes[8] = (bytes[8]! & 0x3f) | 0x80; // Variant 10

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
