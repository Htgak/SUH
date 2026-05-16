import { describe, expect, it } from 'vitest';
import { generatePalette, hexToHsl, hslToHex } from '../src/utils/palette.js';

describe('palette utilities', () => {
  it('converts hsl to hex', () => {
    expect(hslToHex(0, 100, 50)).toBe('#ff0000');
  });

  it('converts hex to hsl', () => {
    const hsl = hexToHsl('#ff0000');
    expect(hsl.h).toBe(0);
  });

  it('generates five colors', () => {
    const palette = generatePalette('#f97316', 'analogous');
    expect(palette).toHaveLength(5);
  });
});
