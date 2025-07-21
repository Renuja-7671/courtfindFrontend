import React, { useEffect, useState } from "react";
import axios from "axios";
import logo from "/assets/logo.png"; 
import { useNavigate } from "react-router-dom";
import { Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; 
import apiClient from "../services/adminApiService";
import {
  FaHome,
  FaUsers,
  FaUserAlt,
  FaDollarSign,
  FaTags,
  FaBasketballBall,
  FaBug,
  FaStar,
  FaCog,
  FaSearch,
} from "react-icons/fa";

import { RiContactsLine } from "react-icons/ri";
import { FaCodePullRequest } from "react-icons/fa6";



import { NavLink } from "react-router-dom";

const SidebarLink = ({ to, icon, label, isSettings }) => {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 12px",
        borderRadius: "8px",
        textDecoration: "none",
        color: isActive ? "violet" : "white",
        backgroundColor: isActive ? "rgba(128, 0, 128, 0.1)" : "transparent",
      })}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "violet";
      }}
      onMouseLeave={(e) => {
        if (!e.currentTarget.classList.contains("active")) {
          e.currentTarget.style.color = "white";
        }
      }}
    >
      {icon}
      <span style={{ whiteSpace: "nowrap" }}>{label}</span>
    </NavLink>
  );
};

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const { isAuth } = useAuth();
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await apiClient.get("/admin/profile");
        
        setUserData({
          firstName: res.data.firstName,
          lastName: res.data.lastName,
        });
      } catch (err) {
        console.error("Error fetching admin profile:", err);
      }
    };

    fetchUserData();
  }, []);

  // Protect this layout
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // Map paths to titles
  const pageMeta = {
    "/admin-dashboard": {
      title: "Dashboard",
      icon: <FaHome />,
    },
    "/admin-owners": {
      title: "Arena Owners",
      icon: <FaUsers />,
    },
    "/admin-players": {
      title: "Players",
      icon: <FaUserAlt />,
    },
    "/admin-requests": {
      title: "Arena Requests",
      icon: <FaCodePullRequest />,
    },
    "/admin-profit": {
      title: "Profit Analysis",
      icon: <FaDollarSign />,
    },
    "/admin-pricing": {
      title: "Pricing",
      icon: <FaTags />,
    },
    "/admin-sports": {
      title: "Sports",
      icon: <FaBasketballBall />,
    },
    "/admin-messages": {
      title: "Contact Messages",
      icon: <RiContactsLine />,
    },
    "/admin-reviews": {
      title: "Reviews",
      icon: <FaStar />,
    },
    "/admin-profile": {
      title: "Account Settings",
      icon: <FaCog />,
    },
  };

  const currentMeta = pageMeta[location.pathname] || {
    title: "Admin Panel",
    icon: null,
  };

  const fullName = `${userData.firstName} ${userData.lastName}`;
  const avatar = "https://png.pngtree.com/png-vector/20220709/ourmid/pngtree-businessman-user-avatar-wearing-suit-with-red-tie-png-image_5809521.png"; //  hardcoded for now 

  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); 
    navigate("/login"); 
  };

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".profile-dropdown")) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#0a1120",
        color: "white",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "250px",
          padding: "20px",
          borderRight: "1px solid #1e293b",
        }}
      >
        <img
          src={logo}
          alt="Logo"
          style={{ width: "250px", marginBottom: "20px" }}
        />
        {/* 
        <input
          type="text"
          placeholder="Search for..."
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "none",
            outline: "none",
          }}
        />
        */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

          {/*Home button */}
          <Link
            to="/home"
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 12px",
              backgroundColor: "#38b1e0ff", // Light blue background
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "500",
              marginBottom: "0", // No extra margin to match SidebarLink
              border: "1px solid #76b9d6", // Added border for visibility
              transition: "background-color 0.3s, color 0.3s", // Smooth transitions
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#76b9d6"; // Slightly lighter blue on hover
              e.currentTarget.style.color = "#f0f8ff"; // Lighter text on hover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#38b1e0ff"; // Return to light blue
              e.currentTarget.style.color = "white"; // Return to white text
            }}
          >
            Home
          </Link>
          {/*Home button */}

          <SidebarLink
            to="/admin-dashboard"
            icon={<FaHome />}
            label="Dashboard"
          />
          <SidebarLink
            to="/admin-owners"
            icon={<FaUsers />}
            label="Arena Owners"
          />
          <SidebarLink
            to="/admin-players"
            icon={<FaUserAlt />}
            label="Players"
          />
          <SidebarLink
            to="/admin-requests"
            icon={<FaCodePullRequest />}
            label="Arena Requests"
          />
          <SidebarLink
            to="/admin-profit"
            icon={<FaDollarSign />}
            label="Profit Analysis"
          />
          <SidebarLink to="/admin-pricing" icon={<FaTags />} label="Pricing" />
          <SidebarLink to="/admin-sports" icon={<FaBasketballBall />} label="Sports" />
          <SidebarLink to="/admin-messages" icon={<RiContactsLine />} label="Contact Messages" />
          <SidebarLink to="/admin-reviews" icon={<FaStar />} label="Reviews" />

          {/* Divider Line */}
          <hr style={{ borderColor: "004377", margin: "10px 0" }} />

          <SidebarLink
            to="/admin-profile"
            icon={<FaCog />}
            label="Account Settings"
            isSettings
          />
          {/* Divider Line */}
          <hr style={{ borderColor: "004377", margin: "10px 0" }} />

          <div>
                <img
                  src={avatar}
                  alt="Profile"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
                <span>{fullName}</span>
              </div>


        </nav>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "20px" }}>
        {currentMeta && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            {/* Left: Title */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "white",
                fontSize: "24px",
                fontWeight: "600",
              }}
            >
              {currentMeta.icon}
              <h2 style={{ margin: 0 }}>{currentMeta.title}</h2>
            </div>

            {/* Right: Profile */}
            <div className="profile-dropdown" style={{ position: "relative" }}>
              <div
                onClick={toggleDropdown}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                  color: "white",
                }}
              >
                <img
                  src={avatar}
                  alt="Profile"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
                <span>{fullName}</span>
              </div>

              {dropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "45px",
                    right: 0,
                    backgroundColor: "#1e293b",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    padding: "10px",
                    zIndex: 10,
                  }}
                >
                  <button
                    onClick={handleLogout}
                    style={{
                      background: "none",
                      border: "none",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "14px",
                      padding: "5px 10px",
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div style={{ marginTop: "20px" }}>{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
