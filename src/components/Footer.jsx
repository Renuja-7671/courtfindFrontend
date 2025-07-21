import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

const Footer = () => {
    const wrapperStyle = {
        backgroundColor: "#0b162c",
        padding: "20px 50px 10px", // Reduced vertical padding
        color: "#ffffff",
        fontSize: "14px",
    };

    const logoStyle = {
        height: "80px", // Slightly smaller logo
        marginBottom: "10px",
    };

    const sectionTitle = {
        fontSize: "16px",
        fontWeight: "600",
        marginBottom: "12px",
        color: "#ffffff",
    };

    const linkStyle = {
        color: "#ccc",
        textDecoration: "none",
        display: "block",
        marginBottom: "8px",
        transition: "color 0.3s",
    };

    const linkHoverStyle = {
        color: "#ffffff",
    };

    const buttonStyle = {
        backgroundColor: "#007bff",
        border: "none",
        padding: "6px 15px",
        marginTop: "10px",
    };

    const copyrightStyle = {
        textAlign: "center",
        fontSize: "12px",
        marginTop: "20px",
        color: "#aaa",
    };

    return (
        <div style={wrapperStyle}>
            <Container className="text-center text-white">
                <Row className="d-flex justify-content-center align-items-start">
                    <Col
                        md={4}
                        style={{ transform: "translateX(-20px)" }}
                    >
                        <img src="/assets/logo.png" alt="CourtFind Logo" style={logoStyle} />
                        <p style={{ marginBottom: "8px" }}>Sign up and connect with us.</p>
                        <Button
                            as={Link}
                            to="/signup"
                            variant="primary"
                            style={buttonStyle}
                        >
                            Sign Up
                        </Button>

                        <div style={{ marginTop: "15px" }}>
                            <FaFacebookF style={{ marginRight: 10 }} />
                            <FaInstagram style={{ marginRight: 10 }} />
                            <FaTwitter />
                        </div>
                    </Col>

                    <Col md={4} style={{ marginTop: "20px" }}>
                        <h6 style={sectionTitle}>About</h6>
                        <Link to="/about" style={linkStyle} onMouseOver={(e) => e.target.style.color = linkHoverStyle.color} onMouseOut={(e) => e.target.style.color = linkStyle.color}>About Us</Link>
                        <Link to="/blog" style={linkStyle} onMouseOver={(e) => e.target.style.color = linkHoverStyle.color} onMouseOut={(e) => e.target.style.color = linkStyle.color}>Blog</Link>
                        <Link to="/careers" style={linkStyle} onMouseOver={(e) => e.target.style.color = linkHoverStyle.color} onMouseOut={(e) => e.target.style.color = linkStyle.color}>Careers</Link>
                    </Col>

                    <Col
                        md={4}
                        style={{ marginTop: "15px" }} // Push last column downward
                    >
                        <h6 style={sectionTitle}>Support</h6>
                        <Link to="/contact" style={linkStyle} onMouseOver={(e) => e.target.style.color = linkHoverStyle.color} onMouseOut={(e) => e.target.style.color = linkStyle.color}>Contact Us</Link>
                        <Link to="/chatbot" style={linkStyle} onMouseOver={(e) => e.target.style.color = linkHoverStyle.color} onMouseOut={(e) => e.target.style.color = linkStyle.color}>Help Centre</Link>
                    </Col>
                </Row>

                <hr style={{ backgroundColor: "#ffffff", opacity: 0.2, margin: "20px 0 10px" }} />

                <Row>
                    <Col>
                        <p style={copyrightStyle}>
                            © 2025 | CourtFind Web Solutions &nbsp;|&nbsp; Reg No. 620250204651231
                        </p>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Footer;
