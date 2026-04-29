import api from './axios';

// ── Auth APIs ─────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
  heartbeat: () => api.post('/auth/heartbeat'),
};

// ── Super Admin — Business APIs ───────────────────────────────────
export const adminBusinessAPI = {
  getAll: (params) => api.get('/admin/businesses', { params }),
  getById: (id) => api.get(`/admin/businesses/${id}`),
  getLeads: (id, params) => api.get(`/admin/businesses/${id}/leads`, { params }),
  create: (data) => api.post('/admin/businesses', data),
  update: (id, data) => api.put(`/admin/businesses/${id}`, data),
  toggle: (id) => api.patch(`/admin/businesses/${id}/toggle`),
  delete: (id) => api.delete(`/admin/businesses/${id}`),
};

// ── Super Admin — User APIs ───────────────────────────────────────
export const adminUserAPI = {
  getAll: (params) => api.get('/admin/users', { params }),
  getById: (id) => api.get(`/admin/users/${id}`),
  create: (data) => api.post('/admin/users', data),
  update: (id, data) => api.put(`/admin/users/${id}`, data),
  toggle: (id) => api.patch(`/admin/users/${id}/toggle`),
  forceLogout: (id) => api.post(`/admin/users/${id}/force-logout`),
  resetPassword: (id) => api.post(`/admin/users/${id}/reset-password`),
};

// ── Super Admin — Analytics APIs ──────────────────────────────────
export const adminAnalyticsAPI = {
  getStats: () => api.get('/admin/stats'),
  getSessions: (params) => api.get('/admin/sessions', { params }),
};

// ── Business Admin APIs — /api/b/:slug/* ─────────────────────────
export const baAPI = {
  // Dashboard
  getOverview: (slug) => api.get(`/b/${slug}/overview`),
  getLeadTrend: (slug) => api.get(`/b/${slug}/lead-trend`),
  getDashboardLeads: (slug, filter) => api.get(`/b/${slug}/dashboard-leads`, { params: { filter } }),

  // Employee management
  getEmployees: (slug, params) => api.get(`/b/${slug}/employees`, { params }),
  createEmployee: (slug, data) => api.post(`/b/${slug}/employees`, data),
  toggleEmployee: (slug, id) => api.patch(`/b/${slug}/employees/${id}/toggle`),
  forceLogoutEmployee: (slug, id) => api.post(`/b/${slug}/employees/${id}/force-logout`),
  resetEmployeePassword: (slug, id) => api.post(`/b/${slug}/employees/${id}/reset-password`),

  // Lead management (Business Admin side)
  getLeads: (slug, params) => api.get(`/b/${slug}/leads`, { params }),
  getLead: (slug, id) => api.get(`/b/${slug}/leads/${id}`),
  createLead: (slug, data) => api.post(`/b/${slug}/leads`, data),
  updateLead: (slug, id, data) => api.put(`/b/${slug}/leads/${id}`, data),
  deleteLead: (slug, id) => api.delete(`/b/${slug}/leads/${id}`),

  // Excel import — multipart/form-data
  importLeads: (slug, file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/b/${slug}/leads/import`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Assignment
  assignLead: (slug, id, employeeId) =>
    api.post(`/b/${slug}/leads/${id}/assign`, { employeeId }),

  bulkAssign: (slug, payload) =>
    api.post(`/b/${slug}/leads/bulk-assign`, payload),
  // payload options:
  //  { leadIds, employeeId }           ← specific IDs
  //  { fromRow, toRow, employeeId, batchId? } ← range
  //  { assignAll: true, employeeIds }  ← auto distribute

  // Notes
  addNote: (slug, id, text) => api.post(`/b/${slug}/leads/${id}/notes`, { text }),

  // Overview / analytics
  getLeadOverview: (slug) => api.get(`/b/${slug}/leads/overview`),

  // Export (returns blob)
  exportLeads: (slug, params) =>
    api.get(`/b/${slug}/leads/export`, { params, responseType: 'blob' }),

  // ── Instructions ──────────────────────────────────────────────
  getInstructions: (slug) => api.get(`/b/${slug}/instructions`),
  createInstruction: (slug, text, pin) => api.post(`/b/${slug}/instructions`, { text, isPinned: !!pin }),
  togglePinInstruction: (slug, id) => api.patch(`/b/${slug}/instructions/${id}/pin`),
  deleteInstruction: (slug, id) => api.delete(`/b/${slug}/instructions/${id}`),

  // ── Notifications ─────────────────────────────────────────────
  getNotifications: (slug) => api.get(`/b/${slug}/notifications`),
  getUnreadCount: (slug) => api.get(`/b/${slug}/notifications/unread-count`),
  markAllRead: (slug) => api.patch(`/b/${slug}/notifications/read-all`),
  markOneRead: (slug, id) => api.patch(`/b/${slug}/notifications/${id}/read`),

  // ── Web-to-Lead API Key ───────────────────────────────────────
  getApiKey: (slug) => api.get(`/b/${slug}/api-key`),
  generateApiKey: (slug) => api.post(`/b/${slug}/generate-api-key`),

  // ── Recycle Bin ───────────────────────────────────────────────
  getTrash: (slug, params) => api.get(`/b/${slug}/leads/trash`, { params }),
  restoreLead: (slug, id) => api.patch(`/b/${slug}/leads/trash/${id}/restore`),
  permanentDelete: (slug, id) => api.delete(`/b/${slug}/leads/trash/${id}/permanent`),
};

// ── Employee APIs — /api/b/:slug/* ───────────────────────────────
export const empAPI = {
  // Dashboard
  getDashboard: (slug) => api.get(`/b/${slug}/emp/dashboard`),

  // My leads
  getMyLeads: (slug, params) => api.get(`/b/${slug}/leads/my/leads`, { params }),
  updateStatus: (slug, id, status) =>
    api.patch(`/b/${slug}/leads/my/${id}/status`, { status }),
  updateLeadColor: (slug, id, colorTag) =>
    api.patch(`/b/${slug}/leads/my/${id}/color`, { colorTag }),

  // Notes
  getNotes: (slug, id) => api.get(`/b/${slug}/leads/my/${id}/notes`),
  addNote: (slug, id, text) => api.post(`/b/${slug}/leads/my/${id}/notes`, { text }),
  deleteNote: (slug, id, noteId) => api.delete(`/b/${slug}/leads/my/${id}/notes/${noteId}`),

  // Instructions (read only)
  getInstructions: (slug) => api.get(`/b/${slug}/instructions`),

  // ── Notifications (same endpoints, different role) ────────────
  getNotifications: (slug) => api.get(`/b/${slug}/notifications`),
  getUnreadCount: (slug) => api.get(`/b/${slug}/notifications/unread-count`),
  markAllRead: (slug) => api.patch(`/b/${slug}/notifications/read-all`),
  markOneRead: (slug, id) => api.patch(`/b/${slug}/notifications/${id}/read`),
};
