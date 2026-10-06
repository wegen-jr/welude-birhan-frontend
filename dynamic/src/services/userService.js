import { apiClient } from './api';

const formatPhone = (phone) => {
    if (!phone) return phone;
    let formatted = String(phone).replace(/^\+?251/, '0');
    if (formatted.startsWith('9')) formatted = '0' + formatted;
    return formatted;
};

export const userService = {
    // POST /user/signup
    signupUser: ({ phone, email, password, role }) =>
        apiClient('/user/signup', {
            method: 'POST',
            body: {
                phone: formatPhone(phone),
                email,
                password,
                role: role ? role.toUpperCase() : role,
            },
        }),

    getAllUsers: () => apiClient('/user'),
    getUserById: (id) => apiClient(`/user/${id}`),
    assignRole: (userId, role) => apiClient(`/user/${userId}`, {
        method: 'PATCH',
        body: { role: role ? role.toUpperCase() : role }
    }),
};