import { apiClient } from './api';

export const memberService = {
    // GET /member/all_member
    getAllMembers: async () => {
        const data = await apiClient('/member/all_member');
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.data)) return data.data;
        if (Array.isArray(data?.members)) return data.members;
        return [];
    },

    // GET /member/:id
    getMemberById: (id) => apiClient(`/member/${id}`),

    // PATCH /member/:id
    updateMember: (id, updateData) => apiClient(`/member/${id}`, {
        method: 'PATCH',
        body: updateData,
    }),

    // DELETE /member/:id
    deleteMember: (id) => apiClient(`/member/${id}`, {
        method: 'DELETE',
    }),
};