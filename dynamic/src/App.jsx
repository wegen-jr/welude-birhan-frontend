// src/App.jsx
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from './pages/auth/SignIn';
import SignUp from "./pages/auth/SignUP";
import Registration from "./pages/admin/Registration";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./pages/admin/Dashboard";
import ProtectedRoute from "./Components/ProtectedRoute";
import RoleGuard from "./Components/RoleGuard";
import AdminLayout from "./Layout/AdminLayout";
import RoleAssignment from "./pages/admin/RoleAssignment";
import Profile from './Components/admin/Profile';
import Settings from "./Components/admin/Settings";
import EmailPasswordChanger from "./Components/admin/EmailPasswordChanger";
import HomeLayout from './Layout/HomeLayout';
import Home from './pages/Public/HomeSections/Home';
import AboutPillarsSection from './pages/Public/AboutPillarsSection';
import ProgramsSection from './pages/Public/ProgramsSection';
import GallerySection from './pages/Public/GallerySection';
import ContactSection from './pages/Public/ContactSection';
import CmsDashboard from './pages/CMS/CmsDashboard';

function App() {
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
          <Route element={<RoleGuard allowedRoles={["ADMIN"]} />}>
            <Route path="/dashboard" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="registration" element={<Registration />} />
              <Route path="roleAssignemet" element={<RoleAssignment />} />
              <Route path="settings" element={<Settings />} />
              <Route path="settings/profile" element={<Profile />} />
              <Route path="settings/credentialsChanger" element={<EmailPasswordChanger />} />
            </Route>
          </Route>
          <Route element={<RoleGuard allowedRoles={["MEMBER_USER"]} />}>
            <Route path="/media" element={<CmsDashboard />}>
            </Route>
          </Route>
          <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;