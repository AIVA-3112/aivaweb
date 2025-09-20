import React, { useState } from 'react';
import { Link, Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';
import { handleGoogleLogin, handleMicrosoftLogin, handleYahooLogin, createOAuthPopup } from '../utils/auth';

interface SignUpPageProps {
  onBack: () => void;
  onSignUpSuccess: (user: any) => void;
  onNavigateToLogin: () => void;
  onNavigateToHome: () => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onBack, onSignUpSuccess, onNavigateToLogin, onNavigateToHome }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [socialLoginError, setSocialLoginError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('local');
    setSocialLoginError(null);
    
    if (formData.password !== formData.confirmPassword) {
      setSocialLoginError('Passwords do not match');
      setIsLoading(null);
      return;
    }
    if (!agreeToTerms) {
      setSocialLoginError('Please agree to the Terms of Service and Privacy Policy');
      setIsLoading(null);
      return;
    }
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const data = await response.json();
      
      // Store JWT token
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Prepare user data for the frontend
      const userData = {
        id: data.user.id,
        name: `${data.user.firstName} ${data.user.lastName}`,
        email: data.user.email,
        avatar: data.user.firstName.charAt(0).toUpperCase() + data.user.lastName.charAt(0).toUpperCase(),
        provider: data.user.provider,
        role: data.user.role
      };
      
      onSignUpSuccess(userData);
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        setSocialLoginError(error.message);
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
      
      if (provider === 'microsoft') {
        // Use MSAL for Microsoft authentication (no popup parameter needed)
        user = await handleMicrosoftLogin();
      } else {
        // Create popup synchronously with user click for other providers
        const popup = createOAuthPopup(`${provider}-signup`);
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
      
      console.log(`${provider} signup successful:`, user);
      // Navigate to dashboard on successful OAuth signup
      const userData = {
        name: user?.name || 'New User',
        email: user?.email || 'user@example.com',
        avatar: user?.name ? user.name.substring(0, 2).toUpperCase() : 'NU'
      };
      onSignUpSuccess(userData);
    } catch (error) {
      console.error(`${provider} signup failed:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('Popup blocked') || errorMessage.includes('popup')) {
        setSocialLoginError('Please allow pop-ups for this site and try again. Check your browser\'s address bar for a pop-up blocker icon.');
      } else if (errorMessage.includes('cancelled')) {
        setSocialLoginError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} signup was cancelled.`);
      } else {
        setSocialLoginError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} signup failed. Please try again.`);
      }
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4" onClick={onNavigateToHome}>
            <img src="/alyasra-logo.png" alt="Alyasra Logo" className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">AIVA</h1>
          <p className="text-slate-300">Create your account to get started.</p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h2>
            <p className="text-gray-600">Fill in your details to create your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-1"
                required
              />
              <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <button type="button" className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
                  Privacy Policy
                </button>
              </label>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isLoading === 'local'}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              {isLoading === 'local' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Create Account'
              )}
            </button>

            {/* Sign In Link */}
            <div className="text-center">
              <span className="text-gray-600">Already have an account? </span>
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
              >
                Sign in
              </button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>

            {/* Social Login Error */}
            {socialLoginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="text-red-400 text-lg">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{socialLoginError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Social Sign Up Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading !== null}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-2"
              >
                {isLoading === 'google' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span className="text-lg font-bold">G</span>
                    <span>Sign up with Google</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => handleSocialLogin('microsoft')}
                disabled={isLoading !== null}
                className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-2"
              >
                {isLoading === 'microsoft' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span className="text-lg font-bold">⊞</span>
                    <span>Sign up with Microsoft</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => handleSocialLogin('yahoo')}
                disabled={isLoading !== null}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-2"
              >
                {isLoading === 'yahoo' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span className="text-lg font-bold">Y!</span>
                    <span>Sign up with Yahoo</span>
                  </>
                )}
              </button>
            </div>
          </form>
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
  );
};

export default SignUpPage;