// src/App.jsx
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Auth & Common
import SignIn from './pages/auth/SignIn';
import ProtectedRoute from "./Components/common/ProtectedRoute";
import RoleGuard from "./Components/common/RoleGuard";
import DashboardRedirector from "./Components/common/DashboardRedirector";

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
// import Home from './pages/Public/HomeSections/Home';
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
import { EducationHub } from './pages/admin/EducationHub';
import StudentEnrollment from './pages/admin/StudentEnrollment';
import TeacherManagementPage from './pages/admin/TeacherManagementPage';
import CourseManagementPage from './pages/admin/CourseManagementPage';
import PropertyManagementPage from './pages/admin/PropertyManagementPage';
import FinanceManagementPage from './pages/admin/FinanceManagementPage';

function App() {
  const allRoles = ["ADMIN", "TEACHER", "Teacher", "STUDENT", "CHOIR_LEADER", "EDUCATION_LEADER", "EducationHub", "FINANCE_LEADER", "PR_LEADER", "SECRETARIAT_LEADER"];

  return (
    <Router>
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        <Route element={<HomeLayout />} >
          {/* <Route path='/' element={<Home />} /> */}
          <Route path="/about" element={<About />} />
          <Route path="/gallery" element={<PublicGallery />} />
          <Route path="/events" element={<PublicEvents />} />
          <Route path="/testimonials" element={<PublicTestimonials />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        <Route path="/signin" element={<SignIn />} />
        <Route path="/sign in" element={<Navigate to="/signin" replace />} />
        <Route path="/sign%20in" element={<Navigate to="/signin" replace />} />
        <Route path="/signIn" element={<Navigate to="/signin" replace />} />
        <Route path="/SignIn" element={<Navigate to="/signin" replace />} />
        <Route path="/login" element={<Navigate to="/signin" replace />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Teacher Dashboard route (displays 404 while teacher dashboard is developed on separate branch) */}
          <Route path="/dashboard/teacher" element={<div className="min-h-screen bg-[#081226] text-white flex items-center justify-center text-xl">404 Not Found</div>} />
          <Route path="/teacherDashboard" element={<Navigate to="/dashboard/teacher" replace />} />

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
              <Route path="settings" element={<Settings />} />
              <Route path="settings/profile" element={<Profile />} />
              <Route path="settings/credentialsChanger" element={<EmailPasswordChanger />} />

              <Route path="education" element={<RoleGuard allowedRoles={["ADMIN", "EDUCATION_LEADER"]}><EducationHub /></RoleGuard>} />
              <Route path="teachers" element={<RoleGuard allowedRoles={["ADMIN", "EDUCATION_LEADER"]}><TeacherManagementPage /></RoleGuard>} />
              <Route path="courses" element={<RoleGuard allowedRoles={["ADMIN", "EDUCATION_LEADER"]}><CourseManagementPage /></RoleGuard>} />
              <Route path="student-enrollment" element={<RoleGuard allowedRoles={["ADMIN", "EDUCATION_LEADER"]}><StudentEnrollment /></RoleGuard>} />
              <Route path="property" element={<RoleGuard allowedRoles={["ADMIN", "FINANCE_LEADER"]}><PropertyManagementPage /></RoleGuard>} />
              <Route path="finance" element={<RoleGuard allowedRoles={["ADMIN", "FINANCE_LEADER"]}><FinanceManagementPage /></RoleGuard>} />
            </Route>
          </Route>

          {/* CMS / Media Dashboard (from latest update) */}
          <Route element={<RoleGuard allowedRoles={["MEMBER_USER", "ADMIN"]} />}>
            <Route path="/mediaDashboard" element={<CMSlayout />}>
              <Route index element={<CMSDashboard />} />
              <Route path='gallery' element={<Gallery />} />
              <Route path='events' element={<Events />} />
              <Route path='testimonials' element={<Testimonials />} />
            </Route>
          </Route>

        </Route>

        <Route path="/unauthorized" element={<div className="min-h-screen bg-[#081226] text-white flex items-center justify-center text-xl">Unauthorized Access</div>} />
        <Route path="*" element={<div className="min-h-screen bg-[#081226] text-white flex items-center justify-center text-xl">404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;