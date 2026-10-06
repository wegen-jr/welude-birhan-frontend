import { api } from './api';

const formatPhone = (phone) => {
  if (!phone) return phone;
  // Replace +251 with 0, and ensure it starts with 09
  let formatted = phone.replace(/^\+251/, '0');
  if (formatted.startsWith('9')) formatted = '0' + formatted;
  return formatted;
};

const formatMemberData = (data) => {
  if (!data) return data;
  const newData = { ...data };
  if (newData.phoneNo) newData.phoneNo = formatPhone(newData.phoneNo);
  if (newData.repentancePhone) newData.repentancePhone = formatPhone(newData.repentancePhone);
  if (newData.familyPhone) newData.familyPhone = formatPhone(newData.familyPhone);
  return newData;
};

export const memberService = {
  getAll: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/member/all_member?${queryString}`);
  },
  getById: (id) => api.get(`/member/${id}`),
  create: (data) => api.post('/member/creat_member', formatMemberData(data)),
  update: (id, data) => api.patch(`/member/${id}`, formatMemberData(data)),
  delete: (id) => api.delete(`/member/${id}`),
  approve: (id) => api.patch(`/member/${id}`, { status: 'APPROVED' }), // Depending on backend support
  reject: (id) => api.delete(`/member/${id}`), // Or patch with REJECTED
};
