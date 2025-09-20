import React from 'react';
import { ArrowLeft, Target, Users, Globe, Award } from 'lucide-react';

interface AboutAIVAProps {
  onBack: () => void;
}

const AboutAIVA: React.FC<AboutAIVAProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-700 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="w-12 h-12 bg-slate-600 hover:bg-slate-500 rounded-full flex items-center justify-center text-white transition-colors mr-4"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-4xl font-bold text-white">About AIVA</h1>
        </div>

        {/* Why AIVA Section */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-xl">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Why AIVA?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Conversational BI, Not Just Chat */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">✅</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Conversational BI, Not Just Chat</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Natural language queries for both simple data lookups and deep analytics.
                  </p>
                </div>
              </div>
            </div>

            {/* Proactive Insights & Forecasts */}
            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">✅</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Proactive Insights & Forecasts</h3>
                  <p className="text-gray-600 leading-relaxed">
                    AI identifies patterns, anomalies, and trends before you even ask.
                  </p>
                </div>
              </div>
            </div>

            {/* Enterprise-Ready & Secure */}
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">✅</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Enterprise-Ready & Secure</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Built on Microsoft Fabric, secured with Entra ID, governed by RLS.
                  </p>
                </div>
              </div>
            </div>

            {/* Cross-Platform Access */}
            <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">✅</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Cross-Platform Access</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Available on Microsoft Teams, Web, and Mobile—wherever you work.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What Can You Ask and How It Works Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* What Can You Ask */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">💡 What Can You Ask?</h2>
            </div>
            <p className="text-gray-600 mb-6">Example Questions You Can Ask:</p>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs font-bold">?</span>
                  </div>
                  <p className="text-gray-800 font-medium">
                    "What are the top 5 performing stores this month?"
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs font-bold">?</span>
                  </div>
                  <p className="text-gray-800 font-medium">
                    "Show inventory levels compared to forecasts."
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs font-bold">?</span>
                  </div>
                  <p className="text-gray-800 font-medium">
                    "Why did footfall drop last weekend?"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">🧠 How It Works</h2>
            </div>
            <p className="text-gray-600 mb-6">Simple 3-step process to get AI-powered business insights:</p>
            <div className="space-y-6">
              {/* Step 1: Ask */}
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-xl">💬</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Ask</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Use plain English in chat to ask business questions, request analyses, or seek recommendations
                  </p>
                </div>
              </div>
              
              {/* Step 2: Analyze */}
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-xl">⚡</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Analyze</h3>
                  <p className="text-gray-600 leading-relaxed">
                    AI + Microsoft Fabric process your request, accessing data securely and running advanced analytics
                  </p>
                </div>
              </div>
              
              {/* Step 3: Act */}
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-xl">📊</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Act</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Receive actionable insights, forecasts, visualizations, and strategic suggestions in real-time
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose AIVA Section */}
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Why Choose AIVA?</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Enterprise Security */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Enterprise Security</h3>
              <p className="text-gray-600 leading-relaxed">
                Bank-level encryption and compliance with industry standards ensure your data and 
                communications remain secure.
              </p>
            </div>

            {/* Scalable Solutions */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Scalable Solutions</h3>
              <p className="text-gray-600 leading-relaxed">
                From small teams to enterprise organizations, AIVA scales with your 
                business needs and growth.
              </p>
            </div>

            {/* AI-Powered Insights */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">AI-Powered Insights</h3>
              <p className="text-gray-600 leading-relaxed">
                Leverage artificial intelligence to gain actionable insights and automate routine 
                tasks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutAIVA;