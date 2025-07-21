import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Button, Container, Row, Col, Alert, InputGroup, ProgressBar } from "react-bootstrap";
import { resetPassword } from "../services/authService";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const ResetPasswordPage = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [passwordStrength, setPasswordStrength] = useState({ label: "", variant: "", percent: 0 });

    const navigate = useNavigate();
    const { token } = useParams(); // Get token from URL

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage("");

        if (password !== confirmPassword) {
            setMessage("Passwords do not match");
            return;
        }

        try {
            const response = await resetPassword(password, token);
            setMessage("Password reset successful! Redirecting...");

            setTimeout(() => navigate("/login"), 2000);
        } catch (error) {
            setMessage(error);
        }
    };

    const getPasswordStrength = (password) => {
        let strength = 0;

        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        if (strength <= 2) return { label: "Weak", variant: "danger", percent: 33 };
        if (strength === 3 || strength === 4) return { label: "Moderate", variant: "warning", percent: 66 };
        if (strength === 5) return { label: "Strong", variant: "success", percent: 100 };
    };

    return (
        <Container className="min-vh-100 d-flex justify-content-center align-items-center">
            <Row className="w-100 justify-content-center">
                <Col md={6} lg={4}>
                    <div className="p-4 shadow-sm border rounded">
                        <h2 className="text-left mb-4">Reset Password</h2>
                        <Form onSubmit={handleResetPassword}>
                            <Form.Group controlId="formPassword">
                                <Form.Label>New Password</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="Enter new password"
                                        value={password}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setPassword(value);
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
                                {password && (
                                    <ProgressBar
                                        striped
                                        className="mt-2"
                                        now={passwordStrength.percent}
                                        variant={passwordStrength.variant}
                                        label={passwordStrength.label}
                                    />
                                )}
                                <Form.Text muted>
                                    Use at least 8 characters, including uppercase, lowercase, numbers, and symbols.
                                </Form.Text>
                            </Form.Group>
                            <br />
                            <Form.Group controlId="formConfirmPassword">
                                <Form.Label>Confirm Password</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm new password"
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

                            <Button variant="primary" type="submit" className="w-100 mt-3">
                                Reset Password
                            </Button>
                        </Form>

                        <p className="text-justify mt-3">
                            By resetting your password, you agree to the CourtFind Terms of Use and Privacy Policy.
                        </p>

                        {message && <Alert variant={message.includes("failed") ? "danger" : "success"}>{message}</Alert>}
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default ResetPasswordPage;
