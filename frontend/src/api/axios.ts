import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Request interceptor for adding auth headers and credentials
api.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
    const authToken = sessionStorage.getItem('AUTHORIZATION');
    if (authToken) {
      config.headers.Authorization = `Basic ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for standardized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    const errorResponse = {
      status: response?.status || 500,
      message: 'An unexpected error occurred',
      data: response?.data,
    };

    if (response?.data) {
      if (typeof response.data === 'string') {
        errorResponse.message = response.data;
      } else if (response.data.message) {
        errorResponse.message = response.data.message;
      } else if (response.data.error) {
        errorResponse.message = response.data.error;
      } else if (response.data.errors && Array.isArray(response.data.errors)) {
        errorResponse.message = response.data.errors[0] || 'Validation error';
      }
    } else if (!navigator.onLine) {
      errorResponse.message = 'No internet connection';
    }

    if (errorResponse.message === 'An unexpected error occurred') {
      switch (errorResponse.status) {
        case 400:
          errorResponse.message = 'Bad request';
          break;
        case 401:
          errorResponse.message = 'Unauthorized - Please log in again';
          break;
        case 403:
          errorResponse.message = 'Forbidden - You do not have permission';
          break;
        case 404:
          errorResponse.message = 'Resource not found';
          break;
        case 422:
          errorResponse.message = 'Validation error';
          break;
        case 500:
          errorResponse.message = 'Server error - Please try again later';
          break;
        case 503:
          errorResponse.message = 'Service unavailable - Please try again later';
          break;
      }
    }

    return Promise.reject(errorResponse);
  }
);

export default api;

// Helper function to handle API errors in components
export const handleApiError = (error: unknown): { error: boolean; message: string } => {
  if (error && typeof error === 'object' && 'message' in error) {
    return { error: true, message: (error as { message: string }).message };
  }
  return { error: true, message: 'An unexpected error occurred' };
};