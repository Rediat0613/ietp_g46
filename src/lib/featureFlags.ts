export const featureFlags = {
  enableWebSerial: (process.env.NEXT_PUBLIC_ENABLE_WEBSERIAL || 'false').toLowerCase() === 'true',
  enableDemoMode: (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE || 'true').toLowerCase() === 'true',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Smart Lab Monitoring',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
};
