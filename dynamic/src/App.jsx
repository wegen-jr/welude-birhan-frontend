// src/App.jsx
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Auth & Common
import SignIn from './pages/auth/SignIn';
import ProtectedRoute from "./Components/ProtectedRoute";
import RoleGuard from "./Components/RoleGuard";
import DashboardRedirector from "./Components/DashboardRedirector";

// Layouts
import AdminLayout from "./Layout/AdminLayout";
import HomeLayout from './Layout/HomeLayout';
import CMSlayout from './Layout/CMSlayout';

// Admin / Profile / Settings
import Dashboard from "./pages/admin/Dashboard";
import Registration from "./pages/admin/Registration";
import RoleAssignment from "./pages/admin/RoleAssignment";
import Profile from './Components/admin/Profile';
import Settings from "./Components/admin/Settings";
import EmailPasswordChanger from "./Components/admin/EmailPasswordChanger";

// Public Pages (from latest update)
import Home from './pages/Public/HomeSections/Home';
import About from './pages/Public/About';
import Contact from './pages/Public/Contact';
import PublicGallery from './pages/Public/PublicGallery';
import PublicEvents from './pages/Public/PublicEvents';
import PublicTestimonials from './pages/Public/PublicTestimonials';

// CMS Pages (from latest update)
import CMSDashboard from './pages/CMS/Dashboard';
import Gallery from './pages/CMS/Gallery';
import Events from './pages/CMS/Events';
import Testimonials from './pages/CMS/Testimonials';

// Academic & Departmental Hubs
import AuditLogs from './pages/admin/AuditLogs';
import { ChoirHub } from './pages/admin/ChoirHub';
import { EducationHub } from './pages/admin/EducationHub';
import StudentEnrollment from './pages/admin/StudentEnrollment';
import SundaySchoolDashboard from './pages/admin/SundaySchool/SundaySchoolDashboard';
import { FinanceHub } from './pages/admin/FinanceHub';
import { PRHub } from './pages/admin/PRHub';
import { SecretariatHub } from './pages/admin/SecretariatHub';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { StudentDashboard } from './pages/student/StudentDashboard';
import TeacherManagementPage from './pages/admin/TeacherManagementPage';
import CourseManagementPage from './pages/admin/CourseManagementPage';

function App() {
  const allRoles = ["ADMIN", "TEACHER", "STUDENT", "CHOIR_LEADER", "EDUCATION_LEADER", "FINANCE_LEADER", "PR_LEADER", "SECRETARIAT_LEADER"];

  return (
    <Router>
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        <Route element={<HomeLayout />} >
          <Route path='/' element={<Home />} />
          <Route path="/about" element={<About />} /> 
          <Route path="/gallery" element={<PublicGallery />} />
          <Route path="/events" element={<PublicEvents />} />
          <Route path="/testimonials" element={<PublicTestimonials />} />
          <Route path="/contact" element={<Contact/>} />
        </Route>

        <Route path="/signin" element={<SignIn />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Admin Dashboard legacy route alias */}
          <Route element={<RoleGuard allowedRoles={["ADMIN"]} />}>
            <Route path="/adminDashboard" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="registration" element={<Registration />} />
              <Route path="roleAssignemet" element={<RoleAssignment />} />
              <Route path="settings" element={<Settings />} />
              <Route path="settings/profile" element={<Profile />} />
              <Route path="settings/credentialsChanger" element={<EmailPasswordChanger />} />
            </Route>
          </Route>

          {/* Unified Dashboard for all departmental roles */}
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

          {/* CMS / Media Dashboard (from latest update) */}
          <Route element={<RoleGuard allowedRoles={["MEMBER_USER", "ADMIN"]} />}>
            <Route path="/mediaDashboard" element={<CMSlayout />}>
              <Route index element={<CMSDashboard />} />
              <Route path='gallery' element={<Gallery/>} />
              <Route path='events' element={<Events/>}/>
              <Route path='testimonials' element={<Testimonials/>}/>
            </Route>
          </Route>

          <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;