import { api } from './api';

const formatPhone = (phone) => {
  if (!phone) return phone;
  let formatted = phone.replace(/^\+251/, '0');
  if (formatted.startsWith('9')) formatted = '0' + formatted;
  return formatted;
};

const formatUserData = (data) => {
  if (!data) return data;
  const newData = { ...data };
  if (newData.phone) newData.phone = formatPhone(newData.phone);
  if (newData.role) newData.role = newData.role.toUpperCase();
  return newData;
};

export const userService = {
  login: (credentials) => api.post('/auth/login', formatUserData(credentials)),
  signup: (userData) => api.post('/user/signup', formatUserData(userData)),
  getProfile: () => api.get('/user'),
  update: (id, data) => api.patch(`/user/${id}`, formatUserData(data)),
  assignRole: (userId, role) => api.patch(`/user/${userId}`, { role: role.toUpperCase() }),
};
