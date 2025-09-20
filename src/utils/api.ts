// API utility functions for frontend components

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://aiva-backend-api.azurewebsites.net/api' 
  : 'http://localhost:3001/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Generic API request function
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}: ${response.statusText}` }));
    const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    (error as any).status = response.status;
    throw error;
  }
  
  return response.json();
};

// Bookmark API functions
export const bookmarkAPI = {
  async getBookmarks() {
    return apiRequest('/bookmarks');
  },
  
  async addBookmark(messageId: string) {
    return apiRequest(`/bookmarks/${messageId}`, {
      method: 'POST',
    });
  },
  
  async removeBookmark(messageId: string) {
    return apiRequest(`/bookmarks/${messageId}`, {
      method: 'DELETE',
    });
  },
};

// Message Actions API functions
export const messageActionAPI = {
  async getLikedMessages() {
    return apiRequest('/message-actions/liked');
  },
  
  async getDislikedMessages() {
    return apiRequest('/message-actions/disliked');
  },
  
  async addMessageAction(messageId: string, actionType: 'like' | 'dislike' | 'star' | 'bookmark') {
    return apiRequest(`/message-actions/${messageId}/${actionType}`, {
      method: 'POST',
    });
  },
  
  async removeMessageAction(messageId: string, actionType: 'like' | 'dislike' | 'star' | 'bookmark') {
    return apiRequest(`/message-actions/${messageId}/${actionType}`, {
      method: 'DELETE',
    });
  },
};

// Workspace API functions
export const workspaceAPI = {
  async getWorkspaces() {
    return apiRequest('/workspaces');
  },
  
  async createWorkspace(data: {
    name: string;
    description?: string;
    color?: string;
    isShared?: boolean;
  }) {
    return apiRequest('/workspaces', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async updateWorkspace(workspaceId: string, data: Partial<{
    name: string;
    description: string;
    color: string;
    isShared: boolean;
  }>) {
    return apiRequest(`/workspaces/${workspaceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  async deleteWorkspace(workspaceId: string) {
    return apiRequest(`/workspaces/${workspaceId}`, {
      method: 'DELETE',
    });
  },
};

// Chat API functions
export const chatAPI = {
  async sendMessage(data: {
    message: string;
    chatId?: string;
    parentMessageId?: string;
    datasetId?: string;
    workspaceId?: string;
    useDataAgent?: boolean;
    files?: Array<{id: string, originalName: string, url: string, mimeType: string}>;
  }) {
    // Ensure we have a workspaceId, use default if not provided
    if (!data.workspaceId) {
      // We'll handle default workspace on the backend
      delete data.workspaceId;
    }
    
    try {
      return await apiRequest('/chat/message', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Rethrow with a user-friendly message
      if (error instanceof Error) {
        // If the error already has a user-friendly message from the backend, use it
        throw error;
      } else {
        throw new Error('Failed to send message. Please try again.');
      }
    }
  },
  
  async getChats(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    
    const endpoint = searchParams.toString() ? `/chat?${searchParams}` : '/chat';
    return apiRequest(endpoint);
  },
  
  async createChat(data: {
    title: string;
    description?: string;
    workspaceId?: string;
  }) {
    // Ensure we have a workspaceId, use default if not provided
    if (!data.workspaceId) {
      // We'll handle default workspace on the backend
      delete data.workspaceId;
    }
    
    return apiRequest('/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async getChatMessages(chatId: string, params?: {
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    
    const endpoint = searchParams.toString() ? `/chat/${chatId}/messages?${searchParams}` : `/chat/${chatId}/messages`;
    return apiRequest(endpoint);
  },
  
  async deleteChat(chatId: string) {
    return apiRequest(`/chat/${chatId}`, {
      method: 'DELETE',
    });
  },
};

// Chat History API functions
export const historyAPI = {
  async getChatHistory(limit?: number) {
    const endpoint = limit ? `/history?limit=${limit}` : '/history';
    return apiRequest(endpoint);
  },
  
  async getChatDetails(chatId: string) {
    return apiRequest(`/history/${chatId}`);
  },
};

// Feedback API functions
export const feedbackAPI = {
  async submitFeedback(feedbackData: {
    subject: string;
    message: string;
    category: string;
    priority: string;
  }) {
    return apiRequest('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  },
  
  async getUserFeedback() {
    return apiRequest('/feedback/my-feedback');
  },
};

// User API functions
export const userAPI = {
  async getProfile() {
    return apiRequest('/user/profile');
  },
  
  async updateProfile(profileData: any) {
    return apiRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
  
  async getStats() {
    return apiRequest('/user/stats');
  },
};

// File API functions
export const fileAPI = {
  async uploadFile(file: File, chatId?: string, messageId?: string) {
    const formData = new FormData();
    formData.append('file', file);
    
    if (chatId) {
      formData.append('chatId', chatId);
    }
    
    if (messageId) {
      formData.append('messageId', messageId);
    }
    
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}: ${response.statusText}` }));
      const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      (error as any).status = response.status;
      throw error;
    }
    
    return response.json();
  },
  
  async getFiles() {
    return apiRequest('/files');
  },
  
  async deleteFile(fileId: string) {
    return apiRequest(`/files/${fileId}`, {
      method: 'DELETE',
    });
  },
  
  async downloadFile(fileId: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/files/download/${fileId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}: ${response.statusText}` }));
      const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      (error as any).status = response.status;
      throw error;
    }
    
    return response;
  },
};

// Auth API functions
export const authAPI = {
  async login(email: string, password: string) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  
  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  async verifyToken() {
    return apiRequest('/auth/verify');
  },
  
  async logout() {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },
};