import { useState, useEffect, useCallback } from 'react';
import { classService } from '../services/educationhub/classService';
import { toast } from 'react-toastify';

export const useAcademics = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await classService.getAssignedClasses();
      setClasses(data);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  }, []);

  const recordAttendance = async (classId, data) => {
    try {
      await classService.recordAttendance(classId, data);
      toast.success('Attendance recorded');
    } catch (err) {
      toast.error(err.message || 'Failed to record attendance');
    }
  };

  const submitGrades = async (classId, data) => {
    try {
      await classService.submitGrades(classId, data);
      toast.success('Grades submitted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to submit grades');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClasses();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchClasses]);

  return { classes, loading, fetchClasses, recordAttendance, submitGrades };
};
