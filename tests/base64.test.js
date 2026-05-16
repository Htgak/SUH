import { describe, expect, it } from 'vitest';
import { decodeBase64, encodeBase64 } from '../src/utils/base64.js';

describe('base64 utilities', () => {
  it('encodes and decodes unicode strings', () => {
    const encoded = encodeBase64('Hello ??????');
    const decoded = decodeBase64(encoded);
    expect(decoded).toBe('Hello ??????');
  });
});
