// Debug script to verify Microsoft authentication configuration
console.log('=== Microsoft Authentication Debug Info ===');

// Check environment variables
console.log('Environment Variables:');
console.log('VITE_MICROSOFT_CLIENT_ID:', import.meta.env.VITE_MICROSOFT_CLIENT_ID);
console.log('VITE_MICROSOFT_TENANT_ID:', import.meta.env.VITE_MICROSOFT_TENANT_ID);

// Check current window location
console.log('\\nCurrent Location:');
console.log('Origin:', window.location.origin);
console.log('Host:', window.location.host);
console.log('Port:', window.location.port);

// Import and check MSAL config
import { msalConfig, MICROSOFT_CLIENT_ID, MICROSOFT_TENANT_ID } from './utils/auth';

console.log('\\nMSAL Configuration:');
console.log('Client ID:', MICROSOFT_CLIENT_ID);
console.log('Tenant ID:', MICROSOFT_TENANT_ID);
console.log('Authority:', msalConfig.auth.authority);
console.log('Redirect URI:', msalConfig.auth.redirectUri);
console.log('Post Logout Redirect URI:', msalConfig.auth.postLogoutRedirectUri);

console.log('\\nExpected Redirect URIs in Azure Portal:');
console.log('- http://localhost:5173');
console.log('- http://localhost:5173/auth/microsoft/callback');

export {};