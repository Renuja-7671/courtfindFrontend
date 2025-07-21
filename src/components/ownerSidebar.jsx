import React, { useState, useEffect } from "react";
import { Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { FaTachometerAlt, FaUser, FaCalendarAlt, FaPlusCircle, FaChartLine, FaCog } from "react-icons/fa";
import { FaCodePullRequest } from "react-icons/fa6";
import { getOwnerProfile, getProfileImage } from "../services/ownerAuthService";
import { useAuth } from "../contexts/AuthContext";

const Sidebar = () => {
    const location = useLocation();
    const { authToken } = useAuth();
    const [profile, setProfile] = useState({
            firstName: "",
            lastName: "",
            email: "",
            mobile: "",
            country: "",
            province: "",
            zip: "",
            address: "",
        });
    const [profileImage, setProfileImage] = useState(null);
    useEffect(() => {
            const fetchProfile = async () => {
                try {
                    const data = await getOwnerProfile(authToken);
                    setProfile(data);
                    const imageUrl = await getProfileImage(authToken);
                    setProfileImage(`${process.env.REACT_APP_API_BASE_URL}${imageUrl}`);
                } catch (error) {
                    console.error("Error fetching profile:", error);
                }
            };
    
            fetchProfile();
        }, [authToken]);

    const menuItems = [
        { path: "/owner-dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
        { path: "/arena-bookings", label: "Arena Bookings", icon: <FaCalendarAlt /> },
        { path: "/manage-arenas", label: "Manage My Arenas", icon: <FaUser /> },
        { path: "/add-arena", label: "Add Arena", icon: <FaPlusCircle /> },
        { path: "/owner-requests", label: "Requests", icon: <FaCodePullRequest /> },
        { path: "/my-profit", label: "My Profits", icon: <FaChartLine /> },
        { path: "/owner-profile", label: "Account Settings", icon: <FaCog /> },
    ];

    return (
        <>
        <div className="sidebar d-flex flex-column p-3">
            <Nav className=" sidebar-full flex-column">
                {menuItems.map((item, index) => (
                    <Nav.Item key={index}>
                        <Nav.Link 
                            as={Link} 
                            to={item.path} 
                            className={`sidebar-link d-flex align-items-center ${location.pathname === item.path ? "active" : ""} `}
                        >
                            {item.icon} <span className="ms-2">{item.label}</span>
                        </Nav.Link>
                    </Nav.Item>
                ))}
            </Nav>
            <hr className="divider" />
            <div className="sidebar-info d-flex align-items-center">
                <img src={profileImage} alt="Profile" className="profile-pic me-2" roundedCircle style={{ height: "60px", width: "30%", objectFit: "cover" }}/>
                <h5 className="sidebar-name">{profile.firstName} {profile.lastName}</h5>
            </div>
        </div>
        <style>
            {`
            .sidebar { 
                background-color: rgba(206, 221, 251, 1); /* Light blue */
                padding: 15px;
                height: 80vh;
                width: 250px;
                display: flex-start;
                flex-direction: column;
                border-radius: 15px; }

            .sidebar-full {
                display: flex;
                flex-direction: column;
                gap: 10px; }

            .sidebar-link { 
                padding: 15px 15px; 
                color: #333; 
                font-size: 16px; 
                text-decoration: none; 
                display: flex; 
                align-items: center; }

            .sidebar-link:hover { 
                background-color: rgba(0, 0, 255, 0.1); 
                border-radius: 5px; }

            .sidebar-link.active { 
                background-color:rgba(0, 0, 255, 0.7); 
                color: white !important; 
                border-radius: 5px; }

            .divider {
                margin: 10px 0;
                border-top: 1px solid #000000;}
            
            .sidebar-info {
                display: flex;
                align-items: center;
                padding: 10px 1px;
                gap: 10px;}
            
            .sidebar-name {
                font-size: 18px;
                color: #333;}

            .profile-pic {
                border-radius: 50%;
                width: 60px;
                height: 60px;
            }
            `}
        </style>
'
        </>
    );
};

export default Sidebar;
