// src/components/PaymentPage.jsx (Updated for manual PayHere integration)
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { getBookingDetailsForPayment } from '../services/bookingService';
import { createPayHereHash, initiatePayHerePayment, verifyPayHerePayment, isPayHereLoaded } from '../services/payhereService';
import { updatePaymentsTable, getOwnerIdAndArenaIdForBooking } from '../services/bookingService';

const PaymentPage = () => {
  const { bookingId, amount } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [error, setError] = useState('');
  const [paymentHash, setPaymentHash] = useState('');
  const [payHereReady, setPayHereReady] = useState(false);
  const MERCHANT_KEY = import.meta.env.VITE_APP_PAYHERE_MERCHANT_ID;


  useEffect(() => {
    // Check if PayHere SDK is loaded
    const checkPayHere = () => {
        console.log('Checking if PayHere SDK is loaded...');
      if (isPayHereLoaded()) {
        console.log('PayHere SDK is loaded.');
        setPayHereReady(true);
        fetchBookingDetails();
      } else {
        // Retry after a short delay
        setTimeout(checkPayHere, 1000);
      }
    };
    
    checkPayHere();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const details = await getBookingDetailsForPayment(bookingId);
      setBookingDetails(details);
      console.log('Booking Details:', details);
      
      // Generate payment hash
      await generatePaymentHash(details);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      setError('Failed to load booking details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generatePaymentHash = async (details) => {
    try {
      const paymentData = {
        merchant_id: MERCHANT_KEY,
        order_id: `COURT_${bookingId}`,
        amount: parseFloat(amount),
        currency: 'LKR'
      };

      const hashResponse = await createPayHereHash(paymentData);
      console.log('Payment Hash Response:', hashResponse);
      setPaymentHash(hashResponse.hash);
    } catch (error) {
      console.error('Error generating payment hash:', error);
      setError('Failed to prepare payment. Please try again.');
    }
  };

  const handlePayHerePayment = async () => {
    if (!paymentHash) {
      setError('Payment not ready. Please wait or refresh the page.');
      return;
    }

    if (!payHereReady) {
      setError('Payment system not loaded. Please refresh the page.');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Get owner and arena IDs
      const { ownerId, arenaId } = await getOwnerIdAndArenaIdForBooking(bookingId);

      const paymentConfig = {
        sandbox: true, // Set to false for production
        merchant_id: import.meta.env.VITE_APP_PAYHERE_MERCHANT_ID,
        return_url: `${window.location.origin}/payment-success`,
        cancel_url: `${window.location.origin}/payment-cancelled`,
        notify_url: `${import.meta.env.VITE_API_BASE_URL}/payment/payhere-notify`,
        order_id: `COURT_${bookingId}`,
        items: `Court Booking - ${bookingDetails.courtName || 'Court'}`,
        amount: parseFloat(amount).toFixed(2),
        currency: 'LKR',
        hash: paymentHash,
        first_name: bookingDetails.firstName || 'Customer',
        last_name: bookingDetails.lastName || '',
        email: bookingDetails.email || 'customer@example.com',
        phone: bookingDetails.mobile || '+94771234567',
        address: bookingDetails.address || 'Colombo',
        city: bookingDetails.city || 'Colombo',
        country: 'Sri Lanka',
        delivery_address: '102, Main Street, Colombo',
        delivery_city: 'Colombo',
        delivery_country: 'Sri Lanka',
        custom_1: bookingId,
        custom_2: ownerId,
        custom_3: arenaId
      };

      console.log('Payment Config:', paymentConfig);

      console.log('Initiating PayHere payment...');
      
      // Initiate PayHere payment
      const result = await initiatePayHerePayment(paymentConfig);
      
      if (result.status === 'success') {
        console.log('Payment completed successfully');
        
        // Update payments table
        await updatePaymentsTable(bookingId, ownerId, arenaId, amount);
        
        // Navigate to success page
        navigate('/payment-success', { 
          state: { 
            bookingId, 
            orderId: result.orderId,
            amount 
          } 
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading payment details...</p>
        </div>
      </Container>
    );
  }

  if (!bookingDetails) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Booking Not Found</Alert.Heading>
          <p>We couldn't find the booking details. Please check your booking ID and try again.</p>
          <Button variant="outline-danger" onClick={() => navigate('/player/bookings')}>
            View My Bookings
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header className="bg-primary text-white text-center">
              <h4>Complete Your Payment</h4>
              <small>Secure payment powered by PayHere</small>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  <Alert.Heading>Payment Error</Alert.Heading>
                  <p>{error}</p>
                </Alert>
              )}

              {!payHereReady && (
                <Alert variant="warning">
                  <Alert.Heading>Loading Payment System</Alert.Heading>
                  <p>Please wait while we prepare the payment system...</p>
                </Alert>
              )}
              
              <div className="mb-4">
                <h5>Booking Summary</h5>
                <hr />
                <Row>
                  <Col sm={6}><strong>Arena:</strong></Col>
                  <Col sm={6}>{bookingDetails.arenaName}</Col>
                </Row>
                <Row>
                  <Col sm={6}><strong>Court:</strong></Col>
                  <Col sm={6}>{bookingDetails.courtName}</Col>
                </Row>
                <Row>
                  <Col sm={6}><strong>Date:</strong></Col>
                  <Col sm={6}>{bookingDetails.bookingDate}</Col>
                </Row>
                <Row>
                  <Col sm={6}><strong>Time:</strong></Col>
                  <Col sm={6}>{bookingDetails.startTime} - {bookingDetails.endTime}</Col>
                </Row>
                <Row>
                  <Col sm={6}><strong>Booking ID:</strong></Col>
                  <Col sm={6}>#{bookingId}</Col>
                </Row>
                <hr />
                <Row>
                  <Col sm={6}><strong className="text-primary fs-5">Total Amount:</strong></Col>
                  <Col sm={6}><strong className="text-primary fs-5">LKR {amount}</strong></Col>
                </Row>
              </div>

              <div className="text-center">
                <Button
                  variant="success"
                  size="lg"
                  onClick={handlePayHerePayment}
                  disabled={processing || !paymentHash || !payHereReady}
                  className="px-5 py-3"
                >
                  {processing ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Processing Payment...
                    </>
                  ) : !payHereReady ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Loading PayHere...
                    </>
                  ) : (
                    <>
                      🔒 Pay Securely with PayHere
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-4 text-center">
                <small className="text-muted">
                  <div className="mb-2">
                    <strong>Accepted Payment Methods:</strong>
                  </div>
                  <div>
                    💳 Visa • MasterCard • AMEX • Mobile Wallets • Internet Banking
                  </div>
                </small>
              </div>

              <div className="mt-3 text-center">
                <Button 
                  variant="outline-secondary" 
                  onClick={() => navigate('/player/bookings')}
                  disabled={processing}
                >
                  Cancel & Go Back
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentPage;