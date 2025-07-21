import React, { useEffect, useState } from "react";
import { Table, Container, Alert, Spinner, Row, Col, Card, Button, Modal } from "react-bootstrap";
import { getPendingArenasForOwner, getPricingForNewArena, getArenasForOwnerWithStatus } from "../services/ownerService";
import Sidebar from "../components/ownerSidebar";


const PendingArenasPage = () => {
  const [pendingArenas, setPendingArenas] = useState([]);
  const [paymentPendingArenas, setPaymentPendingArenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [price, setPrice] = useState(null || 0);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [selectedArena, setSelectedArena] = useState(null);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchPendingArenas = async () => {
      try{
        const arenas = await getPendingArenasForOwner(token);
        setPendingArenas(arenas);
        setError("");
      } catch (err) {
        console.error("Error fetching pending arenas:", err);
        setError(err.response?.data?.message || "Failed to load pending arenas.");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingArenas();
  }, [token]);

  useEffect(() => {
    const fetchWithStatus = async () => {
      try {
        const arenasWithStatus = await getArenasForOwnerWithStatus(token);
        setPaymentPendingArenas(arenasWithStatus);
      } catch (err) {
        console.error("Error fetching arenas with status:", err);
        setError(err.response?.data?.message || "Failed to load arenas with status.");
      }
    };
    fetchWithStatus();
  }, [token]);

  useEffect(() => {
    const fetchPricing = async () => {
      try { 
        const pricingData = await getPricingForNewArena(token);
        console.log("Pricing Data:", pricingData);
        setPrice(pricingData[0].price);
      } catch (err) {
        console.error("Error fetching pricing:", err);
        setError(err.response?.data?.message || "Failed to load pricing.");
      }
    }
    fetchPricing();
  }, [token]);

  const handleViewDeclineReason = (arena) => {
    setSelectedArena(arena);
    setDeclineReason(arena.declinationReason || "No reason provided");
    setShowDeclineModal(true);
    };

  return (
    <Container className="min-vh-100 d-flex flex-column  align-items-center">
    <Row className="w-100" text-center>
        <Col className="p-4 m-0"  md={3}>
            <Sidebar />
        </Col>
        <Col className="p-4 m-0"  md={9}>
        <Card className="mb-4">
            <Card.Body>
            <h3 className="text-center mb-4">Arenas Pending Approval</h3>

            {loading ? (
                <div className="text-center">
                <Spinner animation="border" variant="primary" />
                </div>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : pendingArenas.length === 0 ? (
                <Alert variant="info">You have no arenas pending approval.</Alert>
            ) : (
                <Table striped bordered hover responsive>
                <thead>
                    <tr>
                    <th>#</th>
                    <th>Arena Name</th>
                    <th>Description</th>
                    <th>Image</th>
                    <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    {pendingArenas.map((arena, idx) => (
                    <tr key={arena.arenaId}>
                        <td>{idx + 1}</td>
                        <td>{arena.arenaName}</td>
                        <td>{arena.description}</td>
                        <td>
                        {arena.image_url ? (
                            <img
                            src={`${process.env.REACT_APP_API_BASE_URL}${arena.image_url}`}
                            alt={arena.arenaName}
                            width="100"
                            height="70"
                            style={{ objectFit: "cover" }}
                            />
                        ) : (
                            "N/A"
                        )}
                        </td>
                        <td>{price ? `LKR: ${price}` : "Loading..."}</td>
                        
                    </tr>
                    ))}
                </tbody>
                </Table>
            )}
            </Card.Body>
        </Card>
        {/* Payment Pending Table */}
        <Card>
          <Card.Body>
            <h4 className="text-center mb-4">Overall Arena Permissions</h4>
            {paymentPendingArenas.length === 0 ? (
              <Alert variant="info">You have no payment pending arenas.</Alert>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Arena ID</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentPendingArenas.map((arena, idx) => (
                    <tr key={arena.arenaId}>
                      <td>{idx + 1}</td>
                      <td>{arena.arenaId}</td>
                      <td>{arena.arenaName}</td>
                      <td>
                        <span
                          className={`badge ${
                            arena.arenaStatus === "Approved"
                              ? "bg-success"
                              : arena.arenaStatus === "Declined"
                              ? "bg-danger"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {arena.arenaStatus}
                        </span>
                      </td>
                      <td>
                        {arena.arenaStatus === "Approved" && (
                          <Button size="sm" variant="primary" href={`/arena-payment/${arena.arenaId}/${price}`}>
                            Pay Now
                          </Button>
                        )}
                        {arena.arenaStatus === "Declined" && (
                          <Button size="sm" variant="outline-danger" onClick={() => handleViewDeclineReason(arena)}>
                            View Reason
                          </Button>
                        )}
                        {/* No button for pending */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        {/* Decline Reason Modal */}
        <Modal show={showDeclineModal} onHide={() => setShowDeclineModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Reason for Declination</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{declineReason}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeclineModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Col>
    </Row>
    </Container>
  );
};

export default PendingArenasPage;
