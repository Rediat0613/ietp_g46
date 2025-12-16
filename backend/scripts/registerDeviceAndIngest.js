import fetch from 'node-fetch';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

if (!ADMIN_TOKEN) {
  console.error('Please set ADMIN_TOKEN env var');
  process.exit(1);
}

(async () => {
  try {
    // Register device
    const res = await fetch('http://localhost:5000/api/devices/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ADMIN_TOKEN}` },
      body: JSON.stringify({ name: 'esp32-sim', owner: null })
    });
    const json = await res.json();
    console.log('Register device response:', JSON.stringify(json, null, 2));

    if (!json.success) return;

    const { deviceId, secret } = json.data;

    // Ingest data using device key
    const deviceKey = `${deviceId}:${secret}`;
    const ingestRes = await fetch('http://localhost:5000/api/devices/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-device-key': deviceKey },
      body: JSON.stringify({ gas: 100, temp: 23.5, humidity: 40, userId: process.env.ADMIN_USER_ID || null, fanStatus: false, buzzerStatus: false })
    });
    const ingestJson = await ingestRes.json();
    console.log('Ingest response:', JSON.stringify(ingestJson, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
})();
