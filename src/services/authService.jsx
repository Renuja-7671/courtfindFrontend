import api from "./api";
import { useAuth } from "../contexts/AuthContext"; // Use global auth state



// Register a New User
export const registerUser = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData);
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Register Error:", error); // Debugging line
  }
};

// Login User
export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials);

    if (!response.data || !response.data.token) {
      throw new Error("Token not received from server!");
    }
    // Save the token to local storage
    localStorage.setItem("token", response.data.token);

    return response.data;
  } catch (error) {
    console.error("Login Error:", error.response?.data || error.message || "Login failed");
    throw error;
  }
};


// Logout User
export const logoutUser = () => {
  const { updateAuthState } = useAuth();
  //console.log("Logging out and removing token"); // Debugging line
  localStorage.removeItem("token"); // Remove token from storage
  updateAuthState();

};

// Check if User is Authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  //console.log("Is user authenticated?", !!token); // Debugging line
  return !!token; // Returns true if token exists
};

// Forgot password
export const forgotPassword = async (email) => {
    try {
        const response = await api.post("/auth/forgot-password", { email });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Something went wrong. Try again.";
    }
};

// Reset password page
export const resetPassword = async (password, token) => {
    try {
        const response = await api.post("/auth/reset-password", { password, token });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Password reset failed";
    }
};

// Owner change password
export const changePassword = async (currentPassword, newPassword) => {
  try {
      const response = await api.put("/owner/change-password", { currentPassword, newPassword });
      return response.data;
  } catch (error) {
      throw error.response?.data?.message || "Failed to change password";
    }
};