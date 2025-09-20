// OAuth configuration and utilities
import { PublicClientApplication, Configuration, PopupRequest, AuthenticationResult } from '@azure/msal-browser';

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id';
export const MICROSOFT_CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID || '613e41ad-ed10-491c-8788-b42f488aaa29';
export const MICROSOFT_TENANT_ID = import.meta.env.VITE_MICROSOFT_TENANT_ID || '53be55ec-4183-4a38-8c83-8e6e12e2318a';
export const YAHOO_CLIENT_ID = import.meta.env.VITE_YAHOO_CLIENT_ID || 'your-yahoo-client-id';

// Microsoft Authentication Library (MSAL) configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: MICROSOFT_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}`,
    redirectUri: import.meta.env.PROD 
      ? 'https://aiva-frontend-app.azurewebsites.net' 
      : 'http://localhost:5173',
    postLogoutRedirectUri: import.meta.env.PROD 
      ? 'https://aiva-frontend-app.azurewebsites.net' 
      : 'http://localhost:5173',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: any, message: string, containsPii: boolean) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case 0: // Error
            console.error('[MSAL Error]', message);
            break;
          case 1: // Warning
            console.warn('[MSAL Warning]', message);
            break;
          case 2: // Info
            console.info('[MSAL Info]', message);
            break;
          case 3: // Verbose
            console.debug('[MSAL Debug]', message);
            break;
        }
      },
      piiLoggingEnabled: false,
      logLevel: 2 // Info level
    }
  }
};

// Initialize MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Google OAuth configuration
export const googleAuthConfig = {
  client_id: GOOGLE_CLIENT_ID,
  redirect_uri: 'http://localhost:5173/auth/google/callback',
  scope: 'openid email profile',
  response_type: 'code',
  access_type: 'offline',
  prompt: 'consent'
};

// Microsoft OAuth configuration
export const microsoftAuthConfig = {
  client_id: MICROSOFT_CLIENT_ID,
  redirect_uri: import.meta.env.PROD 
    ? 'https://aiva-frontend-app.azurewebsites.net' 
    : 'http://localhost:5173',
  scope: 'openid email profile User.Read',
  response_type: 'code',
  response_mode: 'query'
};

// Microsoft login request parameters
export const msalLoginRequest: PopupRequest = {
  scopes: ['openid', 'profile', 'email', 'User.Read', 'Directory.Read.All', 'RoleManagement.Read.Directory'],
  prompt: 'select_account'
};

// Microsoft login request for admin with enhanced permissions
export const msalAdminLoginRequest: PopupRequest = {
  scopes: ['openid', 'profile', 'email', 'User.Read', 'Directory.Read.All', 'RoleManagement.Read.Directory'],
  prompt: 'select_account'
};

// Generate Google OAuth URL
export const getGoogleAuthUrl = (): string => {
  const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const params = new URLSearchParams({
    client_id: googleAuthConfig.client_id,
    redirect_uri: googleAuthConfig.redirect_uri,
    scope: googleAuthConfig.scope,
    response_type: googleAuthConfig.response_type,
    access_type: googleAuthConfig.access_type,
    prompt: googleAuthConfig.prompt
  });
  
  return `${baseUrl}?${params.toString()}`;
};

// Generate Microsoft OAuth URL
export const getMicrosoftAuthUrl = (): string => {
  const baseUrl = 'https://login.microsoftonline.com/53be55ec-4183-4a38-8c83-8e6e12e2318a/oauth2/v2.0/authorize';
  const params = new URLSearchParams({
    client_id: microsoftAuthConfig.client_id,
    redirect_uri: microsoftAuthConfig.redirect_uri,
    scope: microsoftAuthConfig.scope,
    response_type: microsoftAuthConfig.response_type,
    response_mode: microsoftAuthConfig.response_mode
  });
  
  return `${baseUrl}?${params.toString()}`;
};

// Generate Yahoo OAuth URL
export const getYahooAuthUrl = (): string => {
  const baseUrl = 'https://api.login.yahoo.com/oauth2/request_auth';
  const params = new URLSearchParams({
    client_id: YAHOO_CLIENT_ID,
    redirect_uri: 'http://localhost:5173/auth/yahoo/callback',
    response_type: 'code',
    scope: 'openid email profile'
  });
  
  return `${baseUrl}?${params.toString()}`;
};

// Create OAuth popup window synchronously
export const createOAuthPopup = (name: string): Window | null => {
  return window.open(
    'about:blank',
    name,
    'width=500,height=600,scrollbars=yes,resizable=yes'
  );
};

