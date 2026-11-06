import React from 'react';
import { Navigate } from 'react-router-dom';

export default function DashboardRedirector() {
  let user = null;
  try {
    const raw = localStorage.getItem('user');
    if (raw && raw !== 'undefined') {
      user = JSON.parse(raw);
    }
  } catch {
    user = null;
  }

  const role = user?.role || '';
  const normalizedRole = role.toUpperCase();

  if (normalizedRole === 'ADMIN') return <Navigate to="/dashboard/admin" replace />;
  if (normalizedRole === 'PROPERTY_MANAGER' || normalizedRole === 'PROPERTYMANAGER' || role === 'PropertyManager') return <Navigate to="/dashboard/property" replace />;
  if (normalizedRole === 'TEACHER') return <Navigate to="/teacherDashboard" replace />;
  if (normalizedRole === 'EDUCATION_LEADER' || role === 'EducationHub' || normalizedRole === 'EDUCATIONHUB') return <Navigate to="/dashboard/education" replace />;
  if (normalizedRole === 'FINANCE_LEADER' || normalizedRole === 'FINANCE') return <Navigate to="/dashboard/finance" replace />;
  if (role) return <Navigate to="/dashboard/settings" replace />;

  return <Navigate to="/unauthorized" replace />;
}
