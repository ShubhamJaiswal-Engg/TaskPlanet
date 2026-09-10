// API service with automatic token injection and error handling

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('taskplanet_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong with the API request');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth API
  register: (userData) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => request('/api/auth/me', { method: 'GET' }),
  updateProfile: (profileData) => request('/api/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),

  // Posts API
  getPosts: (page = 1, limit = 10, sort = 'latest') => 
    request(`/api/posts?page=${page}&limit=${limit}&sort=${sort}`, { method: 'GET' }),
  getPostById: (id) => request(`/api/posts/${id}`, { method: 'GET' }),
  createPost: (postData) => request('/api/posts', { method: 'POST', body: JSON.stringify(postData) }),
  toggleLike: (id) => request(`/api/posts/${id}/like`, { method: 'PUT' }),
  addComment: (id, commentData) => request(`/api/posts/${id}/comment`, { method: 'POST', body: JSON.stringify(commentData) }),
  deletePost: (id) => request(`/api/posts/${id}`, { method: 'DELETE' }),

  // Health
  checkHealth: () => request('/api/health', { method: 'GET' }),
};
