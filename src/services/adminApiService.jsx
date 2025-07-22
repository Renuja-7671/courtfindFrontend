import axios from 'axios';

import { REACT_APP_API_BASE_URL } from '../config';

const API_URL = REACT_APP_API_BASE_URL + "/api"

const apiClient = axios.create({
  baseURL: API_URL
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