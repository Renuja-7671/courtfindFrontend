// src/components/PaymentSuccess.jsx
import React, { useEffect } from 'react';
import { Container, Card, Alert, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateInvoice } from '../services/bookingService';

const OwnerPaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId, orderId, amount } = location.state || {};

  useEffect(() => {
    if (bookingId) {
      // Generate invoice after successful payment
      generateInvoice(bookingId).catch(console.error);
    }
  }, [bookingId]);

  return (
    <Container className="mt-5">
      <Card className="text-center">
        <Card.Body className="p-5">
          <div className="mb-4">
            <svg width="80" height="80" fill="green" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.061L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
            </svg>
          </div>
          <h2 className="text-success mb-3">Payment Successful!</h2>
          <Alert variant="success">
            Your court booking has been confirmed and payment processed successfully.
          </Alert>
          {bookingId && (
            <div className="mb-4">
              <p><strong>Booking ID:</strong> #{bookingId}</p>
              {orderId && <p><strong>Payment Reference:</strong> {orderId}</p>}
              {amount && <p><strong>Amount Paid:</strong> LKR {amount}</p>}
            </div>
          )}
          <div className="d-grid gap-2">
            <Button 
              variant="primary" 
              onClick={() => navigate('/player/bookings')}
            >
              View My Bookings
            </Button>
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

// src/components/PaymentCancelled.jsx

const OwnerPaymentCancelled = () => {
  const navigate = useNavigate();

  return (
    <Container className="mt-5">
      <Card className="text-center">
        <Card.Body className="p-5">
          <div className="mb-4">
            <svg width="80" height="80" fill="orange" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
            </svg>
          </div>
          <h2 className="text-warning mb-3">Payment Cancelled</h2>
          <Alert variant="warning">
            Your payment was cancelled. Your booking is still pending payment.
          </Alert>
          <p className="text-muted mb-4">
            Don't worry, you can try the payment again or choose a different payment method.
          </p>
          <div className="d-grid gap-2">
            <Button 
              variant="primary" 
              onClick={() => window.history.back()}
            >
              Try Payment Again
            </Button>
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate('/player/bookings')}
            >
              View My Bookings
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export { OwnerPaymentSuccess, OwnerPaymentCancelled };