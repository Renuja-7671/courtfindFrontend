import React, { useEffect, useState } from 'react';
import { Container, Card, Spinner, Alert, Badge, Row, Col } from 'react-bootstrap';
import { getPlayerBookings } from '../services/playerAuthService';
import Sidebar from '../components/playerSidebar';

const PlayerDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBookings = async () => {
            const token = localStorage.getItem('authToken');
            try {
                const data = await getPlayerBookings(token);
                setBookings(data);
            } catch (err) {
                setError('Failed to load bookings');
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const getStatusVariant = (status) => {
        switch (status.toLowerCase()) {
            case 'booked': return 'success';
            case 'completed': return 'secondary';
            case 'cancelled': return 'danger';
            default: return 'dark';
        }
    };

    const getPaymentStatusVariant = (payment_status) => {
        switch (payment_status) {
            case 'Paid': return 'success';
            case 'Pending': return 'danger';
            default: return 'dark';
        }
    };

    return (
        <Container className="min-vh-100 d-flex flex-column  align-items-center">
            <Row className="w-100" text-center>
                <Col className="p-4 m-0"  md={3}>
                    <Sidebar />
                </Col>
                <Col className="p-4 m-0"  md={9}>
            <h2 className="mb-4">My Bookings</h2>
            {loading ? (
                <Spinner animation="border" variant="primary" />
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : bookings.length === 0 ? (
                <Alert variant="info">No bookings found.</Alert>
            ) : (
                <Row>
                    {bookings.map((booking, index) => (
                        <Col md={12} className="mb-3" key={index}>
                            <Card className="shadow-sm">
                                <Row className="g-0">
                                    <Col md={3}>
                                        <Card.Img 
                                            src={`${process.env.REACT_APP_API_BASE_URL}${booking.image_url}`} 
                                            alt="Arena"
                                            style={{ height: '100%', objectFit: 'cover' }}
                                        />
                                    </Col>
                                    <Col md={9}>
                                        <Card.Body>
                                            <div className="position-absolute top-0 end-0 p-2 d-flex flex-column align-items-end gap-1">
                                            <Badge bg={getStatusVariant(booking.status)}>
                                                {booking.status.toUpperCase()}
                                            </Badge>
                                            <Badge bg={getPaymentStatusVariant(booking.payment_status)}>
                                                Payment {booking.payment_status}
                                            </Badge>
                                            </div>

                                            <Card.Title className="align-items-right d-flex justify-content-between">
                                                {booking.name}
                                            </Card.Title>
                                            <Card.Subtitle className="mb-2 text-muted">
                                                {booking.courtName}
                                            </Card.Subtitle>
                                            <Card.Text>
                                                <strong>Date:</strong> {booking.booking_date.split('T')[0]}<br />
                                                <strong>Time:</strong> {booking.start_time} - {booking.end_time}
                                            </Card.Text>
                                        </Card.Body>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
            </Col>
            </Row>
        </Container>
    );
};

export default PlayerDashboard;
