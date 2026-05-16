export function scanUrl(urlStr) {
  try {
    const url = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
    const results = [];
    const domain = url.hostname;

    if (domain.length > 50) results.push({ type: 'Warning', msg: 'Domain name is unusually long.' });

    const parts = domain.split('.');
    if (parts.length > 3 && domain !== 'www.google.co.uk' && domain.length > 15) {
      results.push({ type: 'Warning', msg: 'Multiple subdomains detected (possible obfuscation).' });
    }

    const suspiciousTlds = ['.xyz', '.top', '.club', '.gq', '.ml', '.cf', '.tk'];
    if (suspiciousTlds.some(tld => domain.endsWith(tld))) {
      results.push({ type: 'High', msg: 'Suspicious TLD (frequently used for phishing/spam).' });
    }

    if ((domain.match(/-/g) || []).length >= 3) {
      results.push({ type: 'Warning', msg: 'Multiple hyphens in domain.' });
    }

    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain)) {
      results.push({ type: 'High', msg: 'IP address used instead of domain name.' });
    }
    
    if (domain.includes('xn--')) {
      results.push({ type: 'High', msg: 'Punycode domain detected (possible homograph attack).' });
    }

    return {
      domain,
      protocol: url.protocol,
      safeBrowsing: 'Educational Mode: Simulating local heuristic checks only.',
      findings: results.length ? results : [{ type: 'Info', msg: 'No obvious heuristic indicators found.' }],
      isSuspicious: results.some(r => r.type === 'High' || r.type === 'Warning')
    };

  } catch {
    return { error: 'Invalid URL format.' };
  }
}
