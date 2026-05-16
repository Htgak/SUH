import { describe, expect, it } from 'vitest';
import { createCharset, generatePassword, getPasswordStrength } from '../src/utils/password.js';

describe('password utilities', () => {
  it('builds charset from options', () => {
    const charset = createCharset({
      useLowercase: true,
      useUppercase: false,
      useNumbers: true,
      useSymbols: false,
      excludeAmbiguous: false
    });

    expect(charset).toContain('a');
    expect(charset).toContain('5');
    expect(charset).not.toContain('A');
  });

  it('generates password with given length', () => {
    const password = generatePassword(
      {
        length: 18,
        useLowercase: true,
        useUppercase: true,
        useNumbers: true,
        useSymbols: true,
        excludeAmbiguous: false
      },
      () => 0.1
    );

    expect(password).toHaveLength(18);
  });

  it('calculates password strength', () => {
    const strength = getPasswordStrength('Abc!12345678901234');
    expect(strength.label).toMatch(/Good|Strong/);
  });
});
