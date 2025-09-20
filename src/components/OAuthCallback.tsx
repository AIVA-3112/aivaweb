import React, { useEffect } from 'react';
import { MICROSOFT_CLIENT_ID, MICROSOFT_TENANT_ID } from '../utils/auth';

interface OAuthCallbackProps {
  provider: 'google' | 'microsoft' | 'yahoo';
}

const OAuthCallback: React.FC<OAuthCallbackProps> = ({ provider }) => {
  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          // Send error to parent window
          window.opener?.postMessage({
            type: 'OAUTH_ERROR',
            error: error
          }, window.location.origin);
          return;
        }

        if (code) {
          // For Microsoft authentication, include the client ID and tenant ID
          const requestBody = provider === 'microsoft' 
            ? { 
                code, 
                clientId: MICROSOFT_CLIENT_ID,
                tenantId: MICROSOFT_TENANT_ID
              }
            : { code };
            
          // Exchange code for tokens (this would typically be done on your backend)
          const response = await fetch(`/api/auth/${provider}/callback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          if (response.ok) {
            const userData = await response.json();
            // Send success to parent window
            window.opener?.postMessage({
              type: 'OAUTH_SUCCESS',
              user: userData
            }, window.location.origin);
          } else {
            throw new Error('Failed to authenticate');
          }
        }
      } catch (error) {
        // Send error to parent window
        window.opener?.postMessage({
          type: 'OAUTH_ERROR',
          error: error instanceof Error ? error.message : 'Authentication failed'
        }, window.location.origin);
      }
    };

    handleCallback();
  }, [provider]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-white text-lg">Completing authentication...</p>
        <p className="text-slate-400 text-sm mt-2">Please wait while we sign you in.</p>
      </div>
    </div>
  );
};

export default OAuthCallback;