import React, { useEffect, useState } from "react";
import { Container, Table, Button, Alert, Modal, Spinner, Row, Col, Form } from "react-bootstrap";
import { getAllPendingArenas, updateArenaStatus } from "../services/adminAuthService";
import AdminLayout from "../components/AdminLayout";

const SuperAdminArenaApprovals = () => {
  const [pendingArenas, setPendingArenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedArena, setSelectedArena] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [arenaToDecline, setArenaToDecline] = useState(null);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchArenas = async () => {
      try {
        const arenas = await getAllPendingArenas(token);
        setPendingArenas(arenas);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching pending arenas.");
      } finally {
        setLoading(false);
      }
    };

    fetchArenas();
  }, [token]);

  const handleApprove = async (arenaId) => {
    if (!window.confirm("Are you sure you want to approve this arena?")) return;

    try {
      await updateArenaStatus(arenaId, "Approved", "", token);
      setPendingArenas(prev => prev.filter(a => a.arenaId !== arenaId));
      alert("Arena approved successfully.");
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to approve arena.");
    }
  };

  const handleDeclineClick = (arena) => {
    setArenaToDecline(arena);
    setDeclineReason("");
    setShowDeclineModal(true);
  };

  const handleSubmitDecline = async () => {
    if (!declineReason.trim()) {
      alert("Please enter a reason for declining the arena.");
      return;
    }

    try {
      await updateArenaStatus(arenaToDecline.arenaId, "Declined", declineReason, token);
      setPendingArenas(prev => prev.filter(a => a.arenaId !== arenaToDecline.arenaId));
      alert("Arena declined successfully.");
      setShowDeclineModal(false);
    } catch (err) {
      console.error("Decline failed:", err);
      alert("Failed to decline arena.");
    }
  };

  const openDetailsModal = (arena) => {
    setSelectedArena(arena);
    setShowDetailsModal(true);
  };

  return (
    <AdminLayout>
    <Container className="py-5">
      <h3 className="text-center mb-4">Pending Arena Requests</h3>

      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : pendingArenas.length === 0 ? (
        <Alert variant="info">No pending arenas found.</Alert>
      ) : (
        <Table striped bordered hover responsive variant="dark">
          <thead>
            <tr>
              <th>#</th>
              <th>Arena</th>
              <th>City</th>
              <th>Owner</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingArenas.map((arena, index) => (
              <tr key={arena.arenaId}>
                <td>{index + 1}</td>
                <td>{arena.arenaName}</td>
                <td>{arena.city}</td>
                <td>{arena.firstName} {arena.lastName}</td>
                <td>{arena.email}</td>
                <td>
                  <Button variant="info" size="sm" className="me-2" onClick={() => openDetailsModal(arena)}>View Details</Button>
                  <Button variant="success" size="sm" className="me-1" onClick={() => handleApprove(arena.arenaId)}>Approve</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDeclineClick(arena)}>Decline</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Arena Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Arena & Owner Details</Modal.Title>
        </Modal.Header>
        {selectedArena && (
          <Modal.Body>
            <Row>
              <Col md={12}>
                <strong>Arena Name:</strong> {selectedArena.arenaName}<br />
                <strong>City:</strong> {selectedArena.city}<br />
                <strong>Country:</strong> {selectedArena.country}<br />
                <strong>Description:</strong> {selectedArena.description}<br />
                <strong>Owner Name:</strong> {selectedArena.firstName} {selectedArena.lastName}<br />
                <strong>Email:</strong> {selectedArena.email}<br />
                <strong>Mobile:</strong> {selectedArena.mobile}<br />
              </Col>
              {selectedArena.image_url && (
                <Col md={12} className="mt-3 text-center">
                  <img src={`http://localhost:8000${selectedArena.image_url}`} alt="arena" style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: "8px" }} />
                </Col>
              )}
            </Row>
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Decline Reason Modal */}
      <Modal show={showDeclineModal} onHide={() => setShowDeclineModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Decline Arena</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="declineReason">
            <Form.Label>Please provide a reason for declining this arena:</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Enter reason here..."
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeclineModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleSubmitDecline}>Submit</Button>
        </Modal.Footer>
      </Modal>
    </Container>
    </AdminLayout>
  );
};

export default SuperAdminArenaApprovals;
