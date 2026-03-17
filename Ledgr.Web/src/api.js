const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

function token() { return localStorage.getItem('token'); }

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const register = (username, password, language = 'en') => req('POST', '/api/auth/register', { username, password, language });
export const login = (username, password) => req('POST', '/api/auth/login', { username, password });

export const getTransactions = (params = {}) => req('GET', '/api/transactions?' + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))));
export const getSummary = (params = {}) => req('GET', '/api/transactions/summary?' + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))));
export const createTransaction = (data) => req('POST', '/api/transactions', data);
export const updateTransaction = (id, data) => req('PUT', `/api/transactions/${id}`, data);
export const deleteTransaction = (id) => req('DELETE', `/api/transactions/${id}`);

export const getCategories = () => req('GET', '/api/categories');
export const createCategory = (data) => req('POST', '/api/categories', data);
export const updateCategory = (id, data) => req('PUT', `/api/categories/${id}`, data);
export const deleteCategory = (id) => req('DELETE', `/api/categories/${id}`);

export const changePassword = (data) => req('POST', '/api/users/change-password', data);

export const getUsers = () => req('GET', '/api/admin/users');
export const deleteUser = (id) => req('DELETE', `/api/admin/users/${id}`);
export const resetPassword = (id, newPassword) => req('POST', `/api/admin/users/${id}/reset-password`, { newPassword });

export const getTemplates = () => req('GET', '/api/transactions/templates');
export const getProjections = (params = {}) => req('GET', '/api/transactions/projections?' + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))));
export const stopRecurrence = (id) => req('POST', `/api/transactions/${id}/stop-recurrence`);

export function parseToken() {
  const t = localStorage.getItem('token');
  if (!t) return {};
  try { return JSON.parse(atob(t.split('.')[1])); } catch { return {}; }
}
