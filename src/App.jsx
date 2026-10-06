import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AppLayout } from './components/layout/AppLayout';

import { Dashboard } from './pages/admin/Dashboard';
import { SecretariatHub } from './pages/admin/SecretariatHub';
import { EducationHub } from './pages/admin/EducationHub';
import { ChoirHub } from './pages/admin/ChoirHub';
import { PRHub } from './pages/admin/PRHub';
import { FinanceHub } from './pages/admin/FinanceHub';

import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { StudentDashboard } from './pages/student/StudentDashboard';

function App() {
  // In a real app, this role would come from an auth context/hook.
  const currentRole = 'admin'; // 'admin', 'teacher', 'student'

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={`/${currentRole}`} replace />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AppLayout role="admin" />}>
          <Route index element={<Dashboard />} />
          <Route path="secretariat" element={<SecretariatHub />} />
          <Route path="education" element={<EducationHub />} />
          <Route path="choir" element={<ChoirHub />} />
          <Route path="pr" element={<PRHub />} />
          <Route path="finance" element={<FinanceHub />} />
        </Route>

        {/* Teacher Routes */}
        <Route path="/teacher" element={<AppLayout role="teacher" />}>
          <Route index element={<TeacherDashboard />} />
          {/* add more teacher routes here */}
        </Route>

        {/* Student Routes */}
        <Route path="/student" element={<AppLayout role="student" />}>
          <Route index element={<StudentDashboard />} />
          {/* add more student routes here */}
        </Route>

      </Routes>
      <ToastContainer theme="dark" position="bottom-right" />
    </BrowserRouter>
  );
}

export default App;
