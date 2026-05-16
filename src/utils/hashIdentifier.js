export function identifyHash(hash) {
  hash = hash.trim();
  const results = [];
  const len = hash.length;

  if (/^[a-fA-F0-9]+$/.test(hash)) {
    if (len === 32) results.push({ name: 'MD5', danger: 'High - Compromised' });
    if (len === 40) results.push({ name: 'SHA-1', danger: 'High - Weak' });
    if (len === 64) results.push({ name: 'SHA-256', danger: 'Low - Secure' });
    if (len === 128) results.push({ name: 'SHA-512', danger: 'Low - Secure' });
  }

  if (/^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$/.test(hash)) {
    results.push({ name: 'bcrypt', danger: 'Low - Secure' });
  }
  if (/^\$argon2(i|d|id)\$v=\d+\$m=\d+,t=\d+,p=\d+\$[A-Za-z0-9+/]+\$[A-Za-z0-9+/]+$/.test(hash)) {
    results.push({ name: 'Argon2', danger: 'Low - Secure' });
  }

  const charsetSize = new Set(hash.split('')).size;
  const entropy = len * Math.log2(charsetSize || 1);

  return { 
    identities: results.length ? results : [{ name: 'Unknown Format', danger: 'N/A' }], 
    entropy: entropy.toFixed(2),
    warning: results.some(r => r.danger.includes('High')) ? 'Warning: This hash uses a weak/deprecated algorithm.' : 'Hash format looks standard.'
  };
}
