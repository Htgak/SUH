const SUPPORTED_HASHES = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashText(text, algorithm = 'SHA-256', cryptoProvider = globalThis.crypto) {
  if (!SUPPORTED_HASHES.includes(algorithm)) {
    throw new Error(`Unsupported hash algorithm: ${algorithm}`);
  }

  if (!cryptoProvider?.subtle) {
    throw new Error('Web Crypto API is not available in this environment.');
  }

  const bytes = new TextEncoder().encode(text);
  const digest = await cryptoProvider.subtle.digest(algorithm, bytes);
  return toHex(digest);
}

export { SUPPORTED_HASHES };
