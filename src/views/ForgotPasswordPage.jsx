import React, { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../services/authService";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        try {
            const response = await forgotPassword(email);
            setMessage(response.message);
            
            // Redirect after delay
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err) {
            setError(err.message || "An error occurred. Please try again.");
        }
    };

    return (
    <Container className=" p-5 d-flex justify-content-center align-items-center">
          <div className="p-4 shadow-sm border rounded">
                <h2 className="mb-4">Reset Password</h2>
                <p className="mb-5">Enter the email address associated with your account, and we'll send a confirmation link.</p>
                
                <Form onSubmit={handleForgotPassword}>
                    <Form.Group className="mb-5">
                        <Form.Label>Your Email Address</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Button type="submit" variant="primary" className="w-100">Send</Button>
                </Form>
                
                {message && <Alert variant="success" className="mt-3">{message}</Alert>}
                {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            </div> 
    </Container>
    );
};

export default ForgotPasswordPage;
