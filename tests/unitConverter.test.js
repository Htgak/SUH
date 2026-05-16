import { describe, expect, it } from 'vitest';
import { convertUnit, getUnitsByCategory } from '../src/utils/unitConverter.js';

describe('unit converter', () => {
  it('returns units for a category', () => {
    const units = getUnitsByCategory('length');
    expect(units).toContain('meter');
    expect(units).toContain('mile');
  });

  it('converts length accurately', () => {
    const result = convertUnit('length', 'kilometer', 'meter', 2);
    expect(result).toBe(2000);
  });

  it('converts temperature accurately', () => {
    const result = convertUnit('temperature', 'celsius', 'fahrenheit', 100);
    expect(result).toBe(212);
  });
});
