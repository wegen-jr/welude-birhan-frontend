import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layouts
import AdminLayout from '@/layouts/AdminLayout';
import HomeLayout from '@/layouts/HomeLayout';

// Common / Guards
import { RoleGuard, ProtectedRoute, DashboardRedirector } from '@/components/common';

// Admin Settings & Profile Subcomponents
import { Profile, Settings, EmailPasswordChanger } from '@/components/admin';

// Public Pages & Sections
import Home from '@/pages/Public/HomeSections/Home';
import AboutPillarsSection from '@/pages/Public/AboutPillarsSection';
import ProgramsSection from '@/pages/Public/ProgramsSection';
import GallerySection from '@/pages/Public/GallerySection';
import ContactSection from '@/pages/Public/ContactSection';

// Auth Pages
import SignIn from '@/pages/auth/SignIn';
import SignUp from '@/pages/auth/SignUP';

// CMS Pages
import CmsDashboard from '@/pages/CMS/CmsDashboard';

// Admin & Departmental Hubs
import Dashboard from '@/pages/admin/Dashboard';
import Registration from '@/pages/admin/Registration';
import RoleAssignment from '@/pages/admin/RoleAssignment';
import AuditLogs from '@/pages/admin/AuditLogs';
import { ChoirHub } from '@/pages/admin/ChoirHub';
import { EducationHub } from '@/pages/admin/EducationHub';
import StudentEnrollment from '@/pages/admin/StudentEnrollment';
import SundaySchoolDashboard from '@/pages/admin/SundaySchool/SundaySchoolDashboard';
import { FinanceHub } from '@/pages/admin/FinanceHub';
import { PRHub } from '@/pages/admin/PRHub';
import { SecretariatHub } from '@/pages/admin/SecretariatHub';
import { TeacherDashboard } from '@/pages/teacher/TeacherDashboard';
import { StudentDashboard } from '@/pages/student/StudentDashboard';
import TeacherManagementPage from '@/pages/admin/TeacherManagementPage';
import CourseManagementPage from '@/pages/admin/CourseManagementPage';

function App() {
  const allRoles = ["ADMIN", "TEACHER", "STUDENT", "CHOIR_LEADER", "EDUCATION_LEADER", "FINANCE_LEADER", "PR_LEADER", "SECRETARIAT_LEADER"];
  
  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route element={<HomeLayout />} >
          <Route path='/' element={<Home />} />
          <Route path="/about-pillars" element={<AboutPillarsSection />} />
          <Route path="/programs" element={<ProgramsSection />} />
          <Route path="/gallery-testimonials" element={<GallerySection />} />
          <Route path="/contact" element={<ContactSection />} />
        </Route>
        <Route path="/signin" element={<SignIn />} />
        <Route element={<ProtectedRoute />}>
          
          <Route element={<RoleGuard allowedRoles={allRoles} />}>
            <Route path="/dashboard" element={<AdminLayout />}>
              <Route index element={<DashboardRedirector />} />
              <Route path="admin" element={<RoleGuard allowedRoles={["ADMIN"]}><Dashboard /></RoleGuard>} />
              <Route path="registration" element={<RoleGuard allowedRoles={["ADMIN"]}><Registration /></RoleGuard>} />
              <Route path="roleAssignemet" element={<RoleGuard allowedRoles={["ADMIN"]}><RoleAssignment /></RoleGuard>} />
              <Route path="audit-logs" element={<RoleGuard allowedRoles={["ADMIN"]}><AuditLogs /></RoleGuard>} />
              <Route path="settings" element={<Settings />} />
              <Route path="settings/profile" element={<Profile />} />
              <Route path="settings/credentialsChanger" element={<EmailPasswordChanger />} />

              <Route path="teacher" element={<RoleGuard allowedRoles={["ADMIN", "TEACHER"]}><TeacherDashboard /></RoleGuard>} />
              <Route path="student" element={<RoleGuard allowedRoles={["ADMIN", "STUDENT"]}><StudentDashboard /></RoleGuard>} />
              <Route path="choir" element={<RoleGuard allowedRoles={["ADMIN", "CHOIR_LEADER"]}><ChoirHub /></RoleGuard>} />
              <Route path="education" element={<RoleGuard allowedRoles={["ADMIN", "EDUCATION_LEADER"]}><EducationHub /></RoleGuard>} />
              <Route path="teachers" element={<RoleGuard allowedRoles={["ADMIN", "EDUCATION_LEADER"]}><TeacherManagementPage /></RoleGuard>} />
              <Route path="courses" element={<RoleGuard allowedRoles={["ADMIN", "EDUCATION_LEADER"]}><CourseManagementPage /></RoleGuard>} />
              <Route path="student-enrollment" element={<RoleGuard allowedRoles={["ADMIN", "EDUCATION_LEADER"]}><StudentEnrollment /></RoleGuard>} />
              <Route path="sunday-school" element={<RoleGuard allowedRoles={["ADMIN", "EDUCATION_LEADER"]}><SundaySchoolDashboard /></RoleGuard>} />
              <Route path="finance" element={<RoleGuard allowedRoles={["ADMIN", "FINANCE_LEADER"]}><FinanceHub /></RoleGuard>} />
              <Route path="pr" element={<RoleGuard allowedRoles={["ADMIN", "PR_LEADER"]}><PRHub /></RoleGuard>} />
              <Route path="secretariat" element={<RoleGuard allowedRoles={["ADMIN", "SECRETARIAT_LEADER"]}><SecretariatHub /></RoleGuard>} />
            </Route>
          </Route>
          
          <Route element={<RoleGuard allowedRoles={["MEMBER_USER"]} />}>
            <Route path="/media" element={<CmsDashboard />} />
          </Route>
          
          <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Route>
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  );
}

export default App;
