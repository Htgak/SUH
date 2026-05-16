import { describe, expect, it } from 'vitest';
import { highlightMatches, testRegex } from '../src/utils/regex.js';

describe('regex utilities', () => {
  it('finds all matches', () => {
    const result = testRegex('\\d+', 'g', 'abc 123 and 456');
    expect(result.valid).toBe(true);
    expect(result.matches).toHaveLength(2);
  });

  it('handles invalid regex', () => {
    const result = testRegex('[abc', 'g', 'abc');
    expect(result.valid).toBe(false);
  });

  it('highlights matches safely', () => {
    const highlighted = highlightMatches('abc 123', '\\d+', 'g');
    expect(highlighted).toContain('<mark>123</mark>');
  });
});
