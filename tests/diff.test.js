import { describe, expect, it } from 'vitest';
import { buildDiff } from '../src/utils/diff.js';

describe('diff utility', () => {
  it('detects added and removed lines', () => {
    const result = buildDiff('hello\nworld', 'hello\nnew world');
    expect(result.addedCount).toBeGreaterThan(0);
    expect(result.removedCount).toBeGreaterThan(0);
    expect(result.html).toContain('diff-added');
  });
});
