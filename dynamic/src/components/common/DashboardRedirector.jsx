import React from 'react';
import { Navigate } from 'react-router-dom';

export default function DashboardRedirector() {
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role || '';

  if (role === 'ADMIN') return <Navigate to="/dashboard/admin" replace />;
  if (role === 'TEACHER') return <Navigate to="/dashboard/teacher" replace />;
  if (role === 'STUDENT') return <Navigate to="/dashboard/student" replace />;
  if (role === 'CHOIR_LEADER') return <Navigate to="/dashboard/choir" replace />;
  if (role === 'EDUCATION_LEADER') return <Navigate to="/dashboard/education" replace />;
  if (role === 'FINANCE_LEADER') return <Navigate to="/dashboard/finance" replace />;
  if (role === 'PR_LEADER') return <Navigate to="/dashboard/pr" replace />;
  if (role === 'SECRETARIAT_LEADER') return <Navigate to="/dashboard/secretariat" replace />;
  
  return <Navigate to="/unauthorized" replace />;
}