// Handle OAuth popup messages
export const handleOAuthPopupMessages = (popup: Window, url: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!popup) {
      reject(new Error('Popup blocked'));
      return;
    }

    // Navigate to the OAuth URL
    popup.location.href = url;

    // Check if popup is closed
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        reject(new Error('Authentication cancelled'));
      }
    }, 1000);

    // Listen for messages from popup
    const messageListener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'OAUTH_SUCCESS') {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageListener);
        popup.close();
        resolve(event.data.user);
      } else if (event.data.type === 'OAUTH_ERROR') {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageListener);
        popup.close();
        reject(new Error(event.data.error));
      }
    };

    window.addEventListener('message', messageListener);
  });
};

// Handle Google login
export const handleGoogleLogin = async (popup?: Window): Promise<any> => {
  try {
    const authUrl = getGoogleAuthUrl();
    const popupWindow = popup || createOAuthPopup('google-login');
    if (!popupWindow) {
      throw new Error('Popup blocked');
    }
    const user = await handleOAuthPopupMessages(popupWindow, authUrl);
    return user;
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
};

// Check if user has AI Administrator role
export const checkUserRole = async (accessToken: string): Promise<boolean> => {
  try {
    console.log('Checking user roles...');
    
    // Get user's directory roles from Microsoft Graph
    const response = await fetch('https://graph.microsoft.com/v1.0/me/memberOf', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('Failed to fetch user roles:', response.status, response.statusText);
      return false;
    }
    
    const data = await response.json();
    console.log('User roles data:', data);
    
    // Check if user has AI Administrator role
    const hasAIAdminRole = data.value?.some((role: any) => 
      role.displayName === 'AI Administrator' || 
      role.roleName === 'AI Administrator' ||
      role.description?.includes('AI Administrator')
    );
    
    console.log('User has AI Administrator role:', hasAIAdminRole);
    return hasAIAdminRole;
  } catch (error) {
    console.error('Error checking user roles:', error);
    return false;
  }
};

// Handle Microsoft admin login with role verification
export const handleMicrosoftAdminLogin = async (popup?: Window): Promise<any> => {
  try {
    console.log('Starting Microsoft admin login...');
    
    // Initialize MSAL instance if not already done
    if (!msalInstance.getActiveAccount()) {
      await msalInstance.initialize();
      console.log('MSAL initialized');
    }

    // Close popup if it exists (MSAL will handle its own popup)
    if (popup) {
      popup.close();
    }
    
    console.log('Attempting MSAL popup login with admin request:', msalAdminLoginRequest);
    
    // Attempt to login with popup using admin scopes
    const response: AuthenticationResult = await msalInstance.loginPopup(msalAdminLoginRequest);
    
    console.log('MSAL admin login response:', response);
    
    if (response && response.account && response.accessToken) {
      // Set the active account
      msalInstance.setActiveAccount(response.account);
      
      console.log('Microsoft admin account received:', response.account);
      
      // Check if user has AI Administrator role
      const hasAdminRole = await checkUserRole(response.accessToken);
      
      if (!hasAdminRole) {
        throw new Error('Access denied. You must have the "AI Administrator" role to access the admin portal.');
      }
      
      // Extract user information from the account
      const account = response.account;
      const user = {
        id: account.localAccountId || account.homeAccountId,
        name: account.name || account.username || 'Microsoft Admin',
        email: account.username || account.environment,
        picture: null,
        tenantId: account.tenantId,
        provider: 'microsoft',
        roles: ['AI Administrator'],
        accessToken: response.accessToken
      };
      
      console.log('Extracted admin user data:', user);
      
      // Validate that we have essential information
      if (!user.email) {
        console.error('No email found in Microsoft admin account');
        throw new Error('Unable to get email from Microsoft account. Please ensure your account has an email address.');
      }
      
      console.log('Microsoft admin login successful:', user);
      return user;
    } else {
      console.error('No account information in MSAL admin response');
      throw new Error('No account information received from Microsoft');
    }
  } catch (error) {
    console.error('Microsoft admin login error details:', error);
    
    // Handle specific MSAL errors
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error.message.includes('user_cancelled') || error.message.includes('User cancelled')) {
        throw new Error('Login was cancelled by the user');
      } else if (error.message.includes('popup_window_error') || error.message.includes('popup')) {
        throw new Error('Popup was blocked. Please allow popups for this site.');
      } else if (error.message.includes('consent_required')) {
        throw new Error('Additional permissions required. Please contact your administrator.');
      } else if (error.message.includes('interaction_required')) {
        throw new Error('User interaction required. Please try logging in again.');
      } else if (error.message.includes('AI Administrator')) {
        throw error; // Re-throw role-specific errors as-is
      }
    }
    
    // Re-throw with more context
    throw new Error(`Microsoft admin authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
export const handleMicrosoftLogin = async (popup?: Window): Promise<any> => {
  try {
    console.log('Starting Microsoft login...');
    
    // Initialize MSAL instance if not already done
    if (!msalInstance.getActiveAccount()) {
      await msalInstance.initialize();
      console.log('MSAL initialized');
    }

    // Close popup if it exists (MSAL will handle its own popup)
    if (popup) {
      popup.close();
    }
    
    console.log('Attempting MSAL popup login with request:', msalLoginRequest);
    
    // Attempt to login with popup
    const response: AuthenticationResult = await msalInstance.loginPopup(msalLoginRequest);
    
    console.log('MSAL login response:', response);
    
    if (response && response.account) {
      // Set the active account
      msalInstance.setActiveAccount(response.account);
      
      console.log('Microsoft account received:', response.account);
      
      // Extract user information from the account
      const account = response.account;
      const user = {
        id: account.localAccountId || account.homeAccountId,
        name: account.name || account.username || 'Microsoft User',
        email: account.username || account.environment,
        picture: null,
        tenantId: account.tenantId,
        provider: 'microsoft'
      };
      
      console.log('Extracted user data:', user);
      
      // Validate that we have essential information
      if (!user.email) {
        console.error('No email found in Microsoft account');
        throw new Error('Unable to get email from Microsoft account. Please ensure your account has an email address.');
      }
      
      console.log('Microsoft login successful:', user);
      return user;
    } else {
      console.error('No account information in MSAL response');
      throw new Error('No account information received from Microsoft');
    }
  } catch (error) {
    console.error('Microsoft login error details:', error);
    
    // Handle specific MSAL errors
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error.message.includes('user_cancelled') || error.message.includes('User cancelled')) {
        throw new Error('Login was cancelled by the user');
      } else if (error.message.includes('popup_window_error') || error.message.includes('popup')) {
        throw new Error('Popup was blocked. Please allow popups for this site.');
      } else if (error.message.includes('consent_required')) {
        throw new Error('Additional permissions required. Please contact your administrator.');
      } else if (error.message.includes('interaction_required')) {
        throw new Error('User interaction required. Please try logging in again.');
      }
    }
    
    // Re-throw with more context
    throw new Error(`Microsoft authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Legacy Microsoft login method using redirect URL
export const handleMicrosoftLoginLegacy = async (popup?: Window): Promise<any> => {
  try {
    const authUrl = getMicrosoftAuthUrl();
    const popupWindow = popup || createOAuthPopup('microsoft-login');
    if (!popupWindow) {
      throw new Error('Popup blocked');
    }
    const user = await handleOAuthPopupMessages(popupWindow, authUrl);
    return user;
  } catch (error) {
    console.error('Microsoft login error:', error);
    throw error;
  }
};

// Handle Microsoft logout
export const handleMicrosoftLogout = async (): Promise<void> => {
  try {
    await msalInstance.logoutPopup({
      postLogoutRedirectUri: window.location.origin,
      mainWindowRedirectUri: window.location.origin
    });
  } catch (error) {
    console.error('Microsoft logout error:', error);
    // Clear the session storage as fallback
    msalInstance.clearCache();
  }
};

// Check if user is logged in with Microsoft
export const isLoggedInWithMicrosoft = (): boolean => {
  const accounts = msalInstance.getAllAccounts();
  return accounts.length > 0;
};

// Get current Microsoft user
export const getCurrentMicrosoftUser = (): any | null => {
  const account = msalInstance.getActiveAccount();
  if (account) {
    return {
      id: account.localAccountId,
      name: account.name || account.username,
      email: account.username,
      picture: null,
      tenantId: account.tenantId,
      provider: 'microsoft'
    };
  }
  return null;
};

// Yahoo OAuth (using OpenID Connect)
export const handleYahooLogin = async (popup?: Window): Promise<any> => {
  try {
    const authUrl = getYahooAuthUrl();
    const popupWindow = popup || createOAuthPopup('yahoo-login');
    if (!popupWindow) {
      throw new Error('Popup blocked');
    }
    const user = await handleOAuthPopupMessages(popupWindow, authUrl);
    return user;
  } catch (error) {
    console.error('Yahoo login error:', error);
    throw error;
  }
};