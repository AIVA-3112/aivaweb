// Workspace API utility functions
const API_BASE_URL = '/api';

interface Workspace {
  id: string;
  name: string;
  description: string;
  color: string;
  isShared: boolean;
  ownerId: string;
  chatCount: number;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
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

interface ApiResponse<T> {
  message: string;
  data?: T;
  error?: string;
}

// Get authentication headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Workspace API functions
export const workspaceApi = {
  // Get all workspaces
  async getWorkspaces(): Promise<Workspace[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/workspaces`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch workspaces');
      }
      
      const data = await response.json();
      return data.workspaces || [];
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      throw error;
    }
  },

  // Create new workspace (admin only)
  async createWorkspace(workspace: {
    name: string;
    description: string;
    color: string;
    isShared: boolean;
  }): Promise<Workspace> {
    try {
      const response = await fetch(`${API_BASE_URL}/workspaces`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(workspace),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create workspace');
      }
      
      const data = await response.json();
      return data.workspace;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }
  },

  // Update workspace (admin only)
  async updateWorkspace(id: string, updates: Partial<Workspace>): Promise<Workspace> {
    try {
      const response = await fetch(`${API_BASE_URL}/workspaces/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update workspace');
      }
      
      const data = await response.json();
      return data.workspace;
    } catch (error) {
      console.error('Error updating workspace:', error);
      throw error;
    }
  },

  // Delete workspace (admin only)
  async deleteWorkspace(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/workspaces/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete workspace');
      }
    } catch (error) {
      console.error('Error deleting workspace:', error);
      throw error;
    }
  },

  // Get available users for workspace assignment (admin only)
  async getAvailableUsers(workspaceId: string, search?: string): Promise<User[]> {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/available-users?${params}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch available users');
      }
      
      const data = await response.json();
      return data.users || [];
    } catch (error) {
      console.error('Error fetching available users:', error);
      throw error;
    }
  },

  // Assign users to workspace (admin only)
  async assignUsers(workspaceId: string, userIds: string[], accessLevel = 'member'): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/assign-user`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userIds, accessLevel }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to assign users');
      }
    } catch (error) {
      console.error('Error assigning users:', error);
      throw error;
    }
  },

  // Remove users from workspace (admin only)
  async removeUsers(workspaceId: string, userIds: string[]): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/remove-user`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userIds }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove users');
      }
    } catch (error) {
      console.error('Error removing users:', error);
      throw error;
    }
  },

  // Update user access level in workspace (admin only)
  async updateUserAccess(workspaceId: string, userId: string, accessLevel: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/user-access`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, accessLevel }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user access');
      }
    } catch (error) {
      console.error('Error updating user access:', error);
      throw error;
    }
  },
};

export default workspaceApi;