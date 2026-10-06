import { useState } from 'react';
import { userService } from '../services/userService';
import { toast } from 'react-toastify';

export const useRoleAssign = () => {
  const [loading, setLoading] = useState(false);

  const assignRole = async (userId, role) => {
    setLoading(true);
    try {
      await userService.assignRole(userId, role);
      toast.success(`Role ${role} assigned successfully`);
      return true;
    } catch (err) {
      toast.error(err.message || 'Failed to assign role');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createCredential = async (userData) => {
    setLoading(true);
    try {
      await userService.signup(userData);
      toast.success('Credentials generated successfully');
      return true;
    } catch (err) {
      toast.error(err.message || 'Failed to generate credentials');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { assignRole, createCredential, loading };
};
