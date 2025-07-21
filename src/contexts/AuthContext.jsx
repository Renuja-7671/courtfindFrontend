import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

// Create AuthContext
const AuthContext = createContext();

// Provide authentication state to entire app
export const AuthProvider = ({ children }) => {
    const [isAuth, setIsAuth] = useState(!!localStorage.getItem("authToken"));
    const [userRole, setUserRole] = useState(null);

    // Function to update authentication state
    const updateAuthState = () => {
        const token = localStorage.getItem("authToken");
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserRole(decodedToken.role);
                setIsAuth(true);
                localStorage.setItem("userRole", decodedToken.role); // Store role in localStorage
            } catch (error) {
                console.error("Error decoding token:", error);
                setUserRole(null);
                setIsAuth(false);
            }
        } else {
            setIsAuth(false);
            setUserRole(null);
        }
    };

     // Function to log in user
     const login = (token) => {
        localStorage.setItem("authToken", token);
        updateAuthState();
    };

    // Function to log out user
    const logout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        setIsAuth(false);
        setUserRole(null);
    };

    useEffect(() => {
        updateAuthState();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuth, userRole, login, logout, updateAuthState }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth state
export const useAuth = () => useContext(AuthContext);
