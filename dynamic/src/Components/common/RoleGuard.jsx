import { Navigate, Outlet } from "react-router-dom";

export default function RoleGuard({ allowedRoles, children }) {
    let user = null;
    try {
        const raw = localStorage.getItem("user");
        if (raw && raw !== "undefined") {
            user = JSON.parse(raw);
        }
    } catch {
        user = null;
    }

    if (!user) {
        return <Navigate to="/signin" replace />;
    }

    const userRole = (user.role || '').trim();
    const hasRole = Array.isArray(allowedRoles) && allowedRoles.some(
        (role) => role.toUpperCase() === userRole.toUpperCase() || role === userRole
    );

    if (!hasRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children ? children : <Outlet />;
}