import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  Calendar, 
  User, 
  Star,
  Bug,
  Lightbulb,
  Settings,
  AlertCircle,
  Heart,
  CheckCircle,
  Clock,
  Eye,
  RefreshCw,
  Filter,
  Reply
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
  userId: string;
  userName?: string;
  userEmail?: string;
}

const FeedbackManagement: React.FC = () => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [responseText, setResponseText] = useState('');
  const [responding, setResponding] = useState(false);

  const categories = [
    { value: 'bug', label: 'Bug Report', icon: Bug, color: 'text-red-500' },
    { value: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'text-yellow-500' },
    { value: 'improvement', label: 'Improvement', icon: Settings, color: 'text-blue-500' },
    { value: 'complaint', label: 'Complaint', icon: AlertCircle, color: 'text-orange-500' },
    { value: 'compliment', label: 'Compliment', icon: Heart, color: 'text-pink-500' },
    { value: 'general', label: 'General', icon: MessageSquare, color: 'text-gray-500' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
  ];

  const statuses = [
    { value: 'open', label: 'Open', color: 'bg-blue-100 text-blue-800' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-800' },
    { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800' }
  ];

  useEffect(() => {
    fetchFeedback();
  }, [currentPage, searchTerm, filterStatus, filterCategory]);

  const fetchFeedback = async () => {
    setLoading(true);
    
    // Mock data for demonstration
    const mockFeedback: FeedbackItem[] = [
      {
        id: '1',
        subject: 'Chat interface improvement suggestion',
        message: 'I think the chat interface could be improved by adding dark mode support and better message formatting options.',
        category: 'improvement',
        priority: 'medium',
        status: 'open',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        userId: 'user-1',
        userName: 'John Smith',
        userEmail: 'john.smith@company.com'
      },
      {
        id: '2',
        subject: 'Bug: Message not sending',
        message: 'Sometimes when I try to send a message, it gets stuck in "sending" state and never actually sends. This happens about 20% of the time.',
        category: 'bug',
        priority: 'high',
        status: 'in-progress',
        adminResponse: 'Thank you for reporting this issue. We are investigating the root cause and will deploy a fix soon.',
        adminName: 'Admin User',
        respondedAt: '2024-01-14T16:45:00Z',
        createdAt: '2024-01-14T15:45:00Z',
        updatedAt: '2024-01-14T16:45:00Z',
        userId: 'user-2',
        userName: 'Sarah Johnson',
        userEmail: 'sarah.j@company.com'
      },
      {
        id: '3',
        subject: 'Love the new data visualization feature!',
        message: 'The new data visualization feature is amazing! It has made my work so much easier. Thank you for this great addition.',
        category: 'compliment',
        priority: 'low',
        status: 'resolved',
        adminResponse: 'Thank you for the positive feedback! We\'re glad you\'re enjoying the new feature.',
        adminName: 'Admin User',
        respondedAt: '2024-01-13T10:15:00Z',
        createdAt: '2024-01-13T09:15:00Z',
        updatedAt: '2024-01-13T10:15:00Z',
        userId: 'user-3',
        userName: 'Mike Davis',
        userEmail: 'mike.davis@company.com'
      }
    ];

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        status: filterStatus !== 'all' ? filterStatus : '',
        category: filterCategory !== 'all' ? filterCategory : ''
      });

      const response = await fetch(`/api/admin/feedback?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-admin-email': 'admin@aiva.com'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback || mockFeedback);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        // Apply filters to mock data
        let filteredFeedback = mockFeedback;
        
        if (searchTerm) {
          filteredFeedback = filteredFeedback.filter(item =>
            item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.userName?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        if (filterStatus !== 'all') {
          filteredFeedback = filteredFeedback.filter(item => item.status === filterStatus);
        }
        
        if (filterCategory !== 'all') {
          filteredFeedback = filteredFeedback.filter(item => item.category === filterCategory);
        }
        
        setFeedback(filteredFeedback);
        setTotalPages(Math.ceil(filteredFeedback.length / 10));
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setFeedback(mockFeedback);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!selectedFeedback || !responseText.trim()) return;

    setResponding(true);
    try {
      const response = await fetch(`/api/admin/feedback/${selectedFeedback.id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-admin-email': 'admin@aiva.com'
        },
        body: JSON.stringify({
          response: responseText,
          status: 'resolved'
        })
      });

      if (response.ok) {
        setResponseText('');
        setSelectedFeedback(null);
        fetchFeedback(); // Refresh the list
        alert('Response sent successfully!');
      } else {
        alert('Failed to send response. Please try again.');
      }
    } catch (error) {
      console.error('Error responding to feedback:', error);
      alert('Failed to send response. Please try again.');
    } finally {
      setResponding(false);
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

  const getCategoryIcon = (category: string) => {
    const categoryConfig = categories.find(c => c.value === category);
    if (!categoryConfig) return <MessageSquare className="h-4 w-4 text-gray-500" />;
    
    const Icon = categoryConfig.icon;
    return <Icon className={`h-4 w-4 ${categoryConfig.color}`} />;
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

  const getStatusColor = (status: string) => {
    return statuses.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    return priorities.find(p => p.value === priority)?.color || 'bg-gray-100 text-gray-800';
  };

  // Calculate stats
  const stats = {
    total: feedback.length,
    open: feedback.filter(f => f.status === 'open').length,
    inProgress: feedback.filter(f => f.status === 'in-progress').length,
    resolved: feedback.filter(f => f.status === 'resolved').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">User Feedback</h2>
            <p className="text-sm text-gray-600">Manage and respond to user feedback</p>
          </div>
        </div>
        <button
          onClick={fetchFeedback}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-600">Total Feedback</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium text-gray-600">Open</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.open}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-600">In Progress</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.inProgress}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-gray-600">Resolved</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.resolved}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          {statuses.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category.value} value={category.value}>{category.label}</option>
          ))}
        </select>
      </div>

      {/* Feedback List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading feedback...</p>
          </div>
        ) : feedback.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all' || filterCategory !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'No user feedback received yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {feedback.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{item.subject}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('-', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{item.message}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{item.userName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getCategoryIcon(item.category)}
                        <span>{categories.find(c => c.value === item.category)?.label}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(item.status)}
                        <span>{item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedFeedback(item)}
                      className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    {!item.adminResponse && (
                      <button
                        onClick={() => {
                          setSelectedFeedback(item);
                          setResponseText('');
                        }}
                        className="flex items-center space-x-2 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Reply className="h-4 w-4" />
                        <span>Respond</span>
                      </button>
                    )}
                  </div>
                </div>
                
                {item.adminResponse && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <div className="flex items-center space-x-2 mb-1">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Admin Response</span>
                      {item.respondedAt && (
                        <span className="text-sm text-blue-600">
                          • {formatDate(item.respondedAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-blue-800">{item.adminResponse}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 rounded-lg ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } transition-colors`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Feedback Details</h3>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                  <p className="text-gray-900">{selectedFeedback.userName} ({selectedFeedback.userEmail})</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Submitted</label>
                  <p className="text-gray-900">{formatDate(selectedFeedback.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(selectedFeedback.category)}
                    <span className="text-gray-900">{categories.find(c => c.value === selectedFeedback.category)?.label}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedFeedback.priority)}`}>
                    {selectedFeedback.priority.charAt(0).toUpperCase() + selectedFeedback.priority.slice(1)}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <p className="text-gray-900">{selectedFeedback.subject}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedFeedback.message}</p>
                </div>
              </div>
              
              {selectedFeedback.adminResponse ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Response</label>
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                    <p className="text-blue-900">{selectedFeedback.adminResponse}</p>
                    {selectedFeedback.respondedAt && (
                      <p className="text-sm text-blue-600 mt-2">
                        Responded on {formatDate(selectedFeedback.respondedAt)}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Response</label>
                  <textarea
                    rows={4}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Type your response..."
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleRespond}
                      disabled={responding || !responseText.trim()}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Reply className="h-4 w-4" />
                      <span>{responding ? 'Sending...' : 'Send Response'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement;