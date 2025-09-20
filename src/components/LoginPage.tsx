import React, { useState, useEffect } from 'react';
import { Link, Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { handleGoogleLogin, handleMicrosoftLogin, handleYahooLogin, createOAuthPopup, msalInstance, isLoggedInWithMicrosoft, getCurrentMicrosoftUser } from '../utils/auth';

interface LoginPageProps {
  onBack: () => void;
  onLoginSuccess: (user: any) => void;
  onNavigateToSignUp: () => void;
  onNavigateToHome: () => void;
  onNavigateToAdminLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onBack, onLoginSuccess, onNavigateToSignUp, onNavigateToHome, onNavigateToAdminLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [socialLoginError, setSocialLoginError] = useState<string | null>(null);
  
  // Initialize MSAL instance when component mounts
  useEffect(() => {
    const initializeMSAL = async () => {
      try {
        await msalInstance.initialize();
        
        // Check if there are any cached accounts
        if (isLoggedInWithMicrosoft()) {
          const user = getCurrentMicrosoftUser();
          if (user) {
            console.log('User already logged in with Microsoft:', user);
            // Optionally auto-login the user
            // onLoginSuccess({
            //   name: user.name,
            //   email: user.email,
            //   avatar: user.name ? user.name.substring(0, 2).toUpperCase() : 'MS'
            // });
          }
        }
      } catch (error) {
        console.error('MSAL initialization error:', error);
      }
    };
    
    initializeMSAL();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('local');
    setSocialLoginError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      // Check if response is ok first
      if (!response.ok) {
        // Try to parse JSON error response
        let errorMessage = 'Login failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      // Parse successful response
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Server returned invalid response. Please try again.');
      }
      
      // Store JWT token
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Prepare user data for the frontend
      const userData = {
        id: data.user.id,
        name: `${data.user.firstName} ${data.user.lastName}`.trim(),
        email: data.user.email,
        avatar: `${data.user.firstName.charAt(0)}${data.user.lastName.charAt(0)}`.toUpperCase(),
        provider: data.user.provider,
        role: data.user.role,
        tenantId: data.user.tenantId
      };
      
      onLoginSuccess(userData);
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        // Provide more specific error messages
        if (error.message.includes('Failed to fetch')) {
          setSocialLoginError('Unable to connect to the server. Please make sure the backend is running.');
        } else if (error.message.includes('Invalid email or password')) {
          setSocialLoginError('Invalid email or password. Please check your credentials and try again.');
        } else {
          setSocialLoginError(error.message);
        }
      } else {
        setSocialLoginError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(null);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'microsoft' | 'yahoo') => {
    setIsLoading(provider);
    setSocialLoginError(null); // Clear any existing error messages
    
    try {
      let user;
      
      console.log(`Starting ${provider} login...`);
      
      if (provider === 'microsoft') {
        // Use MSAL for Microsoft authentication
        const msalUser = await handleMicrosoftLogin();
        console.log(`${provider} login user data received:`, msalUser);
        
        // Send Microsoft user data to backend for validation and database storage
        try {
          const response = await fetch('/api/auth/microsoft/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: 'placeholder', // Backend expects a code parameter
              email: msalUser.email,
              name: msalUser.name,
              tenantId: msalUser.tenantId,
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
          localStorage.setItem('user', JSON.stringify(data.user));
          
          user = {
            id: data.user.id,
            name: data.user.firstName + ' ' + data.user.lastName,
            email: data.user.email,
            avatar: (data.user.firstName?.charAt(0) || '') + (data.user.lastName?.charAt(0) || ''),
            provider: 'microsoft',
            role: data.user.role,
            tenantId: data.user.tenantId
          };
        } catch (error) {
          console.error('Backend Microsoft auth error:', error);
          throw error;
        }
      } else {
        // Create popup synchronously with user click for other providers
        const popup = createOAuthPopup(`${provider}-login`);
        if (!popup) {
          setIsLoading(null);
          setSocialLoginError('Please allow pop-ups for this site and try again. Check your browser\'s address bar for a pop-up blocker icon.');
          return;
        }
        
        // Handle other providers
        switch (provider) {
          case 'google':
            user = await handleGoogleLogin(popup);
            break;
          case 'yahoo':
            user = await handleYahooLogin(popup);
            break;
        }
      }
      
      console.log(`${provider} login successful, processing user data:`, user);
      
      // Validate user data
      if (!user) {
        throw new Error('No user data received from authentication provider');
      }
      
      if (!user.email && !user.name) {
        throw new Error('Incomplete user information received. Please try again.');
      }
      
      // Navigate to dashboard on successful OAuth login
      const userData = {
        name: user?.name || user?.email?.split('@')[0] || 'User',
        email: user?.email || 'user@example.com',
        avatar: user?.name ? user.name.substring(0, 2).toUpperCase() : 'SU',
        provider: provider,
        tenantId: user?.tenantId
      };
      
      console.log('Calling onLoginSuccess with userData:', userData);
      onLoginSuccess(userData);
    } catch (error) {
      console.error(`${provider} login failed with error:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Set more specific error messages
      if (errorMessage.includes('Popup blocked') || errorMessage.includes('popup')) {
        setSocialLoginError('Please allow pop-ups for this site and try again. Check your browser\'s address bar for a pop-up blocker icon.');
      } else if (errorMessage.includes('cancelled')) {
        setSocialLoginError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login was cancelled.`);
      } else if (errorMessage.includes('consent_required')) {
        setSocialLoginError('Additional permissions required. Please contact your administrator.');
      } else if (errorMessage.includes('interaction_required')) {
        setSocialLoginError('User interaction required. Please try logging in again.');
      } else {
        setSocialLoginError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login failed: ${errorMessage}`);
      }
    } finally {
      setIsLoading(null);
    }
  };

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
          {/* Logo and Header */}
          <div className="text-center mb-8">
           <div onClick={onNavigateToHome} className="cursor-pointer mb-4">
            <div className="flex items-center justify-center mb-4">
              <img src="/alyasra-logo.png" alt="Alyasra Logo" className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">AIVA</h1>
            </div>
            <p className="text-slate-300">Welcome back! Please sign in to continue.</p>
          </div>

          {/* Login Form */}
          <div className="bg-slate-700/50 backdrop-blur-sm border border-slate-600/50 rounded-2xl shadow-2xl p-8 animate-slide-in-right animation-delay-300 hover:shadow-blue-500/20 transition-all duration-500">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Sign In</h2>
              <p className="text-slate-300">Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 animate-stagger-children">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all text-white placeholder-slate-400 hover:border-slate-500/50"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all text-white placeholder-slate-400 hover:border-slate-500/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-all duration-300 transform hover:scale-110"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-slate-800/50 border-slate-600/50 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-slate-300">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 rounded-[30px] text-white font-semibold py-3 px-4 transition-all duration-300 transform hover:scale-105 animate-pulse-glow shadow-lg hover:shadow-blue-500/20"
              >
                Sign In
              </button>

              {/* Admin Login Button */}
              <button
                type="button"
                onClick={onNavigateToAdminLogin}
                className="w-full bg-slate-600 hover:bg-slate-700 rounded-[30px] text-white font-semibold py-3 px-4 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-slate-500/20"
              >
                Admin Login
              </button>

              {/* Sign Up Link */}
              <div className="text-center">
                <span className="text-slate-300">Don't have an account? </span>
                <button
                  type="button"
                  onClick={onNavigateToSignUp}
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
                >
                  Sign up
                </button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600/50"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-700/50 text-slate-400">Or continue with</span>
                </div>
              </div>

              {/* Social Login Error */}
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

              {/* Social Login Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading !== null}
                  className="w-full bg-red-600 rounded-[30px] hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-3 px-4 transition-all duration-300 transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-2 shadow-lg hover:shadow-red-500/20"
                >
                  {isLoading === 'google' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span className="text-lg font-bold">G</span>
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => handleSocialLogin('microsoft')}
                  disabled={isLoading !== null}
                  className="w-full bg-blue-700 rounded-[30px] hover:bg-blue-800 disabled:bg-blue-400 text-white font-medium py-3 px-4 transition-all duration-300 transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-2 shadow-lg hover:shadow-blue-500/20"
                >
                  {isLoading === 'microsoft' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span className="text-lg font-bold">⊞</span>
                      <span>Continue with Microsoft</span>
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => handleSocialLogin('yahoo')}
                  disabled={isLoading !== null}
                  className="w-full bg-purple-600 rounded-[30px] hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-3 px-4 transition-all duration-300 transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-2 shadow-lg hover:shadow-purple-500/20"
                >
                  {isLoading === 'yahoo' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span className="text-lg font-bold">Y!</span>
                      <span>Continue with Yahoo</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Terms and Privacy */}
          <div className="text-center mt-6">
            <p className="text-sm text-slate-400">
              By signing in, you agree to our{' '}
              <button className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                Terms of Service
              </button>{' '}
              and{' '}
              <button className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                Privacy Policy
              </button>
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-4">
            <button
              onClick={onBack}
              className="text-slate-400 hover:text-slate-300 transition-colors duration-200 text-sm"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;