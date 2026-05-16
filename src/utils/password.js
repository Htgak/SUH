const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-={}[]:;<>?,.';

function removeAmbiguous(charset) {
  return charset.replace(/[O0Il1]/g, '');
}

export function createCharset(options) {
  let charset = '';

  if (options.useLowercase) charset += LOWER;
  if (options.useUppercase) charset += UPPER;
  if (options.useNumbers) charset += NUMBERS;
  if (options.useSymbols) charset += SYMBOLS;

  if (options.excludeAmbiguous) {
    charset = removeAmbiguous(charset);
  }

  return charset;
}

export function generatePassword(options, randomFn = Math.random) {
  const length = Number(options.length ?? 16);
  if (!Number.isInteger(length) || length < 4 || length > 128) {
    throw new Error('Password length must be an integer between 4 and 128.');
  }

  const charset = createCharset(options);
  if (!charset) {
    throw new Error('Select at least one character type.');
  }

  let password = '';
  for (let index = 0; index < length; index += 1) {
    const charIndex = Math.floor(randomFn() * charset.length);
    password += charset[charIndex];
  }

  return password;
}

export function getPasswordStrength(password) {
  let score = 0;

  if (password.length >= 12) score += 1;
  if (password.length >= 20) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z\d]/.test(password)) score += 1;

  if (score <= 2) return { label: 'Weak', value: 33 };
  if (score <= 4) return { label: 'Good', value: 66 };
  return { label: 'Strong', value: 100 };
}

export function calculateEntropy(password) {
  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/\d/.test(password)) poolSize += 10;
  if (/[^a-zA-Z\d]/.test(password)) poolSize += 32; // Approximate symbols

  if (poolSize === 0 || password.length === 0) return { bits: 0, poolSize: 0 };

  const bits = password.length * Math.log2(poolSize);
  return { bits: Math.round(bits), poolSize };
}
