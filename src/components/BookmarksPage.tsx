import React, { useState } from 'react';
import { ArrowLeft, Bookmark, Search, Calendar } from 'lucide-react';

interface BookmarkedMessage {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
  category: 'Reports' | 'Documentation' | 'Process' | 'Templates' | 'Conversation';
}

interface BookmarksPageProps {
  onBack: () => void;
  bookmarkedMessages: BookmarkedMessage[];
  onNavigateToMessage: (messageId: string) => void;
}

const BookmarksPage: React.FC<BookmarksPageProps> = ({ onBack, bookmarkedMessages, onNavigateToMessage }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter bookmarked messages based on search term
  const filteredBookmarks = bookmarkedMessages.filter(bookmark =>
    bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bookmark.description.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-4xl font-bold text-white">Bookmarks</h1>
        </div>

        {/* Saved Items Section */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-xl">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <Bookmark className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Saved Items</h2>
              <p className="text-gray-600">Access your bookmarked conversations, resources, and important information</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Bookmarked Items */}
          <div className="space-y-4">
            {filteredBookmarks.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {searchTerm ? 'No bookmarks found' : 'No bookmarks yet'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Start bookmarking messages to see them here'
                  }
                </p>
              </div>
            ) : (
              filteredBookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => onNavigateToMessage(bookmark.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">{bookmark.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(bookmark.category)}`}>
                      {bookmark.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{bookmark.description}</p>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{bookmark.date}</span>
                    <span className="mx-2">•</span>
                    <span>{bookmark.type}</span>
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

export default BookmarksPage;