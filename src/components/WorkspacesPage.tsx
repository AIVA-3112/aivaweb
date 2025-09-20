import React, { useState } from 'react';
import { ArrowLeft, Plus, Folder, Search, Calendar, MessageSquare, Edit2, Trash2, Users } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  description: string;
  color: string;
  createdDate: string;
  chatCount: number;
  lastActivity: string;
  isShared: boolean;
}

interface WorkspacesPageProps {
  onBack: () => void;
  workspaces: Workspace[];
  onSelectWorkspace: (workspaceId: string) => void;
}

const WorkspacesPage: React.FC<WorkspacesPageProps> = ({ 
  onBack, 
  workspaces, 
  onSelectWorkspace
}) => {
  const [searchTerm, setSearchTerm] = useState('');


  // Filter workspaces based on search term
  const filteredWorkspaces = workspaces.filter(workspace =>
    workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workspace.description.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="w-12 h-12 bg-slate-600 hover:bg-slate-500 rounded-full flex items-center justify-center text-white transition-colors mr-4"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-4xl font-bold text-white">Workspaces</h1>
          </div>
          
        </div>

        {/* Workspaces Section */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-xl">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <Folder className="w-6 h-6 text-blue-600" />
            </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Available Workspaces</h2>
                <p className="text-gray-600">Select a workspace to organize your conversations</p>
              </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search workspaces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Workspaces Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkspaces.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {searchTerm ? 'No workspaces found' : 'No workspaces available'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Contact your administrator to create workspaces'
                  }
                </p>
              </div>
            ) : (
              filteredWorkspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors cursor-pointer border-l-4 group"
                  style={{ borderLeftColor: workspace.color }}
                  onClick={() => onSelectWorkspace(workspace.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: workspace.color }}
                      >
                        <Folder className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{workspace.name}</h3>
                        {workspace.isShared && (
                          <div className="flex items-center space-x-1 text-sm text-blue-600">
                            <Users className="w-3 h-3" />
                            <span>Shared</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 text-sm">{workspace.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{workspace.chatCount} chats</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(workspace.lastActivity)}</span>
                      </div>
                    </div>
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

export default WorkspacesPage;