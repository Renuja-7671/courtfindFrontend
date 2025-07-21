import React, { useState } from "react";
import { loginUser } from "../services/authService";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Button, Container, Alert, Row, Col, InputGroup } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { jwtDecode } from "jwt-decode";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { setOwnerLoginCount } from "../services/ownerInsights";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { updateAuthState } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser({ email, password });
  
      if (!response || !response.token) {
        throw new Error("Token not received!");
      }
  
      const token = response.token; 
      localStorage.setItem("authToken", token);
      updateAuthState();
    
      const decodedToken = jwtDecode(token);
  
      if (!decodedToken.role) throw new Error("Role not found in token!");
  
      const userRole = decodedToken.role;
      setSuccessMessage("Login successful!");
      setErrorMessage("");

  
      // Check for redirectVenue or redirectAfterLogin
      const redirectVenue = localStorage.getItem('redirectVenue');
      const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
      
      // Clear redirect storage
      localStorage.removeItem('redirectVenue');
      localStorage.removeItem('redirectAfterLogin');
      
      // Redirect based on stored redirect or role
      const from = location.state?.from || null;

      if(from) {
        navigate(from, { replace: true });
      } else if (redirectVenue) {
        navigate(`/explore-now?venue=${encodeURIComponent(redirectVenue)}`);
      } else if (redirectAfterLogin) {
        navigate(redirectAfterLogin);
      } else if (userRole === "Player") {
        navigate("/player-dashboard");
      } else if (userRole === "Owner") {
        const ownerLoginCount = await setOwnerLoginCount(token);
        navigate("/owner-dashboard");
      } else if (userRole === "Admin") {
        navigate("/admin-dashboard");
      } else {
        throw new Error("Invalid user role!");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setErrorMessage(err.response?.data?.message || err.message || "Login failed");
      setSuccessMessage("");
    }
  };

  return (
    <Container className="min-vh-100 d-flex justify-content-center align-items-center">
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={4}>
          <div className="p-4 shadow-sm border rounded">
            <h2 className="text-left mb-4">Log In</h2>
            <p className="text-left">
              Don't have a Courtfind account?{" "}
              <Button variant="link" onClick={() => navigate("/signup")}>
                Sign Up
              </Button>
            </p>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>
              <br />

              <Form.Group controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button 
                    variant="light" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                  </Button>
                </InputGroup>
              </Form.Group>
              <br />
              <Button variant="link" onClick={() => navigate("/forgot-password")}>
                Forgot Password
              </Button>
              <br />

              <Button variant="primary" type="submit" className="w-100 mt-3">
                Login
              </Button>
            </Form>

            <p className="text-justify mt-3">
              By signing in, I agree to the Courtfind Terms of Use and Privacy Policy.
            </p>

            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;