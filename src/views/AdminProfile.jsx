import AdminLayout from "../components/AdminLayout";
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/AdminProfile.css";
import apiClient from "../services/adminApiService";

const AdminProfile = () => {
  // State to store user data
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  // States to track which field is being edited
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);

  // States for the new values being entered
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      console.log("Fetching user data...");
      const response = await apiClient.get('/admin/profile');
      console.log("User data received:", response.data);

      setUserData(response.data);

      // Set the new values to current values initially
      setNewFirstName(response.data.firstName || "");
      setNewLastName(response.data.lastName || "");
      setNewEmail(response.data.email || "");
    } catch (error) {
      console.error("Error fetching user data:", error);
      console.error("Error details:", error.response?.data || error.message);
    }
  };

  const handleSave = async () => {
    try {
      const updatedData = {
        firstName: editingName ? newFirstName : userData.firstName,
        lastName: editingName ? newLastName : userData.lastName,
        email: editingEmail ? newEmail : userData.email,
      };

      console.log("Sending update data:", updatedData);
      const response = await apiClient.put('/admin/profile', updatedData);
      console.log("Update response:", response.data);

      // Update the state with new values
      setUserData({
        ...userData,
        firstName: updatedData.firstName,
        lastName: updatedData.lastName,
        email: updatedData.email,
      });

      // Reset editing states
      setEditingName(false);
      setEditingEmail(false);

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      console.error("Error details:", error.response?.data || error.message);
      alert(
        "Failed to update profile: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  // Function to display full name
  const displayFullName = () => {
    if (userData.firstName && userData.lastName) {
      return `${userData.firstName} ${userData.lastName}`;
    } else if (userData.firstName) {
      return userData.firstName;
    } else if (userData.lastName) {
      return userData.lastName;
    } else {
      return "";
    }
  };

  return (
    <AdminLayout>
      <div className="admin-profile-container">
        <h1>My Admin Profile</h1>

        <div className="profile-content">
          <div className="profile-image">
            {/* Hardcoded image for now */}
            <img
              src="https://png.pngtree.com/png-vector/20220709/ourmid/pngtree-businessman-user-avatar-wearing-suit-with-red-tie-png-image_5809521.png"
              alt="Profile"
            />
          </div>

          <div className="profile-details">
            <div className="profile-field">
              <div className="field-label">Name</div>
              <div className="field-value">
                {editingName ? (
                  <div className="name-inputs">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={newFirstName}
                      onChange={(e) => setNewFirstName(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={newLastName}
                      onChange={(e) => setNewLastName(e.target.value)}
                    />
                  </div>
                ) : (
                  displayFullName()
                )}
              </div>
              <button
                className="update-btn"
                onClick={() => {
                  if (editingName) {
                    setNewFirstName(userData.firstName || "");
                    setNewLastName(userData.lastName || "");
                  }
                  setEditingName(!editingName);
                }}
              >
                {editingName ? "Cancel" : "Update"}
              </button>
            </div>

            <div className="profile-field">
              <div className="field-label">Email</div>
              <div className="field-value">
                {editingEmail ? (
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                ) : (
                  userData.email
                )}
              </div>
              <button
                className="update-btn"
                onClick={() => {
                  if (editingEmail) {
                    setNewEmail(userData.email || "");
                  }
                  setEditingEmail(!editingEmail);
                }}
              >
                {editingEmail ? "Cancel" : "Update"}
              </button>
            </div>
          </div>
        </div>

        {(editingName || editingEmail) && (
          <button className="save-btn" onClick={handleSave}>
            Save
          </button>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
