import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import SignUpPage from './components/SignUpPage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import OAuthCallback from './components/OAuthCallback';
import { handleMicrosoftLogout, isLoggedInWithMicrosoft } from './utils/auth';

function AppContent() {
  const [user, setUser] = useState<any>(null);
  const [admin, setAdmin] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const navigateToLogin = () => {
    navigate('/login');
  };

  const navigateToAdminLogin = () => {
    navigate('/admin-login');
  };

  const navigateToSignUp = () => {
    navigate('/signup');
  };

  const navigateToHome = async () => {
    // Handle Microsoft logout if user is logged in with Microsoft
    if (isLoggedInWithMicrosoft()) {
      try {
        await handleMicrosoftLogout();
        console.log('Microsoft logout successful');
      } catch (error) {
        console.error('Microsoft logout error:', error);
        // Continue with regular logout even if Microsoft logout fails
      }
    }
    
    setUser(null);
    // Remove JWT token from localStorage
    localStorage.removeItem('authToken');
    navigate('/');
  };
  
  const navigateHome = (userData: any) => {
    navigate('/');
    setUser(userData);
  };
  
  const navigateToDashboard = (userData: any) => {
    setUser(userData);
    navigate('/dashboard');
  };

  const navigateToAdminDashboard = (adminData: any) => {
    setAdmin(adminData);
    navigate('/admin-dashboard');
  };

  return (
    <>
      <Routes>
      <Route path="/" element={
        <HomePage 
          user={user}
          onNavigateToLogin={navigateToLogin}
          onNavigateToSignUp={navigateToSignUp}
          onNavigateToDashboard={navigateToDashboard}
        />
      } />
      <Route path="/login" element={
        <LoginPage 
          onBack={navigateToHome}
          onLoginSuccess={navigateToDashboard}
          onNavigateToSignUp={navigateToSignUp}
          onNavigateToHome={navigateToHome}
          onNavigateToAdminLogin={navigateToAdminLogin}
        />
      } />
      <Route path="/admin-login" element={
        <AdminLogin 
          onBack={navigateToLogin}
          onAdminLoginSuccess={navigateToAdminDashboard}
        />
      } />
      <Route path="/admin-dashboard" element={
        admin ? (
          <AdminDashboard 
            admin={admin}
            onLogout={() => {
              setAdmin(null);
              localStorage.removeItem('adminToken');
              navigate('/');
            }}
          />
        ) : (
          <Navigate to="/admin-login" replace />
        )
      } />
      <Route path="/signup" element={
        <SignUpPage 
          onBack={navigateToHome} 
          onSignUpSuccess={navigateToDashboard}
          onNavigateToLogin={navigateToLogin}
          onNavigateToHome={navigateToHome}
        />
      } />
      <Route path="/dashboard" element={
        user ? (
          <Dashboard 
            onLogout={navigateToHome} 
            user={user}
            onSwitchAccount={navigateToLogin}
            onNavigateToHome={navigateToHome}
            onNavigateHome={navigateHome}
            onNavigateToDashboard={navigateToDashboard}
          />
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      <Route path="/auth/microsoft/callback" element={<OAuthCallback provider="microsoft" />} />
      <Route path="/auth/google/callback" element={<OAuthCallback provider="google" />} />
      <Route path="/auth/yahoo/callback" element={<OAuthCallback provider="yahoo" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;