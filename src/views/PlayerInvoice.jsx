import React, { useEffect, useState } from 'react';
import { Container, Card, Spinner, Alert, Row, Col, Button } from 'react-bootstrap';
import { getPlayerInvoices } from '../services/playerAuthService';
import Sidebar from '../components/playerSidebar';
import { BsDownload } from 'react-icons/bs';

const PlayerInvoices = () => {
    // State to store invoices data
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true); // To show loading spinner
    const [error, setError] = useState(''); // To store any error messages

    // Fetch player invoices when component mounts
    useEffect(() => {
        const fetchInvoices = async () => {
            const token = localStorage.getItem('authToken'); // Get auth token
            try {
                const data = await getPlayerInvoices(token); // API call to fetch invoices
                setInvoices(data); // Set received invoices
            } catch (err) {
                setError('Failed to load invoices'); // Set error message
            } finally {
                setLoading(false); // Stop loading state
            }
        };

        fetchInvoices();
    }, []);

    // Handle file download with file existence check
    const handleDownload = async (url, name, bookingDate) => {
        const fullUrl = `${process.env.REACT_APP_API_BASE_URL}${url}`; // Full file path

        try {
            const response = await fetch(fullUrl, { method: 'HEAD' });

            if (!response.ok) {
                throw new Error('File not found');
            }

            window.open(fullUrl, '_blank');

        } catch (err) {
            alert('Invoice file not found or unavailable.');
            console.error('Download error:', err);
        }
    };


    return (
        <Container className="min-vh-100 d-flex flex-column align-items-center">
            <Row className="w-100">
                {/* Sidebar */}
                <Col md={3} className="p-4 m-0">
                    <Sidebar />
                </Col>

                {/* Main content area */}
                <Col md={9} className="p-4 m-0">
                    <h2 className="mb-4">My Invoices</h2>

                    {/* Loading state */}
                    {loading ? (
                        <Spinner animation="border" variant="primary" />

                        // Error state
                    ) : error ? (
                        <Alert variant="danger">{error}</Alert>

                        // Empty state
                    ) : invoices.length === 0 ? (
                        <Alert variant="info">No invoices found.</Alert>

                        // Invoices list
                    ) : (
                        <Row>
                            {invoices.map((invoice, index) => (
                                <Col md={12} className="mb-3" key={index}>
                                    <Card className="shadow-sm">
                                        <Row className="g-0">
                                            {/* Arena Image */}
                                            <Col md={3}>
                                                <Card.Img
                                                    src={`${process.env.REACT_APP_API_BASE_URL}${invoice.image_url}`}
                                                    alt="Arena"
                                                    style={{ height: '100%', objectFit: 'cover' }}
                                                />
                                            </Col>

                                            {/* Invoice details */}
                                            <Col md={9}>
                                                <Card.Body>
                                                    <Card.Title>{invoice.name}</Card.Title>
                                                    <Card.Text>
                                                        <strong>Date:</strong> {invoice.booking_date.split('T')[0]}<br />
                                                        <strong>Time:</strong> {invoice.start_time} - {invoice.end_time}
                                                    </Card.Text>

                                                    {/* Conditional download button */}
                                                    {invoice.invoices_url ? (
                                                        <Button
                                                            variant="outline-primary"
                                                            onClick={() => handleDownload(
                                                                invoice.invoices_url,
                                                                invoice.name,
                                                                invoice.booking_date
                                                            )
                                                            }
                                                            className="d-flex align-items-center gap-2"
                                                        >
                                                            <BsDownload />
                                                            View or Download Invoice
                                                        </Button>
                                                    ) : (
                                                        <span className="text-muted">No invoice available</span>
                                                    )}
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

export default PlayerInvoices;
