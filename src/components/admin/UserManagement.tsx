import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  UserPlus, 
  Mail, 
  Calendar,
  Shield,
  Users,
  Filter,
  Download,
  MoreHorizontal
} from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  provider: string;
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvider, setFilterProvider] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    provider: 'local'
  });

  useEffect(() => {
    fetchUsers();
    // Auto-refresh user data every 30 seconds
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      // Mock data for demonstration
      const mockUsers: User[] = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@alyasra.com',
          provider: 'microsoft',
          isActive: true,
          lastLoginAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          firstName: 'Sarah',
          lastName: 'Wilson',
          email: 'sarah.wilson@alyasra.com',
          provider: 'microsoft',
          isActive: true,
          lastLoginAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          createdAt: '2024-01-10T14:20:00Z',
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          firstName: 'Ahmed',
          lastName: 'Al-Hassan',
          email: 'ahmed.hassan@alyasra.com',
          provider: 'local',
          isActive: true,
          lastLoginAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          createdAt: '2024-01-08T09:15:00Z',
          updatedAt: new Date().toISOString()
        },
        {
          id: '4',
          firstName: 'Maria',
          lastName: 'Garcia',
          email: 'maria.garcia@consultant.alyasra.com',
          provider: 'google',
          isActive: false,
          lastLoginAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
          createdAt: '2024-01-05T16:45:00Z',
          updatedAt: new Date().toISOString()
        },
        {
          id: '5',
          firstName: 'David',
          lastName: 'Thompson',
          email: 'david.thompson@alyasra.com',
          provider: 'microsoft',
          isActive: true,
          lastLoginAt: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          createdAt: '2024-01-12T11:00:00Z',
          updatedAt: new Date().toISOString()
        },
        {
          id: '6',
          firstName: 'Fatima',
          lastName: 'Al-Zahra',
          email: 'fatima.zahra@alyasra.com',
          provider: 'local',
          isActive: true,
          lastLoginAt: new Date(Date.now() - Math.random() * 7200000).toISOString(),
          createdAt: '2024-01-20T08:30:00Z',
          updatedAt: new Date().toISOString()
        }
      ];
      
      setUsers(mockUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchUsers();
        setShowCreateModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchUsers();
        setEditingUser(null);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) return;

    try {
      const response = await fetch('/api/admin/users/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ userIds: selectedUsers })
      });

      if (response.ok) {
        fetchUsers();
        setSelectedUsers([]);
      }
    } catch (error) {
      console.error('Failed to bulk delete users:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      provider: 'local'
    });
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      provider: user.provider
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProvider = filterProvider === 'all' || user.provider === filterProvider;
    
    return matchesSearch && matchesProvider;
  });

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length 
        ? [] 
        : filteredUsers.map(user => user.id)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">User Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-foreground">{users.length}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-foreground">
                {users.filter(u => u.isActive).length}
              </p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center">
            <Mail className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-foreground">
                {users.filter(u => u.provider === 'local').length}
              </p>
              <p className="text-sm text-muted-foreground">Local Accounts</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-500" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-foreground">
                {users.filter(u => {
                  const lastLogin = new Date(u.lastLoginAt);
                  const today = new Date();
                  const diffTime = Math.abs(today.getTime() - lastLogin.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays <= 7;
                }).length}
              </p>
              <p className="text-sm text-muted-foreground">Active This Week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
          />
        </div>
        <select
          value={filterProvider}
          onChange={(e) => setFilterProvider(e.target.value)}
          className="px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
        >
          <option value="all">All Providers</option>
          <option value="local">Local</option>
          <option value="microsoft">Microsoft</option>
          <option value="google">Google</option>
        </select>
        {selectedUsers.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected ({selectedUsers.length})
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-border"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Provider</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Last Login</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.provider === 'local' 
                        ? 'bg-blue-100 text-blue-800' 
                        : user.provider === 'microsoft'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {user.provider}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit user"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit User Modal */}
      {(showCreateModal || editingUser) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {editingUser ? 'Edit User' : 'Create New User'}
            </h3>
            
            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Password {editingUser && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                  required={!editingUser}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Provider
                </label>
                <select
                  value={formData.provider}
                  onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                >
                  <option value="local">Local</option>
                  <option value="microsoft">Microsoft</option>
                  <option value="google">Google</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;