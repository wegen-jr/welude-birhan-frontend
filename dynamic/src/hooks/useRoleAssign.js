import { useState } from 'react';
import { toast } from 'react-toastify';
import { userService } from '../services/userService';

// Optional helper if we still need to show local format visually, but not enforce it on submit
export const toLocalEthiopianPhone = (phoneStr) => {
    if (!phoneStr) return '';
    let digits = String(phoneStr).replace(/\D/g, '');
    if (digits.startsWith('251')) digits = digits.slice(3);
    if (!digits.startsWith('0')) digits = '0' + digits;
    return digits;
};

export const normalizeBackendRole = (role) => {
    if (!role) return 'USER';
    const trimmed = String(role).trim();
    if (trimmed === 'Finance Leader' || trimmed === 'FINANCE_LEADER' || trimmed === 'Finance' || trimmed === 'FINANCE') return 'Finance';
    if (trimmed === 'Property Manager' || trimmed === 'PROPERTY_MANAGER' || trimmed === 'PropertyManager' || trimmed === 'PROPERTYMANAGER') return 'PropertyManager';
    if (trimmed === 'Education Hub Admin' || trimmed === 'EDUCATION_LEADER' || trimmed === 'EducationHub' || trimmed === 'EDUCATIONHUB') return 'EducationHub';
    if (trimmed === 'Teacher / Instructor' || trimmed === 'TEACHER' || trimmed === 'Teacher') return 'Teacher';
    if (trimmed === 'Member User' || trimmed === 'MEMBER_USER') return 'MEMBER_USER';
    if (trimmed === 'User' || trimmed === 'USER') return 'USER';
    if (trimmed === 'Admin' || trimmed === 'ADMIN') return 'ADMIN';
    return trimmed;
};

export function useRoleAssign(onSuccess) {
    const [submitting, setSubmitting] = useState(false);

    const assignRole = async ({ member, phone, email, password, role }) => {
        if (!member) {
            toast.warning('Please select a member from the list first.');
            return false;
        }

        if (!phone) {
            toast.error('Invalid phone number. Phone number is required.');
            return false;
        }

        if (!email) {
            toast.error('Please enter an email address.');
            return false;
        }

        if (!password || password.length < 6) {
            toast.error('Password must be at least 6 characters.');
            return false;
        }

        const payload = {
            phone: phone, // exact phone string stored in the database
            email: email.trim(),
            password: password,
            role: normalizeBackendRole(role),
        };

        setSubmitting(true);
        try {
            const response = await userService.signupUser(payload);
            toast.success(`Role ${payload.role} assigned to ${member.fullname || member.name}!`);

            if (onSuccess) {
                onSuccess(member._id || member.id, { role: payload.role, email: payload.email });
            }
            return response;
        } catch (err) {
            toast.error(err.message || 'Failed to assign role');
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    return {
        assignRole,
        submitting,
    };
}
