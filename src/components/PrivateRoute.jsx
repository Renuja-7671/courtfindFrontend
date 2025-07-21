import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const PrivateRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const decodedToken = jwtDecode(token);
        //console.log("the decoded token is: ", decodedToken);
        if (!allowedRoles.includes(decodedToken.role)) {
            return <Navigate to="/login" replace />;
        }
        return <Outlet />;
    } catch (error) {
        return <Navigate to="/login" replace />;
    }
};

export default PrivateRoute;
