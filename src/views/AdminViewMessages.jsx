import React, { useEffect, useState } from "react";
import { Container, Table, Button, Badge, Spinner, Modal, Form } from "react-bootstrap";
import AdminLayout from "../components/AdminLayout";
import { getAllMessages, updateMessageStatus } from "../services/adminAuthService";

const AdminMessagesPage = () => {
    const [messages, setMessages] = useState([]);
    const [visibleCount, setVisibleCount] = useState(5);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [newStatus, setNewStatus] = useState("");
    const token = localStorage.getItem("authToken");

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const data = await getAllMessages(token);
                setMessages(data);
            } catch (error) {
                console.error("Failed to fetch messages:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, [token]);

    const getStatusBadge = (status) => {
        switch (status) {
            case "Resolved":
                return <Badge bg="success">Resolved</Badge>;
            case "In Review":
                return <Badge bg="warning" text="dark">In Review</Badge>;
            case "Need Review":
                return <Badge bg="danger">Need Review</Badge>;
            default:
                return <Badge bg="secondary">Unknown</Badge>;
        }
    };

    const handleSeeMore = () => {
        setVisibleCount((prev) => prev + 5);
    };

    const handleEditClick = (message) => {
        setSelectedMessage(message);
        setNewStatus(message.status);
        setShowModal(true);
    };

    const handleSaveStatus = async () => {
        try {
            await updateMessageStatus(selectedMessage.id, newStatus, token);
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === selectedMessage.id ? { ...msg, status: newStatus } : msg
                )
            );
            setShowModal(false);
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    return (
        <AdminLayout>
            <Container className="py-4">
                {loading ? (
                    <div className="d-flex justify-content-center">
                        <Spinner animation="border" variant="light" />
                    </div>
                ) : (
                    <Table striped bordered hover variant="dark" responsive>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Message</th>
                                <th>Contact</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Edit Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {messages.slice(0, visibleCount).map((msg, index) => (
                                <tr key={index}>
                                    <td>{msg.name}</td>
                                    <td>{msg.message}</td>
                                    <td>
                                        <div>{msg.email}</div>
                                        <div>{msg.phone}</div>
                                    </td>
                                    <td>{new Date(msg.created_at).toISOString().split("T")[0]}</td>
                                    <td>{getStatusBadge(msg.status)}</td>
                                    <td>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleEditClick(msg)}
                                        >
                                            Edit
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}

                {(visibleCount < messages.length || visibleCount > 5) && (
                    <div className="d-flex justify-content-center mt-4 gap-2">
                        {visibleCount < messages.length && (
                            <Button variant="primary" size="lg" onClick={handleSeeMore}>
                                See More
                            </Button>
                        )}
                        {visibleCount > 5 && (
                            <Button
                                variant="secondary"
                                size="lg"
                                onClick={() => setVisibleCount((prev) => Math.max(5, prev - 5))}
                            >
                                See Less
                            </Button>
                        )}
                    </div>
                )}


                {/* Modal */}
                <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Status</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>Select Status</Form.Label>
                            <Form.Select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                            >
                                <option value="Need Review">Need Review</option>
                                <option value="In Review">In Review</option>
                                <option value="Resolved">Resolved</option>
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSaveStatus}>
                            Save
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </AdminLayout>
    );
};

export default AdminMessagesPage;
