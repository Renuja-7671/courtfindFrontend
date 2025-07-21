import React, { useState } from "react";
import { changePassword } from "../services/playerAuthService";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Alert, Row, Col, InputGroup ,ProgressBar} from "react-bootstrap";
import { FaRegEye } from "react-icons/fa6";
import { FaRegEyeSlash } from "react-icons/fa6";
import Sidebar from "../components/playerSidebar";

const PlayerChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [variant, setVariant] = useState("danger"); // Alert type
    const navigate = useNavigate();
    const [passwordStrength, setPasswordStrength] = useState({ label: "", variant: "", percent: 0 });

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage("New passwords do not match");
            setVariant("danger");
            return;
        }

        // ✅ Declare password rules FIRST
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
    const isLongEnough = newPassword.length >= 8;

         // Validate password strength
        if (!(hasUpper && hasLower && hasNumber && hasSpecial && isLongEnough)) {
        setMessage("Password must include uppercase, lowercase, number, special character and be at least 8 characters long.");
        setVariant("danger");
        return;
        
    }
        try {
            await changePassword(currentPassword, newPassword);
            setMessage("Password changed successfully!");
            setVariant("success");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            setTimeout(() => navigate("/player-dashboard"), 2000); // Redirect after success
        } catch (error) {
            setMessage(error?.response?.data?.message || "Failed to change password.");
            setVariant("danger");
        } 
    };

        const getPasswordStrength = (password) => {
        let strength = 0;

        if (password.length >= 8) strength++; // Length
        if (/[A-Z]/.test(password)) strength++; // Uppercase letter
        if (/[a-z]/.test(password)) strength++; // Lowercase letter
        if (/[0-9]/.test(password)) strength++; // Number
        if (/[^A-Za-z0-9]/.test(password)) strength++; // Special character

        if (strength <= 2) return { label: "Weak", variant: "danger", percent: 33 };
        if (strength === 3 || strength === 4) return { label: "Moderate", variant: "warning", percent: 66 };
        if (strength === 5) return { label: "Strong", variant: "success", percent: 100 };
        };

    return (
        <Container className="min-vh-100 d-flex flex-column  align-items-center">
                <Row className="w-100" text-center>
                <Col className="p-4 m-0"  md={3}>
                    <Sidebar />
                </Col>
                <Col className="p-4 m-0"  md={2}>
                </Col>
                <Col md={6} lg={5} className="p-4 m-0 align-self-center justify-content-center">
                    <div className="p-4 shadow-sm border rounded">
                        <h2 className="mb-4">Change Password</h2>
                        {message && <Alert variant={variant}>{message}</Alert>}
                        <Form onSubmit={handleChangePassword}>

                            <Form.Group className="mb-3" controlId="currentPassword">
                                <Form.Label>Current Password</Form.Label>
                                <InputGroup>
                                <Form.Control
                                    type={showCurrentPassword ? "text" : "password"}
                                    placeholder="Current Password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                                <Button 
                                    variant="light" 
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                    {showCurrentPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                                </Button>
                                </InputGroup>
                            </Form.Group>


                            <Form.Group className="mb-3" controlId="newPassword">
                                <Form.Label>New Password</Form.Label>
                                <InputGroup>
                                <Form.Control
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setNewPassword(value);
                                        setPasswordStrength(getPasswordStrength(value));
                                    }}
                                    required
                                />
                                <Button 
                                    variant="light" 
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                                </Button>
                                </InputGroup>
                                {newPassword && (
                                    <ProgressBar
                                        striped
                                        now={passwordStrength.percent}
                                        variant={passwordStrength.variant}
                                        className="mt-2"
                                        label={passwordStrength.label}
                                    />
                                )}
                                <Form.Text>
                                    Use at least 8 characters, including uppercase, lowercase, numbers, and symbols.
                                </Form.Text>
                            </Form.Group>


                            <Form.Group className="mb-3" controlId="confirmPassword">
                                <Form.Label>Confirm Password</Form.Label>
                                <InputGroup>
                                <Form.Control
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <Button 
                                    variant="light" 
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                                </Button>
                                </InputGroup>
                            </Form.Group>
                            <br />

                            <Button variant="primary" type="submit">
                                Save
                            </Button>
                        </Form>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default PlayerChangePassword;