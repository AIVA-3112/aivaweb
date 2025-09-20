import React, { useState } from 'react';
import { Shield, Zap, Users, ArrowRight, Link } from 'lucide-react';
import AIVAPresentation from './AIVAPresentation';

interface HomePageProps {
  user: any;
  onNavigateToLogin: () => void;
  onNavigateToSignUp: () => void;
  onNavigateToDashboard: (userData: any) => void;
}

const HomePage: React.FC<HomePageProps> = ({ user,onNavigateToLogin, onNavigateToSignUp, onNavigateToDashboard }) => {
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);

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
      <div className="relative z-10">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 lg:px-12 animate-fade-in">
        <div className="flex items-center space-x-2">
          <img src="/alyasra-logo.png" alt="Alyasra Logo" className="w-8 h-8 animate-pulse" />
          <span className="text-xl font-bold text-white tracking-wide hover:text-blue-400 transition-colors duration-300">AIVA</span>
        </div>
        {user ? (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <button 
              onClick={() => onNavigateToDashboard(user)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600/80 hover:bg-blue-700 rounded-lg transition-all duration-300 transform hover:scale-110 hover:shadow-lg animate-bounce-subtle"
            >
              Dashboard
            </button>
          </div>
        ) : (
          <button 
            onClick={onNavigateToLogin}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-300 transform hover:scale-110 hover:shadow-lg animate-bounce-subtle"
          >
            Login
          </button>
        )}
      </header>

      <div className="container mx-auto px-6 lg:px-12">
        {/* Hero Section */}
        <section className="text-center py-8 lg:py-12 animate-fade-in-up">
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 tracking-tight animate-slide-in-left">
            Empower Business Decisions with Conversational Intelligence
          </h1>
          
          <p className="text-lg lg:text-xl text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed animate-slide-in-right animation-delay-300">
            Ask. Analyze. Act. Alyasra IVA delivers real-time insights, forecasts, and recommendations—right from a secure chat.
          </p>
          
          <button 
            onClick={()=>{(user!==null)?onNavigateToDashboard(user):onNavigateToLogin()}}
            className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-110 shadow-xl hover:shadow-2xl animate-pulse-glow animation-delay-600"
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5 animate-bounce-x" />
          </button>
        </section>

        {/* Features Section */}
        <section className="py-8 lg:py-12">
          {/* Why Alyasra Section */}
          <div className="mb-16 lg:mb-24">
            <h2 className="text-3xl lg:text-4xl font-bold text-white text-center mb-12 animate-fade-in-up">
              Why AIVA?
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto animate-stagger-children">
              {/* Conversational BI, Not Just Chat */}
              <div className="bg-slate-700/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-600/50 hover:border-slate-500/50 transition-all duration-500 transform hover:-translate-y-4 hover:shadow-2xl hover:shadow-blue-500/20 animate-slide-in-left animation-delay-200">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl animate-bounce-subtle animation-delay-400">✅</div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">Conversational BI, Not Just Chat</h3>
                    <p className="text-slate-300 leading-relaxed">
                      Natural language queries for both simple data lookups and deep analytics.
                    </p>
                  </div>
                </div>
              </div>

              {/* Proactive Insights & Forecasts */}
              <div className="bg-slate-700/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-600/50 hover:border-slate-500/50 transition-all duration-500 transform hover:-translate-y-4 hover:shadow-2xl hover:shadow-green-500/20 animate-slide-in-right animation-delay-300">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl animate-bounce-subtle animation-delay-500">✅</div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">Proactive Insights & Forecasts</h3>
                    <p className="text-slate-300 leading-relaxed">
                      AI identifies patterns, anomalies, and trends before you even ask.
                    </p>
                  </div>
                </div>
              </div>

              {/* Enterprise-Ready & Secure */}
              <div className="bg-slate-700/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-600/50 hover:border-slate-500/50 transition-all duration-500 transform hover:-translate-y-4 hover:shadow-2xl hover:shadow-purple-500/20 animate-slide-in-left animation-delay-400">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl animate-bounce-subtle animation-delay-600">✅</div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">Enterprise-Ready & Secure</h3>
                    <p className="text-slate-300 leading-relaxed">
                      Built on Microsoft Fabric, secured with Entra ID, governed by RLS.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cross-Platform Access */}
              <div className="bg-slate-700/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-600/50 hover:border-slate-500/50 transition-all duration-500 transform hover:-translate-y-4 hover:shadow-2xl hover:shadow-orange-500/20 animate-slide-in-right animation-delay-500">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl animate-bounce-subtle animation-delay-700">✅</div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">Cross-Platform Access</h3>
                    <p className="text-slate-300 leading-relaxed">
                      Available on Microsoft Teams, Web, and Mobile—wherever you work.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* What Can You Ask Section */}
        <section className="pt-4 pb-8 lg:pt-6 lg:pb-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 animate-fade-in-up">
              💡 What Can You Ask?
            </h2>
            <p className="text-lg text-slate-300 mb-8 animate-fade-in-up animation-delay-200">
              Example Questions You Can Ask
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 animate-stagger-children">
              {/* Example Questions */}
              <div className="bg-slate-700/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-600/50 hover:border-blue-500/50 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/20 animate-slide-in-left animation-delay-300">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 animate-pulse">
                    <span className="text-white text-sm font-bold">?</span>
                  </div>
                  <p className="text-white font-medium text-lg">
                    "What are the top 5 performing stores this month?"
                  </p>
                </div>
              </div>
              
              <div className="bg-slate-700/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-600/50 hover:border-blue-500/50 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/20 animate-slide-in-right animation-delay-400">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 animate-pulse animation-delay-200">
                    <span className="text-white text-sm font-bold">?</span>
                  </div>
                  <p className="text-white font-medium text-lg">
                    "Show inventory levels compared to forecasts."
                  </p>
                </div>
              </div>
              
              <div className="bg-slate-700/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-600/50 hover:border-blue-500/50 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/20 animate-slide-in-left animation-delay-500">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 animate-pulse animation-delay-400">
                    <span className="text-white text-sm font-bold">?</span>
                  </div>
                  <p className="text-white font-medium text-lg">
                    "Why did footfall drop last weekend?"
                  </p>
                </div>
              </div>
              
              <div className="bg-slate-700/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-600/50 hover:border-blue-500/50 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/20 animate-slide-in-right animation-delay-600">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 animate-pulse animation-delay-600">
                    <span className="text-white text-sm font-bold">?</span>
                  </div>
                  <p className="text-white font-medium text-lg">
                    "Suggest a reorder strategy for low-stock items."
                  </p>
                </div>
              </div>
            </div>
            
            {/* Fifth question spanning full width */}
            <div className="mt-6">
              <div className="bg-slate-700/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-600/50 hover:border-blue-500/50 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/20 animate-fade-in-up animation-delay-700">
                <div className="flex items-start space-x-3 justify-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 animate-pulse animation-delay-800">
                    <span className="text-white text-sm font-bold">?</span>
                  </div>
                  <p className="text-white font-medium text-lg">
                    "Summarize Q3 performance in a report."
                  </p>
                </div>
              </div>
            </div>
            
            {/* Video/Animation Placeholder */}
            <div className="mt-12 text-center">
              <button
                onClick={() => setIsPresentationOpen(true)}
                className="bg-slate-700/30 backdrop-blur-sm p-8 rounded-2xl border border-slate-600/30 border-dashed animate-fade-in-up animation-delay-900 hover:bg-slate-700/50 hover:border-slate-500/50 transition-all duration-300 transform hover:scale-105 w-full"
              >
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <span className="text-4xl animate-bounce-subtle">🎥</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 animate-fade-in-up animation-delay-1000">
                  See AIVA in Action
                </h3>
                <p className="text-slate-300 animate-fade-in-up animation-delay-1100">
                  Watch how natural language queries transform into AI-generated insights and recommendations
                </p>
              </button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-8 lg:py-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 animate-fade-in-up">
              🧠 How It Works
            </h2>
            <p className="text-lg text-slate-300 animate-fade-in-up animation-delay-200">
              Simple 3-step process to get AI-powered business insights
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 animate-stagger-children">
              {/* Step 1: Ask */}
              <div className="text-center animate-slide-in-left animation-delay-300">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce-subtle">
                    <span className="text-3xl animate-pulse">💬</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm animate-pulse">
                    1
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Ask</h3>
                <p className="text-slate-300 text-lg leading-relaxed">
                  Use plain English in chat to ask business questions, request analyses, or seek recommendations
                </p>
              </div>
              
              {/* Step 2: Analyze */}
              <div className="text-center animate-fade-in-up animation-delay-500">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce-subtle animation-delay-200">
                    <span className="text-3xl animate-pulse animation-delay-200">⚡</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm animate-pulse animation-delay-200">
                    2
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Analyze</h3>
                <p className="text-slate-300 text-lg leading-relaxed">
                  AI + Microsoft Fabric process your request, accessing data securely and running advanced analytics
                </p>
              </div>
              
              {/* Step 3: Act */}
              <div className="text-center animate-slide-in-right animation-delay-700">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce-subtle animation-delay-400">
                    <span className="text-3xl animate-pulse animation-delay-400">📊</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm animate-pulse animation-delay-400">
                    3
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Act</h3>
                <p className="text-slate-300 text-lg leading-relaxed">
                  Receive actionable insights, forecasts, visualizations, and strategic suggestions in real-time
                </p>
              </div>
            </div>
            
            {/* Process Flow Arrows (Hidden on mobile) */}
            <div className="hidden md:block relative -mt-16 mb-8">
              <div className="flex justify-center items-center space-x-32 animate-fade-in animation-delay-1000">
                <ArrowRight className="w-8 h-8 text-slate-400 animate-bounce-x" />
                <ArrowRight className="w-8 h-8 text-slate-400 animate-bounce-x animation-delay-500" />
              </div>
            </div>
          </div>
        </section>

        {/* Chat Anywhere, Anytime Section */}
        <section className="py-8 lg:py-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              📱 Chat Anywhere, Anytime
            </h2>
            <p className="text-lg text-slate-300">
              Unified Experience Across Devices
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            {/* Platform Integration */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-slate-700/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-600/50 hover:border-slate-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🟢</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Microsoft Teams Integration</h3>
                <p className="text-slate-300 leading-relaxed">
                  Native integration with Microsoft Teams for seamless workplace collaboration
                </p>
              </div>
              
              <div className="bg-slate-700/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-600/50 hover:border-slate-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🟢</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Responsive Web App</h3>
                <p className="text-slate-300 leading-relaxed">
                  Full-featured web application accessible from any browser, anywhere
                </p>
              </div>
              
              <div className="bg-slate-700/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-600/50 hover:border-slate-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🟢</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Mobile App (iOS/Android)</h3>
                <p className="text-slate-300 leading-relaxed">
                  Native mobile apps for on-the-go access to your business insights
                </p>
              </div>
            </div>
            
            {/* Key Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-slate-700/30 backdrop-blur-sm p-6 rounded-xl border border-slate-600/30 text-center">
                <div className="text-2xl mb-3">✔️</div>
                <h4 className="text-lg font-semibold text-white mb-2">Persistent Chat</h4>
                <p className="text-slate-300 text-sm">
                  Your conversations sync across all devices seamlessly
                </p>
              </div>
              
              <div className="bg-slate-700/30 backdrop-blur-sm p-6 rounded-xl border border-slate-600/30 text-center">
                <div className="text-2xl mb-3">✔️</div>
                <h4 className="text-lg font-semibold text-white mb-2">Visualized Insights</h4>
                <p className="text-slate-300 text-sm">
                  Rich charts and graphs optimized for each platform
                </p>
              </div>
              
              <div className="bg-slate-700/30 backdrop-blur-sm p-6 rounded-xl border border-slate-600/30 text-center">
                <div className="text-2xl mb-3">✔️</div>
                <h4 className="text-lg font-semibold text-white mb-2">Offline Support</h4>
                <p className="text-slate-300 text-sm">
                  Access cached insights even when connectivity is limited
                </p>
              </div>
            </div>
            
            {/* Screenshots/Mockups Placeholder */}
            <div className="text-center">
              <div className="bg-slate-700/30 backdrop-blur-sm p-12 rounded-2xl border border-slate-600/30 border-dashed">
                <div className="grid md:grid-cols-3 gap-8 mb-6">
                  <div className="bg-slate-600/50 rounded-lg p-6 aspect-video flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl mb-2">💻</div>
                      <p className="text-white font-medium">Teams Integration</p>
                    </div>
                  </div>
                  <div className="bg-slate-600/50 rounded-lg p-6 aspect-video flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🌐</div>
                      <p className="text-white font-medium">Web Application</p>
                    </div>
                  </div>
                  <div className="bg-slate-600/50 rounded-lg p-6 aspect-video flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl mb-2">📱</div>
                      <p className="text-white font-medium">Mobile App</p>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  See AIVA Across All Platforms
                </h3>
                <p className="text-slate-300">
                  Screenshots and mockups showing AIVA's consistent experience on Teams, web, and mobile
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Security First Section */}
        <section className="py-8 lg:py-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              🔐 Security First
            </h2>
            <p className="text-lg text-slate-300">
              Enterprise-Grade Security & Compliance
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-700/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-600/50">
              <div className="flex items-center justify-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🛡️</span>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">✔️</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Role-based Access Control (RBAC)</h4>
                    <p className="text-slate-300 text-sm">
                      Granular permissions ensure users only access data they're authorized to see
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">✔️</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Row-Level Security (RLS)</h4>
                    <p className="text-slate-300 text-sm">
                      Data filtering at the database level protects sensitive information
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">✔️</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">End-to-End Encryption</h4>
                    <p className="text-slate-300 text-sm">
                      All data in transit and at rest is encrypted with industry-standard protocols
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">✔️</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Responsible AI Filters</h4>
                    <p className="text-slate-300 text-sm">
                      Built-in content filtering and bias detection for ethical AI responses
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 md:col-span-2 justify-center">
                  <div className="text-2xl">✔️</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">GDPR & HIPAA Compliant</h4>
                    <p className="text-slate-300 text-sm">
                      Full compliance with international data protection and healthcare privacy regulations
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-8 lg:py-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              🙋 Use Cases
            </h2>
            <p className="text-lg text-slate-300">
              Designed for Decision-Makers Across the Enterprise
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Finance */}
              <div className="bg-slate-700/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-600/50 hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Finance</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <p className="text-slate-300">Budget variance analysis</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <p className="text-slate-300">Cost forecasting</p>
                  </div>
                </div>
              </div>

              {/* Operations */}
              <div className="bg-slate-700/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-600/50 hover:border-green-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl">⚙️</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Operations</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <p className="text-slate-300">Inventory optimization</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <p className="text-slate-300">Restock suggestions</p>
                  </div>
                </div>
              </div>

              {/* HR */}
              <div className="bg-slate-700/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-600/50 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl">👥</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">HR</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    <p className="text-slate-300">Attrition trends</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    <p className="text-slate-300">Hiring recommendations</p>
                  </div>
                </div>
              </div>

              {/* Retail */}
              <div className="bg-slate-700/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-600/50 hover:border-orange-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl">🛍️</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Retail</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    <p className="text-slate-300">Sales performance</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    <p className="text-slate-300">Footfall pattern detection</p>
                  </div>
                </div>
              </div>

              {/* Executives */}
              <div className="bg-slate-700/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-600/50 hover:border-cyan-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl md:col-span-2 lg:col-span-1">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl">👔</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Executives</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></span>
                    <p className="text-slate-300">Narrative reports</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></span>
                    <p className="text-slate-300">KPI dashboards in chat</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted by the Enterprise Section */}
        <section className="py-8 lg:py-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              📊 Trusted by the Enterprise
            </h2>
            <p className="text-lg text-slate-300">
              Built on Microsoft's Data Stack
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            {/* Microsoft Stack Logos */}
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
              <div className="bg-slate-700/50 backdrop-blur-sm p-6 rounded-xl border border-slate-600/50 hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-sm">MS</span>
                </div>
                <h4 className="text-sm font-semibold text-white">Microsoft Fabric</h4>
              </div>
              
              <div className="bg-slate-700/50 backdrop-blur-sm p-6 rounded-xl border border-slate-600/50 hover:border-green-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl text-center">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <h4 className="text-sm font-semibold text-white">Azure OpenAI</h4>
              </div>
              
              <div className="bg-slate-700/50 backdrop-blur-sm p-6 rounded-xl border border-slate-600/50 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-sm">CS</span>
                </div>
                <h4 className="text-sm font-semibold text-white">Microsoft Copilot Studio</h4>
              </div>
              
              <div className="bg-slate-700/50 backdrop-blur-sm p-6 rounded-xl border border-slate-600/50 hover:border-orange-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl text-center">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-sm">ID</span>
                </div>
                <h4 className="text-sm font-semibold text-white">Microsoft Entra ID</h4>
              </div>
              
              <div className="bg-slate-700/50 backdrop-blur-sm p-6 rounded-xl border border-slate-600/50 hover:border-cyan-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl text-center">
                <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-sm">AM</span>
                </div>
                <h4 className="text-sm font-semibold text-white">Azure Monitor</h4>
              </div>
              
              <div className="bg-slate-700/50 backdrop-blur-sm p-6 rounded-xl border border-slate-600/50 hover:border-yellow-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl text-center">
                <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-sm">BI</span>
                </div>
                <h4 className="text-sm font-semibold text-white">Power BI</h4>
              </div>
            </div>
            
            {/* Enterprise Features */}
            <div className="bg-slate-700/30 backdrop-blur-sm p-8 rounded-2xl border border-slate-600/30">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🏆</span>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-white text-center mb-8">
                Enterprise-Grade Excellence
              </h3>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Performance</h4>
                  <p className="text-slate-300 text-sm">
                    Enterprise-grade performance with Microsoft's proven infrastructure
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Compliance</h4>
                  <p className="text-slate-300 text-sm">
                    GDPR, HIPAA compliant with comprehensive data governance
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">👁️</span>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Observability</h4>
                  <p className="text-slate-300 text-sm">
                    Complete monitoring and analytics with Azure's observability tools
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA Section */}
        <section className="text-center py-8 lg:py-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-8 animate-fade-in-up">
            Ready to transform your workflow?
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 animate-fade-in-up animation-delay-300">
            <button 
              onClick={onNavigateToLogin}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl animate-pulse-glow"
            >
              Sign In
            </button>
            <button 
              onClick={onNavigateToSignUp}
              className="px-8 py-3 border-2 border-slate-500 hover:border-slate-400 text-slate-300 hover:text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
            >
              Create Account
            </button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-6 animate-fade-in">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center text-sm text-slate-400">
            © 2024 AIVA. All rights reserved. | 
            <a href="#" className="hover:text-slate-300 transition-colors duration-300 ml-1 hover:underline">Terms of Service</a> | 
            <a href="#" className="hover:text-slate-300 transition-colors duration-300 ml-1 hover:underline">Privacy Policy</a>
          </div>
        </div>
      </footer>
      </div>
      
      {/* AIVA Presentation Modal */}
      <AIVAPresentation
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
      />
    </div>
  );
};

export default HomePage;