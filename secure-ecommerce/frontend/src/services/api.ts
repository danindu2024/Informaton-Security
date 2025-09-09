// frontend/src/services/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  httpsAgent: process.env.NODE_ENV === 'development' ? {
    rejectUnauthorized: false // Allow self-signed certificates in development
  } : undefined
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth0_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth0_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  _id: string;
  auth0Id: string;
  username: string;
  name: string;
  email: string;
  contactNumber?: string;
  country?: string;
}

export interface Order {
  _id: string;
  username: string;
  purchaseDate: string;
  deliveryTime: string;
  deliveryLocation: string;
  productName: string;
  quantity: number;
  message?: string;
  status: string;
  createdAt: string;
}

export interface CreateOrderData {
  purchaseDate: string;
  deliveryTime: string;
  deliveryLocation: string;
  productName: string;
  quantity: number;
  message?: string;
}

export const userAPI = {
  getProfile: (): Promise<User> => api.get('/user/profile').then(res => res.data),
  updateProfile: (data: Partial<User>): Promise<User> => 
    api.put('/user/profile', data).then(res => res.data),
};

export const ordersAPI = {
  getOrders: (): Promise<Order[]> => api.get('/orders').then(res => res.data),
  createOrder: (data: CreateOrderData): Promise<Order> => 
    api.post('/orders', data).then(res => res.data),
};

export const optionsAPI = {
  getOptions: () => api.get('/options').then(res => res.data),
};