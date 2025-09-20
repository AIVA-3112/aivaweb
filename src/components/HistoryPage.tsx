import React, { useState } from 'react';
import { ArrowLeft, History, Search, Calendar, MessageSquare } from 'lucide-react';

interface ChatHistory {
  id: string;
  title: string;
  description: string;
  date: string;
  messageCount: number;
  lastMessage: string;
}

interface HistoryPageProps {
  onBack: () => void;
  chatHistory: ChatHistory[];
  onLoadChat: (chatId: string) => void;
  onNavigateToMessage: (messageId: string) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ onBack, chatHistory, onLoadChat, onNavigateToMessage }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter chat history based on search term
  const filteredHistory = chatHistory.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
  };

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
          <h1 className="text-4xl font-bold text-white">Chat History</h1>
        </div>

        {/* Chat History Section */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-xl">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <History className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Previous Conversations</h2>
              <p className="text-gray-600">Access your previous chat sessions and conversations</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search chat history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Chat History Items */}
          <div className="space-y-4">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {searchTerm ? 'No chat history found' : 'No chat history yet'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Start chatting to see your conversation history here'
                  }
                </p>
              </div>
            ) : (
              filteredHistory.map((chat) => (
                <div
                  key={chat.id}
                  className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors cursor-pointer border-l-4 border-purple-500"
                  onClick={() => onLoadChat(chat.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">{chat.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <MessageSquare className="w-4 h-4" />
                      <span>{chat.messageCount} messages</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{chat.description}</p>
                  
                  <div className="text-sm text-gray-500 mb-2">
                    <strong>Last message:</strong> {chat.lastMessage}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{formatDate(chat.date)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;