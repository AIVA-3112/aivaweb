import React, { useState, useEffect } from 'react';
import { X, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

interface PresentationSlide {
  id: number;
  title: string;
  description: string;
  features: string[];
  imagePlaceholder: string;
}

interface AIVAPresentationProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIVAPresentation: React.FC<AIVAPresentationProps> = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const slides: PresentationSlide[] = [
    {
      id: 1,
      title: "Chat Interface - Your AI Business Assistant",
      description: "Experience natural conversations with your data through our intelligent chat interface.",
      features: [
        "Natural language queries for complex business questions",
        "Real-time data analysis and insights",
        "Contextual conversations that remember your previous questions",
        "Smart suggestions for follow-up queries"
      ],
      imagePlaceholder: "/src/components/assets/chat_interface.png"
    },
    {
      id: 2,
      title: "Secure Login & User Management",
      description: "Securely manage user access and roles with our robust authentication system.",
      features: [
        " Secure Sign in with OAuth2 and SSO options",
        "User creation and role-based access control",
        "Password recovery and multi-factor authentication",
        " Audit logs for user activities"
      ],
      imagePlaceholder: "/src/components/assets/securlogin.png"
    },
    {
      id: 3,
      title: "Data Query Panel - Advanced Analytics",
      description: "Dive deep into your data with powerful querying capabilities and advanced filtering options.",
      features: [
        "SQL-like query builder with visual interface",
        "Advanced filtering and sorting options",
        "Custom report generation and scheduling",
        "Data export capabilities in multiple formats"
      ],
      imagePlaceholder: "/src/components/assets/data_query_panel.png"
    },
    {
      id: 4,
      title: "Workspaces - Organized Collaboration",
      description: "Create dedicated workspaces for different teams, projects, or business units.",
      features: [
        "Team-based workspace organization",
        "Shared dashboards and reports",
        "Role-based access control and permissions",
        "Collaborative annotations and comments"
      ],
      imagePlaceholder: "/src/components/assets/workspaces.png"
    },
    {
      id: 5,
      title: "History & Bookmarks - Never Lose Important Insights",
      description: "Keep track of your important conversations and bookmark key insights for future reference.",
      features: [
        "Complete chat history with search functionality",
        "Bookmark important queries and results",
        "Tag and categorize conversations",
        "Quick access to frequently used analyses"
      ],
      imagePlaceholder: "/src/components/assets/chathistory.png"
    },
    {
      id: 6,
      title: "Organizational Admin - Centralized Control",
      description: "Manage your organization’s settings, users, and data sources from a centralized admin panel.",
      features: [
        " Organization-wide settings and configurations",
        " User and role management",
        " Data source integrations and monitoring",
        " Audit logs and activity tracking"
      ],
      imagePlaceholder: "/src/components/assets/adminportal.png"
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || !isOpen) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isPlaying, isOpen, slides.length]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const nextSlide = () => {
    setIsPlaying(false); // Pause auto-play when user manually navigates
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setIsPlaying(false); // Pause auto-play when user manually navigates
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setIsPlaying(false); // Pause auto-play when user manually navigates
    setCurrentSlide(index);
  };

  if (!isOpen) return null;

  const currentSlideData = slides[currentSlide];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <button
              onClick={togglePlayPause}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-1" />
              )}
            </button>
            <h2 className="text-2xl font-bold text-white">AIVA Feature Presentation</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Slide Counter */}
          <div className="text-center mb-6">
            <span className="inline-block px-4 py-2 bg-blue-600/20 text-blue-300 rounded-full text-sm font-medium">
              {currentSlide + 1} of {slides.length}
            </span>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Image Section */}
            <img src={currentSlideData.imagePlaceholder} alt="🖼️" />


            {/* Content Section */}
            <div className="order-1 lg:order-2">
              <h3 className="text-3xl font-bold text-white mb-4 animate-slide-in-right">
                {currentSlideData.title}
              </h3>
              <p className="text-lg text-slate-300 mb-6 leading-relaxed animate-fade-in animation-delay-200">
                {currentSlideData.description}
              </p>

              {/* Features List */}
              <div className="space-y-3 animate-stagger-children">
                {currentSlideData.features.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-start space-x-3 animate-slide-in-left"
                    style={{ animationDelay: `${(index + 1) * 100}ms` }}
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-slate-300">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {/* Previous Button */}
            <button
              onClick={prevSlide}
              className="flex items-center space-x-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>

            {/* Slide Indicators */}
            <div className="flex items-center space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide 
                      ? 'bg-blue-500' 
                      : 'bg-slate-600 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={nextSlide}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIVAPresentation;
