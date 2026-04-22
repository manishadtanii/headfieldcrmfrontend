import api from './axios';

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
  heartbeat: () => api.post('/auth/heartbeat'),
};

// Super Admin — Business APIs
export const adminBusinessAPI = {
  getAll: (params) => api.get('/admin/businesses', { params }),
  getById: (id) => api.get(`/admin/businesses/${id}`),
  create: (data) => api.post('/admin/businesses', data),
  update: (id, data) => api.put(`/admin/businesses/${id}`, data),
  toggle: (id) => api.patch(`/admin/businesses/${id}/toggle`),
  delete: (id) => api.delete(`/admin/businesses/${id}`),
};

// Super Admin — User APIs
export const adminUserAPI = {
  getAll: (params) => api.get('/admin/users', { params }),
  getById: (id) => api.get(`/admin/users/${id}`),
  create: (data) => api.post('/admin/users', data),
  update: (id, data) => api.put(`/admin/users/${id}`, data),
  toggle: (id) => api.patch(`/admin/users/${id}/toggle`),
  forceLogout: (id) => api.post(`/admin/users/${id}/force-logout`),
  resetPassword: (id) => api.post(`/admin/users/${id}/reset-password`),
};

// Super Admin — Analytics APIs
export const adminAnalyticsAPI = {
  getStats: () => api.get('/admin/stats'),
  getSessions: (params) => api.get('/admin/sessions', { params }),
};

// Business Admin APIs — /api/b/:slug/*
export const baAPI = {
  // Dashboard
  getOverview: (slug) => api.get(`/b/${slug}/overview`),

  // Employee management
  getEmployees: (slug, params) => api.get(`/b/${slug}/employees`, { params }),
  createEmployee: (slug, data) => api.post(`/b/${slug}/employees`, data),
  toggleEmployee: (slug, id) => api.patch(`/b/${slug}/employees/${id}/toggle`),
  forceLogoutEmployee: (slug, id) => api.post(`/b/${slug}/employees/${id}/force-logout`),
  resetEmployeePassword: (slug, id) => api.post(`/b/${slug}/employees/${id}/reset-password`),
};
