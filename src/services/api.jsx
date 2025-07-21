import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api`; // Base API URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Token to Requests if Available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Retrieve token from local storage
  //console.log("Token:", token); // Debugging line
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error("Request Error:", error);
  return Promise.reject(error);
});

// Response Error Handling
api.interceptors.response.use(
  (response) => response, // Return the response if no errors
  (error) => {
    console.error("API Error:", error.response || error.message); // Log errors
    return Promise.reject(error);
  }
);

export default api;
