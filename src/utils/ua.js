export function parseUserAgent(ua) {
  let browser;
  let version;
  let os = 'Unknown';
  let device = 'Desktop';

  // Device detection
  if (/mobile/i.test(ua)) device = 'Mobile';
  if (/tablet/i.test(ua) || /ipad/i.test(ua)) device = 'Tablet';

  // OS detection
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  // Browser detection
  const match = ua.match(/(opera|chrome|safari|firefox|msie|trident|edg)\/?\s*(\d+)/i) || [];
  
  if (/trident/i.test(match[1])) {
    browser = 'IE';
  } else if (/edg/i.test(match[1])) {
    browser = 'Edge';
  } else {
    browser = match[1] || 'Unknown';
  }
  
  version = match[2] || 'Unknown';

  // Specific check for Chrome/Safari mix
  if (browser === 'Chrome' && ua.match(/\bOPR\/(\d+)/)) {
    browser = 'Opera';
  } else if (browser === 'Safari' && ua.match(/chrome/i)) {
    browser = 'Chrome';
  }

  return { browser, version, os, device, raw: ua };
}
