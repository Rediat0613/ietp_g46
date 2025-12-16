import fetch from 'node-fetch';

const payload = {
  name: 'Test Admin',
  email: 'admin@example.com',
  password: 'Password123!',
  role: 'admin'
};

(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
})();
