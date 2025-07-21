import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { generateInvoice, downloadInvoice, getOwnerIdAndArenaIdForBooking, updatePaymentsTable } from "../services/bookingService";

const PaymentSuccess = () => {
  const { bookingId, absoluteAmount } = useParams();
  const [invoiceFilename, setInvoiceFilename] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const token = localStorage.getItem("authToken");
  const [ownerId, setOwnerId] = useState("");
  const [arenaId, setArenaId] = useState("");
  const hasRun = useRef(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const url = await generateInvoice(bookingId);
        // Assuming your backend returns something like "/uploads/invoices/invoice_61.pdf"
        const filename = url.split("/").pop(); // Extract just "invoice_61.pdf"
        setInvoiceFilename(filename);
      } catch (err) {
        console.error("Error generating invoice:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [bookingId]);

  useEffect(() => {
    if (hasRun.current) return; // Prevent running this effect multiple times
    const updatePaymentStatus = async () => {
      try {
        const res = await getOwnerIdAndArenaIdForBooking(bookingId);
        const ownerId = res.ownerId;
        const arenaId = res.arenaId;
        console.log("Owner ID:", ownerId, "Arena ID:", arenaId);
        const numericTotal = parseFloat(absoluteAmount);
        console.log("Owner ID:", ownerId, "Total Amount:", numericTotal);
        const response = await updatePaymentsTable(bookingId, ownerId, arenaId, numericTotal,token);
        console.log("Payment status updated:", response);
      } catch (err) {
        console.error("Error updating payment status:", err);
      }
    }
    updatePaymentStatus();
    hasRun.current = true; // Set flag to true after running
  }, [bookingId, absoluteAmount]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const blobUrl = await downloadInvoice(invoiceFilename);

      // Create a temporary anchor tag and trigger download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `CourtFind-Invoice-${bookingId}.pdf`;
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
              <p className="text-muted">Your booking has been confirmed. Thank you for using our service.</p>

              {loading ? (
                <Spinner animation="border" />
              ) : (
                invoiceFilename && (
                  <Button variant="outline-primary" onClick={handleDownload} disabled={downloading}>
                    {downloading ? "Downloading..." : "Download Invoice"}
                  </Button>
                )
              )}

              <div className="mt-3">
                <Button variant="success" href="/player-dashboard">
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

export default PaymentSuccess;
