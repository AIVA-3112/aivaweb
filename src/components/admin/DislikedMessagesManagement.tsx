import React, { useState, useEffect } from 'react';
import { 
  ThumbsDown, 
  Search, 
  Calendar, 
  User, 
  MessageSquare,
  Eye,
  RefreshCw,
  Filter
} from 'lucide-react';

interface DislikedMessage {
  id: string;
  title: string;
  description: string;
  content: string;
  date: string;
  type: string;
  category: string;
  chatId: string;
  userName: string;
  userEmail: string;
}

const DislikedMessagesManagement: React.FC = () => {
  const [messages, setMessages] = useState<DislikedMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState<DislikedMessage | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    fetchDislikedMessages();
  }, [currentPage, searchTerm]);

  const fetchDislikedMessages = async () => {
    setLoading(true);
    
    // Mock data fallback
    const mockMessages: DislikedMessage[] = [
        {
          id: '1',
          title: 'How to analyze sales data?',
          description: 'The AI response was not helpful for understanding sales trends...',
          content: 'The AI provided generic advice instead of specific data analysis steps for sales metrics. Users expected more actionable insights about interpreting sales performance data.',
          date: '2024-01-15T10:30:00Z',
          type: 'assistant',
          category: 'Data Analysis',
          chatId: 'chat-001',
          userName: 'John Smith',
          userEmail: 'john.smith@company.com'
        },
        {
          id: '2',
          title: 'Customer retention strategies',
          description: 'Response lacked specific implementation details...',
          content: 'The AI gave broad customer retention concepts but failed to provide concrete, actionable strategies that could be implemented immediately.',
          date: '2024-01-14T15:45:00Z',
          type: 'assistant',
          category: 'Business Strategy',
          chatId: 'chat-002',
          userName: 'Sarah Johnson',
          userEmail: 'sarah.j@company.com'
        },
        {
          id: '3',
          title: 'Database optimization tips',
          description: 'Technical recommendations were too generic...',
          content: 'The AI provided database optimization advice that was too general and not specific to our SQL Server environment and performance issues.',
          date: '2024-01-13T09:15:00Z',
          type: 'assistant',
          category: 'Technical',
          chatId: 'chat-003',
          userName: 'Mike Davis',
          userEmail: 'mike.davis@company.com'
        }
    ];

    try {
      const response = await fetch(`/api/admin/disliked-messages?page=${currentPage}&limit=10&search=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-admin-email': 'admin@aiva.com'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || mockMessages);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        // Fallback to mock data if API fails
        setMessages(mockMessages);
      }
    } catch (error) {
      console.error('Error fetching disliked messages:', error);
      // Filter based on search term for mock data
      const filteredMessages = mockMessages.filter(msg =>
        msg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setMessages(filteredMessages);
      setTotalPages(Math.ceil(filteredMessages.length / 10));
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Data Analysis':
        return 'bg-blue-100 text-blue-800';
      case 'Business Strategy':
        return 'bg-green-100 text-green-800';
      case 'Technical':
        return 'bg-purple-100 text-purple-800';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <ThumbsDown className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Disliked Messages</h2>
            <p className="text-sm text-gray-600">Review and analyze user feedback on AI responses</p>
          </div>
        </div>
        <button
          onClick={fetchDislikedMessages}
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
            <ThumbsDown className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium text-gray-600">Total Dislikes</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{messages.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-600">This Week</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">12</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-gray-600">Unique Users</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">8</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-600">Avg per Day</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">3.2</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages, users, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="h-4 w-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading disliked messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center">
            <ThumbsDown className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No disliked messages found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'All AI responses are performing well!'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {messages.map((message) => (
              <div key={message.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{message.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(message.category)}`}>
                        {message.category}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{message.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{message.userName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(message.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{message.type === 'assistant' ? 'AI Response' : 'User Message'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedMessage(message)}
                    className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                </div>
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

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Message Details</h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                <p className="text-gray-900">{selectedMessage.userName} ({selectedMessage.userEmail})</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chat Title</label>
                <p className="text-gray-900">{selectedMessage.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Disliked</label>
                <p className="text-gray-900">{formatDate(selectedMessage.date)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Content</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  View Full Chat
                </button>
                <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Mark as Reviewed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DislikedMessagesManagement;