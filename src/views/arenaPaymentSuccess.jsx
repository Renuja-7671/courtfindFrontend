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
  const [currentStep, setCurrentStep] = useState("Initializing...");
  const token = localStorage.getItem("authToken");
  const hasRun = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const processPayment = async () => {
      try {
        setLoading(true);
        setError("");

        console.log('=== PROCESSING PAYMENT START ===');
        console.log('Arena ID:', arenaId);
        console.log('Price:', price);
        console.log('Token exists:', !!token);

        // Validate parameters
        if (!arenaId || !price) {
          throw new Error("Missing arena ID or price");
        }

        if (!token) {
          throw new Error("Authentication token not found. Please login again.");
        }

        // Step 1: Update payment status
        setCurrentStep("Updating payment status...");
        console.log('Step 1: Updating payment status...');
        
        const paymentResponse = await updatePaymentsTableForArenaAdd(arenaId, price, token);
        console.log('Payment updated successfully:', paymentResponse);

        // Step 2: Generate invoice
        setCurrentStep("Generating invoice...");
        console.log('Step 2: Generating invoice...');
        
        const invoiceUrl = await generateArenaInvoice(arenaId, price);
        console.log('Invoice generated successfully:', invoiceUrl);
        
        setInvoiceUrl(invoiceUrl);
        setCurrentStep("Complete!");
        console.log('=== PROCESSING PAYMENT SUCCESS ===');

      } catch (err) {
        console.error('=== PROCESSING PAYMENT ERROR ===');
        console.error('Error details:', err);
        setError(err.message || "Failed to process payment");
        setCurrentStep("Error occurred");
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [arenaId, price, token]);

  const handleDownload = () => {
    if (invoiceUrl) {
      console.log('Opening invoice URL:', invoiceUrl);
      window.open(invoiceUrl, "_blank");
    } else {
      console.error('No invoice URL available');
    }
  };

  const handleGoToDashboard = () => {
    navigate("/owner-dashboard");
  };

  const handleRetry = () => {
    hasRun.current = false;
    setLoading(true);
    setError("");
    setInvoiceUrl("");
    setCurrentStep("Retrying...");
    window.location.reload();
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
                <p className="text-muted">{currentStep}</p>
                <small className="text-muted">
                  Arena ID: {arenaId} | Amount: LKR {price}
                </small>
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
          <Col md={8}>
            <Card className="shadow p-4">
              <Card.Body>
                <Alert variant="danger">
                  <Alert.Heading>Error Processing Payment</Alert.Heading>
                  <p className="mb-3">{error}</p>
                  <hr />
                  <div className="d-flex gap-2 justify-content-center">
                    <Button variant="outline-primary" onClick={handleRetry}>
                      🔄 Retry
                    </Button>
                    <Button variant="primary" onClick={handleGoToDashboard}>
                      Go to Dashboard
                    </Button>
                  </div>
                </Alert>
                <div className="mt-3">
                  <small className="text-muted">
                    Arena ID: {arenaId} | Amount: LKR {price}
                  </small>
                </div>
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

              <div className="mb-4 p-3 bg-light rounded">
                <div className="row">
                  <div className="col-6 text-start">
                    <strong>Arena ID:</strong><br />
                    <span className="text-primary">{arenaId}</span>
                  </div>
                  <div className="col-6 text-end">
                    <strong>Amount Paid:</strong><br />
                    <span className="text-success">LKR {price}</span>
                  </div>
                </div>
              </div>

              {invoiceUrl ? (
                <div className="mb-4">
                  <Alert variant="success" className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <strong>📄 Invoice Generated Successfully!</strong>
                      <div className="small text-muted mt-1">
                        Your invoice has been saved to Google Drive
                      </div>
                    </div>
                  </Alert>
                  <Button
                    variant="outline-primary"
                    onClick={handleDownload}
                    className="me-2"
                    size="lg"
                  >
                    📄 View Invoice
                  </Button>
                </div>
              ) : (
                <Alert variant="warning" className="mb-4">
                  <strong>⚠️ Invoice Generation in Progress</strong>
                  <div className="small mt-1">
                    Your invoice is being generated. You can check your dashboard later or contact support if needed.
                  </div>
                </Alert>
              )}

              <div className="d-flex gap-2 justify-content-center">
                <Button 
                  variant="success" 
                  onClick={handleGoToDashboard}
                  size="lg"
                  className="px-4"
                >
                  🏠 Go to Dashboard
                </Button>
                {!invoiceUrl && (
                  <Button 
                    variant="outline-secondary" 
                    onClick={handleRetry}
                    size="lg"
                  >
                    🔄 Retry Invoice
                  </Button>
                )}
              </div>

              <div className="mt-4 pt-3 border-top">
                <small className="text-muted">
                  Need help? Contact our support team at support@courtfind.com
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ArenaPaymentSuccess;