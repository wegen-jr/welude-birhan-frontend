import { Outlet, Navigate } from "react-router-dom";

export default function ProtectedAdmin() {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
}