import React, { useState, useEffect } from 'react';
import { feedbackAPI } from '../utils/api';
import { 
  MessageSquare, 
  Send, 
  Star,
  Bug,
  Lightbulb,
  Settings,
  AlertCircle,
  Heart,
  CheckCircle,
  Clock,
  User,
  Calendar,
  PanelLeft
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  adminResponse?: string;
  adminName?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface FeedbackPageProps {
  user?: any;
  onNavigateToDashboard: () => void;
}

const FeedbackPage: React.FC<FeedbackPageProps> = ({ user, onNavigateToDashboard }) => {
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'general',
    priority: 'medium'
  });
  const [submitting, setSubmitting] = useState(false);
  const [userFeedback, setUserFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'bug', label: 'Bug Report', icon: Bug, color: 'text-red-500' },
    { value: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'text-yellow-500' },
    { value: 'improvement', label: 'Improvement', icon: Settings, color: 'text-blue-500' },
    { value: 'complaint', label: 'Complaint', icon: AlertCircle, color: 'text-orange-500' },
    { value: 'compliment', label: 'Compliment', icon: Heart, color: 'text-pink-500' },
    { value: 'general', label: 'General Feedback', icon: MessageSquare, color: 'text-gray-500' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    if (activeTab === 'history') {
      fetchUserFeedback();
    }
  }, [activeTab]);

  const fetchUserFeedback = async () => {
    setLoading(true);
    try {
      const data = await feedbackAPI.getUserFeedback();
      setUserFeedback(data.feedback);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await feedbackAPI.submitFeedback(formData);
      
      setFormData({
        subject: '',
        message: '',
        category: 'general',
        priority: 'medium'
      });
      alert('Feedback submitted successfully! Thank you for your input.');
      // Refresh feedback history if on history tab
      if (activeTab === 'history') {
        fetchUserFeedback();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'in-progress':
        return <Settings className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Return to Dashboard Button */}
      <button
        onClick={onNavigateToDashboard}
        className="mb-4 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <PanelLeft className="h-4 w-4" />
        <span>Return to Dashboard</span>
      </button>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Feedback</h1>
        <p className="text-gray-600">
          Help us improve AIVA by sharing your thoughts, reporting issues, or suggesting new features.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('submit')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'submit'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Submit Feedback
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          My Feedback
        </button>
      </div>

      {activeTab === 'submit' ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Feedback Category
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                      className={`p-3 border rounded-lg flex items-center space-x-2 transition-colors ${
                        formData.category === category.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${category.color}`} />
                      <span className="font-medium">{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level
              </label>
              <div className="flex space-x-3">
                {priorities.map((priority) => (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, priority: priority.value }))}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                      formData.priority === priority.value
                        ? priority.color
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {priority.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief summary of your feedback"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Please provide detailed feedback..."
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-5 w-5" />
                <span>{submitting ? 'Submitting...' : 'Submit Feedback'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading your feedback...</p>
            </div>
          ) : userFeedback.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
              <p className="text-gray-500">Switch to the Submit tab to send your first feedback.</p>
            </div>
          ) : (
            userFeedback.map((feedback) => (
              <div key={feedback.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{feedback.subject}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                        {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        priorities.find(p => p.value === feedback.priority)?.color || 'bg-gray-100 text-gray-800'
                      }`}>
                        {feedback.priority.charAt(0).toUpperCase() + feedback.priority.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{feedback.message}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(feedback.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(feedback.status)}
                        <span className="capitalize">{feedback.status.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {feedback.adminResponse && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">
                        Admin Response {feedback.adminName && `by ${feedback.adminName}`}
                      </span>
                      {feedback.respondedAt && (
                        <span className="text-sm text-blue-600">
                          • {formatDate(feedback.respondedAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-blue-800">{feedback.adminResponse}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;