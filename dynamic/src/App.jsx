// src/App.jsx
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from './pages/auth/SignIn';
import SignUp from "./pages/auth/SignUP";
import Registration from "./pages/admin/Registration";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./pages/admin/Dashboard";
import ProtectedAdmin from "./Components/ProtectedAdmin";
import AdminLayout from "./Layout/AdminLayout";
import RoleAssignment from "./pages/admin/RoleAssignment";
import Profile from './Components/Profile';
import Settings from "./Components/Settings";
import EmailPasswordChanger from "./Components/EmailPasswordChanger";
function App() {
  return (
    <Router>
       <ToastContainer/>
      <Routes>
        
          <Route path="/" element={<SignIn />} />
          <Route path="/signUp" element={<SignUp />} />

        <Route element={<ProtectedAdmin />}>
          <Route path='/dashboard' element={<AdminLayout />}>
             <Route index element={<Dashboard/>} />    
             <Route path="registration" element={<Registration/>} />
             <Route path="roleAssignemet" element={<RoleAssignment/>}/>
             <Route path='settings' element={<Settings/>}/>
             <Route path='settings/profile' element={<Profile/>}/>
             <Route path='settings/credentialsChanger' element={<EmailPasswordChanger/>}/>
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;