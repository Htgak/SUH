import { describe, expect, it } from 'vitest';
import { formatJson, minifyJson, validateJson } from '../src/utils/json.js';

describe('json utilities', () => {
  it('formats JSON with indentation', () => {
    const formatted = formatJson('{"a":1,"b":2}', 2);
    expect(formatted).toContain('\n  "a": 1');
  });

  it('minifies JSON', () => {
    expect(minifyJson('{"a":1, "b": 2}')).toBe('{"a":1,"b":2}');
  });

  it('validates JSON errors', () => {
    const result = validateJson('{"a": }');
    expect(result.valid).toBe(false);
    expect(result.error.length).toBeGreaterThan(0);
  });
});
