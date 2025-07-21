import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import {
  generateArenaInvoice,
  downloadInvoice,
  updatePaymentsTableForArenaAdd,
} from "../services/ownerService";

const arenaPaymentSuccess = () => {
  const { arenaId, price } = useParams(); // Ensure route includes both
  const [invoiceFilename, setInvoiceFilename] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const token = localStorage.getItem("authToken");
  const hasRun = useRef(false);
  const navigate = useNavigate();

  // Generate invoice (for arena addition or booking)
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const url = await generateArenaInvoice(arenaId, price);
        console.log("Invoice URL:", url);
        const filename = url.split("/").pop(); // Get invoice_123.pdf
        setInvoiceFilename(filename);
      } catch (err) {
        console.error("Error generating invoice:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [arenaId, price]);

  // Update payment table (Stripe)
  useEffect(() => {
    if (hasRun.current) return;
    const updatePaymentStatus = async () => {
      try {
        const response = await updatePaymentsTableForArenaAdd(arenaId, price, token);
        console.log("Payment status updated:", response);
      } catch (err) {
        console.error("Error updating payment status:", err);
      }
    };
    updatePaymentStatus();
    hasRun.current = true;
  }, [arenaId, price, token]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const blobUrl = await downloadInvoice(invoiceFilename);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `CourtFind-Arena-Invoice-${arenaId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error downloading invoice:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Container className="py-5 text-center">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow p-4">
            <Card.Body>
              <h3 className="text-success">Payment Successful!</h3>
              <p className="text-muted">
                Your arena has been added Successfully. Thank you for choosing us.
              </p>

              {loading ? (
                <Spinner animation="border" />
              ) : (
                invoiceFilename && (
                  <Button
                    variant="outline-primary"
                    onClick={handleDownload}
                    disabled={downloading}
                  >
                    {downloading ? "Downloading..." : "Download Invoice"}
                  </Button>
                )
              )}

              <div className="mt-3">
                <Button variant="success" href="/owner-dashboard">
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

export default arenaPaymentSuccess;
