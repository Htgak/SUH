import { describe, expect, it } from 'vitest';
import { hashText } from '../src/utils/hash.js';

describe('hash utility', () => {
  it('generates deterministic sha-256 hash', async () => {
    const hash = await hashText('abc', 'SHA-256');
    expect(hash).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('throws on unsupported algorithms', async () => {
    await expect(hashText('abc', 'MD5')).rejects.toThrowError('Unsupported hash algorithm');
  });
});
