export function analyzeLog(logText) {
  const lines = logText.split('\n').map(l => l.trim()).filter(Boolean);
  const ips = new Map();
  const failures = [];
  const anomalies = [];
  
  const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
  const failRegex = /(failed|error|invalid|denied|unauthorized)/i;
  const statusRegex = /\s(4\d{2}|5\d{2})\s/;

  lines.forEach((line, index) => {
    const lineIps = line.match(ipRegex) || [];
    const isFailure = failRegex.test(line);
    const hasAnomaly = statusRegex.test(line);

    if (isFailure) failures.push({ line: index + 1, text: line });
    if (hasAnomaly) anomalies.push({ line: index + 1, text: line });

    lineIps.forEach(ip => {
      if (!ips.has(ip)) ips.set(ip, { count: 0, failCount: 0 });
      const stats = ips.get(ip);
      stats.count++;
      if (isFailure) stats.failCount++;
    });
  });

  const suspiciousIps = Array.from(ips.entries())
    .filter(([, stats]) => stats.failCount >= 3 || stats.count >= 50)
    .sort((a, b) => b[1].failCount - a[1].failCount);

  return { totalLines: lines.length, suspiciousIps, failures, anomalies };
}
