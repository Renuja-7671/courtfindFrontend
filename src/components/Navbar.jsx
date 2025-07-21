import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";


const NavigationBar = () => {
    const { isAuth, userRole, updateAuthState } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        updateAuthState();
        navigate("/login");
    };

    const fullStyle = {
        backgroundColor: "#0b162c",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        padding: "0 20px",
    };

    const navbarStyle = {
        backgroundColor: "#0b162c",
        borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
        padding: "5px 0",
    };

    const navLinkStyle = {
        color: "#fff",
        fontSize: "16px",
        margin: "0 12px",
        transition: "all 0.3s ease",
    };

    const navLinkHoverStyle = {
        color: "#1e90ff",
    };

    const actionButtonStyle = {
        padding: "6px 18px",
        borderRadius: "8px",
        fontWeight: "500",
    };

    return (
        <>
        <style>
        {`
        .nav-link {
            color: #fff;
            transition: color 0.3s ease;
        }

        .nav-link:hover {
            color: #1e90ff;
        }

        .btn-login:hover {
            background-color: #0056b3;
        }
        `}
        </style>
        <div style={fullStyle}>
            {/* Main Navbar */}
            <Navbar expand="lg" style={navbarStyle} variant="dark">
                <Container>
                    {/* Logo */}
                    <Navbar.Brand as={Link} to="/" className="me-auto">
                        <div style={{ paddingLeft: "20px" }}>
                            <img src="/assets/logo.png" alt="CourtFind Logo" style={{ height: "90px" }} />
                        </div>
                    </Navbar.Brand>


                    {/* Mobile Toggle */}
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <div style={{ paddingRight: "20px" }}>
                    <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                        <Nav className="me-3">
                            <Nav.Link as={Link} to="/about" style={navLinkStyle}>
                                About Us
                            </Nav.Link>
                            <Nav.Link as={Link} to="/contact" style={navLinkStyle}>
                                Contact Us
                            </Nav.Link>
                            <Nav.Link as={Link} to="/chatbot" style={navLinkStyle}>
                                AI Help
                            </Nav.Link>
                        </Nav>

                        <Nav>
                            {isAuth ? (
                                <>
                                    <Nav.Link
                                        as={Link}
                                        to={
                                            userRole === "Player"
                                                ? "/player-dashboard"
                                                : userRole === "Owner"
                                                ? "/owner-dashboard"
                                                : userRole === "Admin"
                                                ? "/admin-dashboard"
                                                : "/"
                                        }
                                        style={navLinkStyle}
                                    >
                                        Dashboard
                                    </Nav.Link>
                                    <Button
                                        variant="outline-light"
                                        style={{
                                            ...actionButtonStyle,
                                            border: "1px solid #dc3545",
                                            color: "#dc3545",
                                            backgroundColor: "transparent",
                                        }}
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Nav.Link as={Link} to="/signup" style={navLinkStyle}>
                                        Sign Up
                                    </Nav.Link>
                                    <Button
                                        as={Link}
                                        to="/login"
                                        style={{
                                            ...actionButtonStyle,
                                            backgroundColor: "#1e90ff",
                                            color: "#fff",
                                            border: "none",
                                        }}
                                    >
                                        Log In
                                    </Button>
                                </>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                    </div>
                </Container>
            </Navbar>

            {/* Second Navbar */}
            <Navbar expand="lg" style={navbarStyle} variant="dark">
                <Container>
                    <Nav>
                        <Nav.Link as={Link} to="/home" style={navLinkStyle}>
                            Home
                        </Nav.Link>
                        <Nav.Link as={Link} to="/explore-now" style={navLinkStyle}>
                            Explore Now
                        </Nav.Link>
                    </Nav>
                </Container>
            </Navbar>
        </div>
        </>
    );
};

export default NavigationBar;
