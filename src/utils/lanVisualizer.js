export function simulateLanScan() {
  const baseIp = '192.168.1.';
  const devices = [
    { ip: baseIp + '1', mac: '00:1A:2B:3C:4D:5E', name: 'Router / Gateway', type: 'Router', status: 'Online' },
    { ip: baseIp + '100', mac: 'A1:B2:C3:D4:E5:F6', name: 'Workstation (Local)', type: 'Computer', status: 'Online' },
    { ip: baseIp + '105', mac: '11:22:33:44:55:66', name: 'Wireless Printer', type: 'Printer', status: 'Online' },
    { ip: baseIp + '110', mac: 'AA:BB:CC:DD:EE:FF', name: 'Smart TV', type: 'IoT', status: 'Offline' }
  ];

  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        networkInfo: '192.168.1.0/24 (Simulated)',
        devices
      });
    }, 1500);
  });
}
