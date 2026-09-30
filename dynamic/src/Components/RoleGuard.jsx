import { Navigate, Outlet } from "react-router-dom";

export default function RoleGuard({ allowedRoles }) {
    const user = JSON.parse(localStorage.getItem("user"));

    console.log("========== ROLE GUARD ==========");
    console.log("User:", user);
    console.log("User role:", user?.role);
    console.log("Allowed roles:", allowedRoles);
    console.log(
        "Authorized:",
        allowedRoles.includes(user?.role)
    );
    console.log("================================");

    if (!user) {
        return <Navigate to="/signin" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
}