import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Card, Alert, Row, Col } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/ownerSidebar";
import { addArena, uploadArenaImage } from "../services/arenaService";

const AddArena = () => {
    // Form state for arena details
    const [formData, setFormData] = useState({ name: "", city: "", description: "" });

    // State for selected image file and its preview URL
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Feedback messages
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const navigate = useNavigate();
    const { authToken } = useAuth();

    // Update form input values
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle image file selection and preview
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    // Submit new arena data
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let imageUrl = "";

            if (imageFile) {
                const uploadRes = await uploadArenaImage(imageFile, authToken);
                imageUrl = uploadRes.imageUrl;
            }

            const response = await addArena({ ...formData, image_url: imageUrl }, authToken);

            if (response.status === 201) {
                setMessage("Arena added successfully!");
                setFormData({ name: "", city: "", description: "" });
                setImageFile(null);
                setImagePreview(null);
                setTimeout(() => {
                    navigate("/add-courts", { state: { arenaId: response.data.arenaId } });
                }, 100);
            } else {
                setError("Failed to add arena. Please try again.");
            }
        } catch (error) {
            setError("An error occurred. Please try again.");
            console.error(error);
        }
    };

    return (
        <Container className="min-vh-100 d-flex flex-column  align-items-center">
            <Row className="w-100" text-center>
                <Col className="p-4 m-0" md={3}>
                    <Sidebar />
                </Col>
                <Col md={8} className="p-4 m-0 d-flex flex-column justify-content-center align-items-center">
                    <Card className="shadow-sm p-4 w-100" style={{ maxWidth: "600px" }}>
                        <h3 className="text-center mb-4">Add Arena</h3>
                        {message && <Alert variant="success">{message}</Alert>}
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Arena Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>City</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Arena Image</Form.Label>
                                <Form.Control
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    required
                                />
                                {imagePreview && (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        style={{ width: "100px", height: "100px", marginTop: "10px", objectFit: "cover", borderRadius: "8px" }}
                                    />
                                )}
                            </Form.Group>
                            <Button variant="primary" type="submit" className="w-100">
                                Add Courts to this Arena
                            </Button>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AddArena;
