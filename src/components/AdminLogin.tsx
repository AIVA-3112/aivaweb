import React, { useState, useEffect } from 'react';
import { ChevronLeft, Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { handleMicrosoftAdminLogin, msalInstance, isLoggedInWithMicrosoft, getCurrentMicrosoftUser } from '../utils/auth';

interface AdminLoginProps {
  onBack: () => void;
  onAdminLoginSuccess: (admin: any) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onBack, onAdminLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [productKey, setProductKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingMicrosoft, setIsLoadingMicrosoft] = useState(false);
  const [socialLoginError, setSocialLoginError] = useState<string | null>(null);

  // Initialize demo admin if not exists
  const initializeDemoAdmin = () => {
    // Demo admin initialization is now handled by the backend
    console.log('Demo admin should be initialized in backend');
  };

  // Check if any admin exists
  const checkAdminExists = () => {
    // This check is now handled by the backend
    return true;
  };

  const handleMicrosoftAdminLogin = async () => {
    setIsLoadingMicrosoft(true);
    setSocialLoginError(null);
    
    try {
      console.log('Starting Microsoft admin login with role verification...');
      
      // Import and use the new admin login function with role checking
      const { handleMicrosoftAdminLogin: adminLogin } = await import('../utils/auth');
      const user = await adminLogin();
      
      console.log('Microsoft admin login user data received:', user);
      
      // Validate user data
      if (!user) {
        throw new Error('No user data received from Microsoft authentication');
      }
      
      if (!user.email && !user.name) {
        throw new Error('Incomplete user information received. Please try again.');
      }
      
      // Check if the user is from the authorized tenant
      if (!user.tenantId) {
        throw new Error('User is not from the authorized organization.');
      }
      
      // Send data to backend for validation
      const response = await fetch('/api/auth/microsoft/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: 'placeholder', // Backend expects a code parameter
          email: user.email,
          name: user.name,
          tenantId: user.tenantId,
          provider: 'microsoft'
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Microsoft authentication failed');
      }
      
      const data = await response.json();
      
      // Store JWT token from backend
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
      
      const adminData = {
        email: data.user.email || 'admin@microsoft.com',
        firstName: data.user.firstName || user.name?.split(' ')[0] || 'Admin',
        lastName: data.user.lastName || user.name?.split(' ')[1] || 'User',
        provider: 'microsoft',
        tenantId: user.tenantId,
        roles: user.roles || ['AI Administrator']
      };
      
      console.log('Calling onAdminLoginSuccess with adminData:', adminData);
      onAdminLoginSuccess(adminData);
    } catch (error) {
      console.error('Microsoft admin login failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Set more specific error messages
      if (errorMessage.includes('Popup blocked') || errorMessage.includes('popup')) {
        setSocialLoginError('Please allow pop-ups for this site and try again. Check your browser\'s address bar for a pop-up blocker icon.');
      } else if (errorMessage.includes('cancelled')) {
        setSocialLoginError('Microsoft login was cancelled.');
      } else if (errorMessage.includes('consent_required')) {
        setSocialLoginError('Additional permissions required. Please contact your administrator.');
      } else if (errorMessage.includes('interaction_required')) {
        setSocialLoginError('User interaction required. Please try logging in again.');
      } else if (errorMessage.includes('AI Administrator')) {
        setSocialLoginError('Access denied. You must have the "AI Administrator" role to access the admin portal.');
      } else {
        setSocialLoginError(`Microsoft admin login failed: ${errorMessage}`);
      }
    } finally {
      setIsLoadingMicrosoft(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    if (isCreatingAdmin && productKey !== 'AlyasraFashion') {
      setError('Invalid product key');
      setLoading(false);
      return;
    }

    try {
      // Make API call to backend for admin login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, adminLogin: true }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'Invalid email or password');
        setLoading(false);
        return;
      }
      
      // Check if user has admin role
      if (data.user.role !== 'admin') {
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }
      
      // Store JWT token
      localStorage.setItem('authToken', data.token);
      
      onAdminLoginSuccess({ 
        email: data.user.email, 
        firstName: data.user.firstName || 'Admin', 
        lastName: data.user.lastName || 'User' 
      });
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initialize MSAL instance when component mounts
  useEffect(() => {
    const initializeMSAL = async () => {
      try {
        await msalInstance.initialize();
        
        // Check if there are any cached admin accounts
        if (isLoggedInWithMicrosoft()) {
          const user = getCurrentMicrosoftUser();
          if (user) {
            console.log('Admin already logged in with Microsoft:', user);
            // Optionally auto-login the admin
            // onAdminLoginSuccess({
            //   email: user.email,
            //   firstName: user.name?.split(' ')[0] || 'Admin',
            //   lastName: user.name?.split(' ')[1] || 'User'
            // });
          }
        }
      } catch (error) {
        console.error('MSAL initialization error:', error);
      }
    };
    
    initializeMSAL();
    initializeDemoAdmin();
    const hasAdmins = checkAdminExists();
    if (!hasAdmins) {
      setIsCreatingAdmin(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
      {/* 3D Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Geometric Shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-float-slow"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full blur-lg animate-float-medium"></div>
        <div className="absolute bottom-40 left-20 w-40 h-40 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-2xl animate-float-fast"></div>
        <div className="absolute bottom-20 right-10 w-28 h-28 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-xl animate-float-slow"></div>
        
        {/* 3D Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-radial from-blue-600/30 via-purple-600/20 to-transparent rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-radial from-green-600/30 via-cyan-600/20 to-transparent rounded-full animate-pulse-medium"></div>
        
        {/* Floating Particles */}
        <div className="absolute top-1/3 left-1/2 w-2 h-2 bg-blue-400/60 rounded-full animate-particle-1"></div>
        <div className="absolute top-2/3 left-1/3 w-1 h-1 bg-purple-400/60 rounded-full animate-particle-2"></div>
        <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-cyan-400/60 rounded-full animate-particle-3"></div>
        <div className="absolute bottom-1/3 left-2/3 w-2 h-2 bg-green-400/60 rounded-full animate-particle-4"></div>
        
        {/* 3D Perspective Lines */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-blue-500/30 to-transparent transform -translate-x-1/2 animate-line-glow"></div>
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent transform -translate-y-1/2 animate-line-glow-horizontal"></div>
        </div>
        
        {/* Rotating 3D Elements */}
        <div className="absolute top-1/4 right-1/4 w-16 h-16 border border-blue-500/30 rotate-45 animate-rotate-slow"></div>
        <div className="absolute bottom-1/3 left-1/3 w-12 h-12 border border-purple-500/30 rotate-12 animate-rotate-reverse"></div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="flex items-center text-slate-300 hover:text-white mb-8 transition-all duration-300 transform hover:scale-110 animate-slide-in-left"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Login
          </button>

          <div className="bg-slate-700/50 backdrop-blur-sm border border-slate-600/50 rounded-2xl shadow-2xl p-8 animate-slide-in-right animation-delay-300 hover:shadow-blue-500/20 transition-all duration-500">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 animate-bounce-subtle">
                <img src="alyasra-logo.png" alt="logo" />
              </div>
              <h1 className="text-2xl font-bold text-white animate-fade-in-up animation-delay-400">
                {isCreatingAdmin ? 'Create Admin Account' : 'Admin Portal'}
              </h1>
              <p className="text-slate-300 mt-2 animate-fade-in-up animation-delay-500">
                {isCreatingAdmin 
                  ? 'Set up the first administrator account'
                  : 'Sign in to access the admin portal (requires AI Administrator role for Microsoft login)'
                }
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 animate-stagger-children">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all text-white placeholder-slate-400 hover:border-slate-500/50"
                  placeholder="admin@company.com"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all text-white placeholder-slate-400 hover:border-slate-500/50"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-all duration-300 transform hover:scale-110"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Product Key (only for first admin) */}
              {isCreatingAdmin && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Product Key
                  </label>
                  <input
                    type="text"
                    value={productKey}
                    onChange={(e) => setProductKey(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all text-white placeholder-slate-400 hover:border-slate-500/50"
                    placeholder="Enter product key"
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Product key is required to create the first admin account
                  </p>
                </div>
              )}

              {/* Microsoft Login Error */}
              {socialLoginError && (
                <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-lg p-4 mb-4 animate-slide-in-left">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <span className="text-red-400 text-lg">⚠️</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-400">{socialLoginError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-lg p-3 animate-slide-in-left">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Microsoft Login Button */}
              <button
                type="button"
                onClick={handleMicrosoftAdminLogin}
                disabled={loading || isLoadingMicrosoft}
                className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 rounded-[30px] text-white font-medium py-3 px-4 transition-all duration-300 transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-2 shadow-lg hover:shadow-blue-500/20 mb-4"
              >
                {isLoadingMicrosoft ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span className="text-lg font-bold">⊞</span>
                    <span>Continue with Microsoft</span>
                  </>
                )}
              </button>

              {/* Role Requirement Info */}
              

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600/50"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-700/50 text-slate-400">Or continue with credentials</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || isLoadingMicrosoft}
                className="w-full bg-blue-600 hover:bg-blue-700 rounded-[30px] text-white py-3 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-105 animate-pulse-glow shadow-lg hover:shadow-blue-500/20"
              >
                {loading || isLoadingMicrosoft ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  isCreatingAdmin ? 'Create Admin Account' : 'Sign In'
                )}
              </button>
            </form>

            {/* Toggle between login and create admin */}
            <div className="mt-6 text-center animate-fade-in-up animation-delay-600">
              <button
                type="button"
                onClick={() => {
                  setIsCreatingAdmin(!isCreatingAdmin);
                  setError(null);
                  setEmail('');
                  setPassword('');
                  setProductKey('');
                }}
                className="text-sm text-slate-400 hover:text-white transition-all duration-300 transform hover:scale-110"
              >
                {isCreatingAdmin 
                  ? 'Already have admin credentials? Sign in'
                  : 'Need to create admin account?'
                }
              </button>
            </div>

            {/* Demo credentials info */}
            {!isCreatingAdmin && (
              <div className="mt-4 p-3 bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-600/30 animate-fade-in-up animation-delay-700">
                <p className="text-xs text-slate-400 text-center">
                  Demo: admin@alyasra.com / admin123
                </p>
              </div>
            )}

            {/* Product key info for admin creation */}
            {isCreatingAdmin && (
              <div className="mt-4 p-3 bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-600/30 animate-fade-in-up animation-delay-700">
                <p className="text-xs text-slate-400 text-center">
                  Product Key: AlyasraFashion
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;