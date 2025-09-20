import React, { useState } from 'react';
import { ArrowLeft, ThumbsUp, Search, Calendar } from 'lucide-react';

interface LikedMessage {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
  category: 'Reports' | 'Documentation' | 'Process' | 'Templates' | 'Conversation';
}

interface LikedMessagesPageProps {
  onBack: () => void;
  likedMessages: LikedMessage[];
  onNavigateToMessage: (messageId: string) => void;
}

const LikedMessagesPage: React.FC<LikedMessagesPageProps> = ({ onBack, likedMessages, onNavigateToMessage }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter liked messages based on search term
  const filteredLikedMessages = likedMessages.filter(message =>
    message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Reports':
        return 'bg-blue-100 text-blue-800';
      case 'Documentation':
        return 'bg-green-100 text-green-800';
      case 'Process':
        return 'bg-purple-100 text-purple-800';
      case 'Templates':
        return 'bg-orange-100 text-orange-800';
      case 'Conversation':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
          <h1 className="text-4xl font-bold text-white">Liked Messages</h1>
        </div>

        {/* Liked Messages Section */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-xl">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <ThumbsUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Liked Messages</h2>
              <p className="text-gray-600">Messages you've liked and found helpful</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search liked messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Liked Messages */}
          <div className="space-y-4">
            {filteredLikedMessages.length === 0 ? (
              <div className="text-center py-12">
                <ThumbsUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {searchTerm ? 'No liked messages found' : 'No liked messages yet'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Start liking messages to see them here'
                  }
                </p>
              </div>
            ) : (
              filteredLikedMessages.map((message) => (
                <div
                  key={message.id}
                  className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors cursor-pointer border-l-4 border-green-500"
                  onClick={() => onNavigateToMessage(message.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">{message.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(message.category)}`}>
                      {message.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{message.description}</p>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{message.date}</span>
                    <span className="mx-2">•</span>
                    <span>{message.type}</span>
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

export default LikedMessagesPage;