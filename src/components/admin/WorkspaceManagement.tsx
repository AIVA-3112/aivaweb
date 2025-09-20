import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Folder, 
  Search, 
  Calendar, 
  MessageSquare, 
  Edit2, 
  Trash2, 
  Users,
  Save,
  X
} from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  description: string;
  color: string;
  createdDate: string;
  chatCount: number;
  lastActivity: string;
  isShared: boolean;
  assignedUsers?: User[];
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  isAssigned: boolean;
  accessLevel?: string;
  assignedAt?: string;
}

const WorkspaceManagement: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    isShared: false
  });

  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
  ];

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      // This would be an API call to fetch workspaces
      // For now, using mock data
      const mockWorkspaces: Workspace[] = [
        {
          id: '1',
          name: 'Marketing Campaign',
          description: 'Digital marketing strategies and campaigns',
          color: '#3B82F6',
          createdDate: '2024-01-15',
          chatCount: 12,
          lastActivity: '2024-01-20',
          isShared: true
        },
        {
          id: '2',
          name: 'Product Development',
          description: 'Product roadmap and development discussions',
          color: '#10B981',
          createdDate: '2024-01-10',
          chatCount: 8,
          lastActivity: '2024-01-19',
          isShared: false
        }
      ];
      
      setTimeout(() => {
        setWorkspaces(mockWorkspaces);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load workspaces:', error);
      setLoading(false);
    }
  };

  const loadAvailableUsers = async (workspaceId: string) => {
    try {
      setUsersLoading(true);
      // This would be an API call to fetch available users
      // For now, using mock data
      const mockUsers: User[] = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@company.com',
          isActive: true,
          isAssigned: false
        },
        {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@company.com',
          isActive: true,
          isAssigned: true,
          accessLevel: 'member',
          assignedAt: '2024-01-15'
        }
      ];
      
      setTimeout(() => {
        setAvailableUsers(mockUsers);
        setUsersLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const filteredWorkspaces = workspaces.filter(workspace =>
    workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workspace.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspace.name.trim()) return;
    
    const newWs: Workspace = {
      id: Date.now().toString(),
      ...newWorkspace,
      createdDate: new Date().toISOString().split('T')[0],
      chatCount: 0,
      lastActivity: new Date().toISOString().split('T')[0]
    };
    
    setWorkspaces(prev => [...prev, newWs]);
    setNewWorkspace({
      name: '',
      description: '',
      color: '#3B82F6',
      isShared: false
    });
    setShowCreateModal(false);
  };

  const handleEditWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkspace || !editingWorkspace.name.trim()) return;
    
    setWorkspaces(prev => 
      prev.map(ws => 
        ws.id === editingWorkspace.id 
          ? { ...ws, ...editingWorkspace }
          : ws
      )
    );
    setEditingWorkspace(null);
  };

  const handleDeleteWorkspace = (id: string) => {
    if (confirm('Are you sure you want to delete this workspace? This action cannot be undone.')) {
      setWorkspaces(prev => prev.filter(ws => ws.id !== id));
    }
  };

  const handleManageUsers = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setShowUsersModal(true);
    loadAvailableUsers(workspace.id);
  };

  const handleAssignUsers = async (userIds: string[]) => {
    if (!selectedWorkspace) return;
    
    try {
      // This would be an API call to assign users
      console.log('Assigning users to workspace:', { workspaceId: selectedWorkspace.id, userIds });
      
      // Update local state
      setAvailableUsers(prev => 
        prev.map(user => 
          userIds.includes(user.id) 
            ? { ...user, isAssigned: true, accessLevel: 'member', assignedAt: new Date().toISOString() }
            : user
        )
      );
    } catch (error) {
      console.error('Failed to assign users:', error);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!selectedWorkspace) return;
    
    try {
      // This would be an API call to remove user
      console.log('Removing user from workspace:', { workspaceId: selectedWorkspace.id, userId });
      
      // Update local state
      setAvailableUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, isAssigned: false, accessLevel: undefined, assignedAt: undefined }
            : user
        )
      );
    } catch (error) {
      console.error('Failed to remove user:', error);
    }
  };

  const handleUpdateUserAccess = async (userId: string, accessLevel: string) => {
    if (!selectedWorkspace) return;
    
    try {
      // This would be an API call to update user access
      console.log('Updating user access:', { workspaceId: selectedWorkspace.id, userId, accessLevel });
      
      // Update local state
      setAvailableUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, accessLevel }
            : user
        )
      );
    } catch (error) {
      console.error('Failed to update user access:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading workspaces...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workspace Management</h2>
          <p className="text-gray-600 mt-1">Create and manage workspaces for users</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Workspace</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search workspaces..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Workspaces Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkspaces.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {searchTerm ? 'No workspaces found' : 'No workspaces yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Create your first workspace to get started'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Create Workspace
              </button>
            )}
          </div>
        ) : (
          filteredWorkspaces.map((workspace) => (
            <div
              key={workspace.id}
              className="bg-gray-50 rounded-lg p-4 border-l-4 group hover:bg-gray-100 transition-colors"
              style={{ borderLeftColor: workspace.color }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: workspace.color }}
                  >
                    <Folder className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{workspace.name}</h3>
                    {workspace.isShared && (
                      <div className="flex items-center space-x-1 text-xs text-blue-600">
                        <Users className="w-3 h-3" />
                        <span>Shared</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleManageUsers(workspace)}
                    className="p-1 hover:bg-blue-100 rounded transition-colors"
                    title="Manage Users"
                  >
                    <Users className="w-3 h-3 text-blue-600" />
                  </button>
                  <button
                    onClick={() => setEditingWorkspace(workspace)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Edit Workspace"
                  >
                    <Edit2 className="w-3 h-3 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteWorkspace(workspace.id)}
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                    title="Delete Workspace"
                  >
                    <Trash2 className="w-3 h-3 text-red-600" />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">{workspace.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>{workspace.chatCount} chats</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(workspace.lastActivity)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Workspace</h3>
            
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={newWorkspace.name}
                  onChange={(e) => setNewWorkspace(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter workspace name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newWorkspace.description}
                  onChange={(e) => setNewWorkspace(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this workspace is for"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex space-x-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewWorkspace(prev => ({ ...prev, color }))}
                      className={`w-6 h-6 rounded-full border-2 ${
                        newWorkspace.color === color ? 'border-gray-400' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isShared"
                  checked={newWorkspace.isShared}
                  onChange={(e) => setNewWorkspace(prev => ({ ...prev, isShared: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isShared" className="ml-2 text-sm text-gray-700">
                  Make this workspace shared
                </label>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Workspace Modal */}
      {editingWorkspace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Workspace</h3>
            
            <form onSubmit={handleEditWorkspace} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={editingWorkspace.name}
                  onChange={(e) => setEditingWorkspace(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                  placeholder="Enter workspace name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editingWorkspace.description}
                  onChange={(e) => setEditingWorkspace(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                  placeholder="Describe what this workspace is for"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex space-x-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEditingWorkspace(prev => prev ? ({ ...prev, color }) : null)}
                      className={`w-6 h-6 rounded-full border-2 ${
                        editingWorkspace.color === color ? 'border-gray-400' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editIsShared"
                  checked={editingWorkspace.isShared}
                  onChange={(e) => setEditingWorkspace(prev => prev ? ({ ...prev, isShared: e.target.checked }) : null)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="editIsShared" className="ml-2 text-sm text-gray-700">
                  Make this workspace shared
                </label>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingWorkspace(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Management Modal */}
      {showUsersModal && selectedWorkspace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Manage Users - {selectedWorkspace.name}
              </h3>
              <button
                onClick={() => {
                  setShowUsersModal(false);
                  setSelectedWorkspace(null);
                  setUserSearchTerm('');
                }}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            {/* User Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Users List */}
            <div className="overflow-y-auto max-h-96">
              {usersLoading ? (
                <div className="text-center py-8 text-gray-500">Loading users...</div>
              ) : (
                <div className="space-y-2">
                  {availableUsers
                    .filter(user => 
                      user.firstName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                      user.lastName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                      user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
                    )
                    .map((user) => (
                      <div
                        key={user.id}
                        className={`flex items-center justify-between p-3 border rounded-lg ${
                          user.isAssigned ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-600">{user.email}</div>
                            </div>
                          </div>
                          
                          {user.isAssigned && (
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                {user.accessLevel}
                              </span>
                              <span className="text-xs text-gray-500">
                                Assigned {user.assignedAt ? formatDate(user.assignedAt) : ''}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {user.isAssigned ? (
                            <>
                              <select
                                value={user.accessLevel || 'member'}
                                onChange={(e) => handleUpdateUserAccess(user.id, e.target.value)}
                                className="text-xs border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="member">Member</option>
                                <option value="readonly">Read Only</option>
                              </select>
                              <button
                                onClick={() => handleRemoveUser(user.id)}
                                className="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors"
                              >
                                Remove
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleAssignUsers([user.id])}
                              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
                            >
                              Assign
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">
                {availableUsers.filter(u => u.isAssigned).length} of {availableUsers.length} users assigned
              </div>
              <button
                onClick={() => {
                  setShowUsersModal(false);
                  setSelectedWorkspace(null);
                  setUserSearchTerm('');
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceManagement;