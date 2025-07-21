import React, { useState } from "react";
import { registerUser } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Alert, Row, Col, InputGroup, ProgressBar } from "react-bootstrap"; // Added Row and Col imports
import { FaRegEye } from "react-icons/fa6";
import { FaRegEyeSlash } from "react-icons/fa6";


const Signup = () => {
    const [formData, setFormData] = useState({
        role: "",
        firstName: "",
        lastName: "",
        mobile: "",
        country: "",
        province: "",
        zip: "",
        address: "",
        email: "",
        password: ""
        
    });
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({ label: "", variant: "", percent: 0 });
    
  
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === "password") {
            const strength = getPasswordStrength(value);
            setPasswordStrength(strength);
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

    // Function to handle form submission
    const handleSubmit = async (e) => {
      e.preventDefault();

        // Check if passwords match
        if (formData.password !== formData.confirmPassword) {
            setMessage("Passwords do not match");
            return;
        }

      try {
        const response = await registerUser(formData); // Await the registerUser call
        setMessage(response.message); // Use response.message from the API

        // Clear the form after successful registration
        setFormData({
            role: "",
            firstName: "",
            lastName: "",
            mobile: "",
            country: "",
            province: "",
            zip: "",
            address: "",
            email: "",
            password: "",
            confirmPassword: ""
        });

        // Navigate to login page after a delay
        setTimeout(() => {
            navigate("/login"); // Navigate to login page
        }, 3000);
      } catch (error) {
        setMessage(error.response?.data?.message || "Registration failed"); // Set error message
      }
    };

    return (
        <Container className="min-vh-100 d-flex flex-column justify-content-center align-items-center">
            <Row className="w-100 justify-content-center">
                <Col md={8} lg={6}>
                    <div className="p-4 shadow-sm border rounded bg-white">
                        <h2 className="mb-4 mt-4 text-center">Registration Form</h2>
                        <p className="text-left">
                            Already have a Courtfind account?{" "}
                            <Button variant="link" onClick={() => navigate("/login")}>
                                Log In
                            </Button>
                        </p>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Choose your role *</Form.Label>
                                <Form.Select name="role" value={formData.role} onChange={handleChange} required>
                                    <option value="" disabled>Select Role</option>
                                    <option value="Player">Player</option>
                                    <option value="Owner">Arena Owner</option>
                                    required
                                </Form.Select>
                            </Form.Group>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>First Name *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="firstName"
                                            placeholder="First Name"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Last Name *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="lastName"
                                            placeholder="Last Name"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-3">
                                <Form.Label>Mobile Phone</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="mobile"
                                    placeholder="Mobile Phone"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            <Row>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Country</Form.Label>
                                        <Form.Select name="country" value={formData.country} onChange={handleChange} required>
                                            <option value="" disabled>Select Country</option>
                                            <option value="Sri Lanka">Sri Lanka</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Province</Form.Label>
                                        <Form.Select name="province" value={formData.province} onChange={handleChange} required>
                                            <option value="" disabled>Select Province</option>
                                            <option value="Western">Western Province</option>
                                            <option value="Central">Central Province</option>
                                            <option value="Southern">Southern Province</option>
                                            <option value="North-Western">North-Western Province</option>
                                            <option value="Sabaragamuwa">Sabaragamuwa Province</option>
                                            <option value="Northern">Northern Province</option>
                                            <option value="Eastern">Eastern Province</option>
                                            <option value="Uva">Uva Province</option>
                                            <option value="North-Central">North-Central Province</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Zip Code</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="zip"
                                            placeholder="Zip Code"
                                            value={formData.zip}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-3">
                                <Form.Label>Address</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="address"
                                    placeholder="Address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Password</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Button
                                        variant="light"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                                    </Button>
                                </InputGroup>
                                {formData.password && (
                                    <>
                                        <ProgressBar
                                            striped
                                            now={passwordStrength.percent}
                                            variant={passwordStrength.variant}
                                            className="mt-2"
                                            label={passwordStrength.label}
                                        />
                                    </>
                                )}
                                <Form.Text >
                                    Use at least 8 characters, including uppercase, lowercase, numbers, and symbols.
                                </Form.Text>

                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Confirm Password</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        placeholder="Type the password again"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Button 
                                        variant="light" 
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                                    </Button>
                                </InputGroup>
                            </Form.Group> <br />
                            <Button variant="primary" type="submit" className="w-100">
                                Register
                            </Button>
                        </Form>
                        <p className="text-justify mt-3 mb-4">
                            By signing up, I agree to the Courtfind Terms of Use and Privacy Policy.
                        </p>
                        {message && <Alert variant={message.includes("failed") ? "danger" : "success"} className="mt-3">{message}</Alert>}
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Signup;
