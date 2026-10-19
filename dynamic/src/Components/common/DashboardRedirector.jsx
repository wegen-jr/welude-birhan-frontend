import React from 'react';
import { Navigate } from 'react-router-dom';

export default function DashboardRedirector() {
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role || '';

  if (role === 'ADMIN') return <Navigate to="/dashboard/admin" replace />;
  if (role === 'EDUCATION_LEADER') return <Navigate to="/dashboard/education" replace />;
  if (role) return <Navigate to="/dashboard/settings" replace />;
  
  return <Navigate to="/unauthorized" replace />;
}
