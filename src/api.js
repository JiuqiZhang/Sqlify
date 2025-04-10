// src/api.js
import axios from 'axios';


const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});



api.interceptors.request.use(
  (config) => {
    //acquire token from localStorage 
    const token = localStorage.getItem('token'); 
    
    // add token to headers
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  }, 
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    
    if (error.response && error.response.status === 401) {
      
      localStorage.removeItem('token');
      
     
    }
    
    return Promise.reject(error);
  }
);

export default api;