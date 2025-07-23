import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import {
  generateArenaInvoice,
  updatePaymentsTableForArenaAdd,
} from "../services/ownerService";

const ArenaPaymentSuccess = () => {
  const { arenaId, price } = useParams();
  const [invoiceUrl, setInvoiceUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentUpdated, setPaymentUpdated] = useState(false);
  const token = localStorage.getItem("authToken");
  const hasRun = useRef(false);
  const navigate = useNavigate();

  // Update payment table first, then generate invoice
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const processPayment = async () => {
      try {
        setLoading(true);
        setError("");

        console.log('Processing payment for:', { arenaId, price });

        // Step 1: Update payment status
        console.log('Step 1: Updating payment status...');
        const paymentResponse = await updatePaymentsTableForArenaAdd(arenaId, price, token);
        console.log('Payment updated:', paymentResponse);
        setPaymentUpdated(true);

        // Step 2: Generate invoice
        console.log('Step 2: Generating invoice...');
        const invoiceUrl = await generateArenaInvoice(arenaId, price);
        console.log('Invoice generated:', invoiceUrl);
        setInvoiceUrl(invoiceUrl);

      } catch (err) {
        console.error("Error processing payment:", err);
        setError(err.message || "Failed to process payment");
      } finally {
        setLoading(false);
      }
    };

    if (arenaId && price && token) {
      processPayment();
    } else {
      setError("Missing required parameters or authentication");
      setLoading(false);
    }
  }, [arenaId, price, token]);

  const handleDownload = () => {
    if (invoiceUrl) {
      // Open invoice in new tab
      window.open(invoiceUrl, "_blank");
    }
  };

  const handleGoToDashboard = () => {
    navigate("/owner-dashboard");
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className="shadow p-4">
              <Card.Body>
                <Spinner animation="border" variant="primary" className="mb-3" />
                <h4>Processing Payment...</h4>
                <p className="text-muted">
                  {!paymentUpdated ? "Updating payment status..." : "Generating invoice..."}
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5 text-center">
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className="shadow p-4">
              <Card.Body>
                <Alert variant="danger">
                  <h5>Error Processing Payment</h5>
                  <p>{error}</p>
                </Alert>
                <Button variant="primary" onClick={handleGoToDashboard}>
                  Go to Dashboard
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5 text-center">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow p-4">
            <Card.Body>
              <div className="mb-4">
                <div 
                  style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#28a745',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontSize: '40px',
                    color: 'white'
                  }}
                >
                  ✓
                </div>
                <h3 className="text-success">Payment Successful!</h3>
                <p className="text-muted">
                  Your arena has been successfully registered. Thank you for choosing CourtFind!
                </p>
              </div>

              <div className="mb-4">
                <strong>Arena ID:</strong> {arenaId}<br />
                <strong>Amount Paid:</strong> LKR {price}
              </div>

              {invoiceUrl ? (
                <div className="mb-3">
                  <Button
                    variant="outline-primary"
                    onClick={handleDownload}
                    className="me-2"
                  >
                    📄 View Invoice
                  </Button>
                </div>
              ) : (
                <Alert variant="warning" className="mb-3">
                  Invoice is being generated. Please check your dashboard later.
                </Alert>
              )}

              <div className="mt-3">
                <Button 
                  variant="success" 
                  onClick={handleGoToDashboard}
                  className="px-4"
                >
                  Go to Dashboard
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ArenaPaymentSuccess;