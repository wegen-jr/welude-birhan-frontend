import { useState, useEffect, useCallback } from 'react';
import { memberService } from '../services/memberService';
import { toast } from 'react-toastify';

export const useMembers = (initialParams = {}) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMembers = useCallback(async (params = initialParams) => {
    setLoading(true);
    try {
      const data = await memberService.getAll(params);
      setMembers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  }, []);

  const approveMember = async (id) => {
    try {
      await memberService.approve(id);
      toast.success('Member approved successfully');
      fetchMembers();
    } catch (err) {
      toast.error(err.message || 'Failed to approve member');
    }
  };

  const rejectMember = async (id) => {
    try {
      await memberService.reject(id);
      toast.success('Member rejected');
      fetchMembers();
    } catch (err) {
      toast.error(err.message || 'Failed to reject member');
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return { members, loading, error, fetchMembers, approveMember, rejectMember };
};
