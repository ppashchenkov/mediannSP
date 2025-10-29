import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
 (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { username: string; password: string }) => 
    api.post('/auth/login', credentials),
  logout: () => 
    api.post('/auth/logout'),
};

// User API
export const userAPI = {
  getUsers: (page = 1, limit = 10, search = '') => 
    api.get(`/users?page=${page}&limit=${limit}&search=${search}`),
  getUser: (id: number) => 
    api.get(`/users/${id}`),
  createUser: (userData: any) => 
    api.post('/users', userData),
  updateUser: (id: number, userData: any) => 
    api.put(`/users/${id}`, userData),
  deleteUser: (id: number) => 
    api.delete(`/users/${id}`),
};

// Device Type API
export const deviceTypeAPI = {
  getDeviceTypes: () => 
    api.get('/device-types'),
  getDeviceType: (id: number) => 
    api.get(`/device-types/${id}`),
  createDeviceType: (deviceTypeData: any) => 
    api.post('/device-types', deviceTypeData),
  updateDeviceType: (id: number, deviceTypeData: any) => 
    api.put(`/device-types/${id}`, deviceTypeData),
  deleteDeviceType: (id: number) => 
    api.delete(`/device-types/${id}`),
};

// Device API
export const deviceAPI = {
  getDevices: (page = 1, limit = 10, search = '', deviceTypeId = null, status = null, location = null, contractId = null) => {
    let url = `/devices?page=${page}&limit=${limit}&search=${search}`;
    if (deviceTypeId) url += `&device_type_id=${deviceTypeId}`;
    if (status) url += `&status=${status}`;
    if (location) url += `&location=${location}`;
    if (contractId) url += `&contract_id=${contractId}`;
    return api.get(url);
  },
  getDevice: (id: number) => 
    api.get(`/devices/${id}`),
  createDevice: (deviceData: any) => 
    api.post('/devices', deviceData),
  updateDevice: (id: number, deviceData: any) => 
    api.put(`/devices/${id}`, deviceData),
  deleteDevice: (id: number) => 
    api.delete(`/devices/${id}`),
  getDeviceComponents: (id: number) => 
    api.get(`/devices/${id}/components`),
  addDeviceComponent: (deviceId: number, componentId: number) => 
    api.post(`/devices/${deviceId}/components`, { component_id: componentId }),
  removeDeviceComponent: (deviceId: number, componentId: number) => 
    api.delete(`/devices/${deviceId}/components/${componentId}`),
};

// Component Type API
export const componentTypeAPI = {
  getComponentTypes: () => 
    api.get('/component-types'),
  getComponentType: (id: number) => 
    api.get(`/component-types/${id}`),
  createComponentType: (componentTypeData: any) => 
    api.post('/component-types', componentTypeData),
  updateComponentType: (id: number, componentTypeData: any) => 
    api.put(`/component-types/${id}`, componentTypeData),
  deleteComponentType: (id: number) => 
    api.delete(`/component-types/${id}`),
};

// Component API
export const componentAPI = {
  getComponents: (page = 1, limit = 10, search = '', componentTypeId = null) => {
    let url = `/components?page=${page}&limit=${limit}&search=${search}`;
    if (componentTypeId) url += `&component_type_id=${componentTypeId}`;
    return api.get(url);
  },
  getComponent: (id: number) => 
    api.get(`/components/${id}`),
  createComponent: (componentData: any) => 
    api.post('/components', componentData),
  updateComponent: (id: number, componentData: any) => 
    api.put(`/components/${id}`, componentData),
  deleteComponent: (id: number) => 
    api.delete(`/components/${id}`),
};

// Photo API
export const photoAPI = {
  getPhotos: (entityType: string, entityId: number) => 
    api.get(`/photos/${entityType}/${entityId}`),
  uploadPhoto: (entityType: string, entityId: number, file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post(`/photos/${entityType}/${entityId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deletePhoto: (id: number) => 
    api.delete(`/photos/${id}`),
  setPrimaryPhoto: (id: number) => 
    api.put(`/photos/${id}/primary`),
};

// Search API
export const searchAPI = {
  search: (query: string, page = 1, limit = 10) => 
    api.get(`/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`),
};

// Print API
export const printAPI = {
  printDevice: (id: number) => 
    api.get(`/print/device/${id}`, { responseType: 'blob' }),
  printComponent: (id: number) => 
    api.get(`/print/component/${id}`, { responseType: 'blob' }),
};

// Contract API
export const contractAPI = {
  getContracts: (page = 1, limit = 10, search = '') => 
    api.get(`/contracts?page=${page}&limit=${limit}&search=${search}`),
  getContract: (id: number) => 
    api.get(`/contracts/${id}`),
  createContract: (contractData: any) => 
    api.post('/contracts', contractData),
  updateContract: (id: number, contractData: any) => 
    api.put(`/contracts/${id}`, contractData),
  deleteContract: (id: number) => 
    api.delete(`/contracts/${id}`),
};

export default api;