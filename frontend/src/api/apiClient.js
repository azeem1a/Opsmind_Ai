import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const getChatHistory = (sessionId) => api.get(`/chat/${sessionId}`);
export const saveMessage = (data) => api.post('/chat', data);
export const clearChat = (sessionId) => api.delete(`/chat/${sessionId}`);

export default api;
