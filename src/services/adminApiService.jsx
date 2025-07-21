import axios from 'axios';

const apiClient = axios.create({
  baseURL: `${process.env.REACT_APP_API_BASE_URL}/api`
});

// Request interceptor to add auth token to every request
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default apiClient;