import axios from 'axios';

// Spring Boot backend API base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

// Flask / Python AI Service base URL
export const AI_BASE_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:5000';

// Axios instance for Spring Boot Backend
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Axios instance for AI Service
export const aiClient = axios.create({
  baseURL: AI_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Response interceptor to handle common error formatting
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'Unable to connect to the hospital backend server.';
    if (error.response) {
      if (typeof error.response.data === 'string') {
        message = error.response.data;
      } else if (error.response.data && error.response.data.message) {
        message = error.response.data.message;
      } else {
        message = `Request failed with status ${error.response.status}`;
      }
    } else if (error.request) {
      message = `Cannot reach backend at ${API_BASE_URL}. Ensure Spring Boot is running.`;
    }
    return Promise.reject(new Error(message));
  }
);

aiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'Unable to connect to AI Prediction Service.';
    if (error.response && error.response.data && error.response.data.error) {
      message = error.response.data.error;
    } else if (error.request) {
      message = `Cannot reach AI service at ${AI_BASE_URL}. Make sure Flask (app.py) is running on port 5000.`;
    }
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
