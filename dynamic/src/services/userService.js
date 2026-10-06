import { apiClient } from './api';

export const userService = {
    // POST /user/signup
    signupUser: ({ phone, email, password, role }) =>
        apiClient('/user/signup', {
            method: 'POST',
            body: {
                phone,
                email,
                password,
                role,
            },
        }),

    getAllUsers: () => apiClient('/user'),
    getUserById: (id) => apiClient(`/user/${id}`),
};