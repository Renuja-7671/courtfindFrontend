import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authService";
import { Container, Button, Alert, Card } from "react-bootstrap"; 

const Dashboard = () => {
    const [message, setMessage] = useState("");
    const [error, setError] = useState(""); // error state to handle errors
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await api.get("/dashboard");
                setMessage(response.data.message); // API returns a message in response.data.message
            } catch (error) {
                setError(error.response?.data?.message || "Something went wrong");
                logoutUser();
                navigate("/login");
            }
        };

        fetchDashboard();
    }, [navigate]);

    return (
        <Container className="d-flex justify-content-center align-items-center min-vh-100">
            <Card className="shadow p-4 text-center" style={{ width: "400px" }}>
                <Card.Body>
                    <Card.Title>User Dashboard</Card.Title>
                    {error && <Alert variant="danger">{error}</Alert>} {/* Show error if there is one */}
                    {message && <Alert variant="info">{message}</Alert>} {/* Show success message */}
                    <Button
                        variant="danger"
                        className="w-100 mt-3"
                        onClick={() => { logoutUser(); navigate("/login"); }}>
                        Logout
                    </Button>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Dashboard;
