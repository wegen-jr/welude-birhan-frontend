import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { memberService } from '../services/memberService';

const normalizePhoneDigits = (phoneStr) => {
    if (!phoneStr) return '';
    const digits = String(phoneStr).replace(/\D/g, '');
    if (digits.startsWith('251')) return digits.slice(3);
    if (digits.startsWith('0')) return digits.slice(1);
    return digits;
};

export function useMembers() {
    const [members, setMembers] = useState([]);
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await memberService.getAllMembers();
            setMembers(data);
            setFilteredMembers(data);
        } catch (err) {
            setError(err.message);
            toast.error(err.message || 'Failed to load member records');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const searchMembers = useCallback((query) => {
        if (!query) {
            setFilteredMembers(members);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const cleanTarget = normalizePhoneDigits(query);

        const results = members.filter((member) => {
            const fullName = (member.fullname || member.fullName || member.name || '').toLowerCase();
            const christianName = (member.christianName || member.christian_name || '').toLowerCase();
            const rawPhone = member.phoneNo || member.phone || member.phone_number || '';
            const cleanMemberPhone = normalizePhoneDigits(rawPhone);

            return (
                fullName.includes(lowerQuery) ||
                christianName.includes(lowerQuery) ||
                (cleanTarget && (cleanMemberPhone.includes(cleanTarget) || cleanTarget.includes(cleanMemberPhone)))
            );
        });

        setFilteredMembers(results);
    }, [members]);

    const resetFilter = useCallback(() => {
        setFilteredMembers(members);
    }, [members]);

    const updateLocalMember = useCallback((id, updatedFields) => {
        setMembers((prev) =>
            prev.map((m) => ((m._id || m.id) === id ? { ...m, ...updatedFields } : m))
        );
        setFilteredMembers((prev) =>
            prev.map((m) => ((m._id || m.id) === id ? { ...m, ...updatedFields } : m))
        );
    }, []);

    return {
        members,
        filteredMembers,
        loading,
        error,
        searchMembers,
        resetFilter,
        updateLocalMember,
        refreshMembers: fetchMembers,
    };
}
