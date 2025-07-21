import React, { useEffect, useState } from "react";
import { Container, Table, Button, Modal, Row, Col, Form } from "react-bootstrap";
import { getBookings, updateBookingStatus, getArenasOfOwner, getSelectedArenaBookings, getCourtsByArenaId, getFilteredArenaBookings } from "../services/ownerAuthService";
import Sidebar from "../components/ownerSidebar";
import { BiSolidPhoneCall } from "react-icons/bi";

const OwnerArenaBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [arenas, setArenas] = useState([]);
    const [selectedArenaId, setSelectedArenaId] = useState([]);
    const [selectedCourt, setSelectedCourt] = useState([]);
    const [selectedCourtName, setSelectedCourtName] = useState([]);
    const [visibleCount, setVisibleCount] = useState(5);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showCancelReasonModal, setShowCancelReasonModal] = useState(false);
    const [cancellationReason, setCancellationReason] = useState("");
    const [bookingToCancel, setBookingToCancel] = useState(null);

    const token = localStorage.getItem("authToken");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [allBookings, ownerArenas] = await Promise.all([
                    getBookings(token),
                    getArenasOfOwner(token),
                ]);
                setBookings(allBookings);
                setArenas(ownerArenas);
            } catch (err) {
                console.error("Error loading bookings or arenas:", err);
            }
        };
        fetchData();
    }, [token]);

    useEffect(() => {
        const fetchCourtsData = async () => {
            try {
                const selectedCourts = await getCourtsByArenaId(token, selectedArenaId);
                setSelectedCourt(selectedCourts);
                } catch (err) {
                    console.error("Error loading courts:", err);
                }
        };
        fetchCourtsData();
    }, [selectedArenaId]);

    const handleCourtChange = async (e) => {
        const courtName = e.target.value.trim();
        console.log("Selected court name:", courtName);
        setSelectedCourtName(courtName);
        const filters = {
          arenaId : selectedArenaId , 
          courtName : courtName }
        try {
            const filteredBookings = await getFilteredArenaBookings(token, filters);
            setBookings(filteredBookings);
            } catch (err) {
              console.error("Error filtering bookings:", err);
              }

    };

    const handleArenaChange = async (e) => {
        const arenaId = e.target.value;
        setSelectedArenaId(arenaId);

        try {
            if (arenaId === "all") {
                const all = await getBookings(token);
                setBookings(all);
            } else {
                const filtered = await getSelectedArenaBookings(token, arenaId);
                setBookings(filtered);
            }
            setVisibleCount(5); // reset table display
        } catch (error) {
            console.error("Error fetching bookings for arena:", error);
        }
    };

    const handleViewClick = (booking) => {
        setSelectedBooking(booking);
        setShowModal(true);
    };

    const handleContactClick = (booking) => {
        setSelectedPlayer(booking);
        setShowContactModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedBooking(null);
    };

    const handleCloseContactModal = () => {
        setShowContactModal(false);
        setSelectedPlayer(null);
    };

    const handleCancelBooking = async (bookingId) => {
        setBookingToCancel(bookingId);
        setShowCancelReasonModal(true);
    };

    const submitCancellation = async () => {
        if (!cancellationReason.trim()) {
            alert("Please provide a reason for cancellation.");
            return;
        }

        try {
            await updateBookingStatus(token, bookingToCancel, cancellationReason);
            const updatedBookings = bookings.map((b) =>
                b.bookingId === bookingToCancel
                    ? { ...b, status: "Cancelled", cancellationReason }
                    : b
            );
            setBookings(updatedBookings);
            setShowCancelReasonModal(false);
            setCancellationReason("");
            alert("Booking cancelled successfully.");
        } catch (error) {
            console.error("Cancellation failed:", error);
            alert("Failed to cancel booking.");
        }
    };


    return (
        <Container className="min-vh-100 d-flex flex-column  align-items-center">
            <Row className="w-100" text-center>
                <Col className="p-4 m-0" md={3}>
                    <Sidebar />
                </Col>
                <Col className="p-4 m-0" md={9}>
                <Row>
                     <h3 className="text-black mb-4">All Bookings of Your Arena</h3>

                    {/* Arena Dropdown Filter */}
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3} className="text-black text-end">
                            Filter by Arena:
                        </Form.Label>
                        <Col sm={6}>
                            <Form.Select
                                value={selectedArenaId}
                                onChange={handleArenaChange}
                                className="mb-3"
                            >
                                <option value="all">All Arenas</option>
                                {arenas.map((arena) => (
                                    <option key={arena.arenaId} value={arena.arenaId}>
                                        {arena.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                    </Form.Group>
                </Row>

                <Row>
                     

                    {/* Courts Dropdown Filter */}
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3} className="text-black text-end">
                            Filter by courts of arena:
                        </Form.Label>
                        <Col sm={6}>
                            <Form.Select
                                value={selectedCourtName}
                                onChange={handleCourtChange}
                                className="mb-3"
                            >
                                <option value="all">All Courts</option>
                                {selectedCourt.map((court) => (
                                    <option key={court.courtId} value={court.name}>
                                        {court.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                    </Form.Group>
                </Row>
                   

                    <Table striped bordered hover variant="light" responsive>
                        <thead>
                            <tr>
                                <th>Booking ID</th>
                                <th>Court Name</th>
                                <th>Booking Date</th>
                                <th>Booking Details</th>
                                <th>Contact</th>
                                <th>Cancel</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.slice(0, visibleCount).map((booking, idx) => (
                                <tr key={idx}>
                                    <td>{booking.bookingId}</td>
                                    <td>{booking.court_name}</td>
                                    <td>{booking.booking_date.split('T')[0]}</td>
                                    <td>
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={() => handleViewClick(booking)}
                                        >
                                            View
                                        </Button>
                                    </td>
                                    <td>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleContactClick(booking)}
                                        >
                                            <BiSolidPhoneCall />
                                        </Button>
                                    </td>
                                    <td>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleCancelBooking(booking.bookingId)}
                                            disabled={booking.status === "Cancelled"}
                                        >
                                            {booking.status === "Cancelled" ? "Cancelled" : "Cancel"}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <div className="d-flex justify-content-center mt-3">
                        {visibleCount < bookings.length ? (
                            <Button onClick={() => setVisibleCount(visibleCount + 5)}>See More</Button>
                        ) : (
                            visibleCount > 5 && (
                                <Button variant="secondary" onClick={() => setVisibleCount(5)}>
                                    See Less
                                </Button>
                            )
                        )}
                    </div>

                    {/* Booking Modal */}
                    {selectedBooking && (
                        <Modal show={showModal} onHide={handleCloseModal} centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Booking Details</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <p><strong>Booking ID:</strong> {selectedBooking.bookingId}</p>
                                <p><strong>Court Name:</strong> {selectedBooking.court_name}</p>
                                <p><strong>Booking Date:</strong> {selectedBooking.booking_date.split('T')[0]}</p>
                                <p><strong>Time:</strong> {selectedBooking.start_time} - {selectedBooking.end_time}</p>
                                <p><strong>Status:</strong>
                                    <span style={{ color: selectedBooking.status === 'Cancelled' ? 'red' : 'black' }}>
                                        {selectedBooking.status}
                                    </span>
                                </p>

                                    {selectedBooking.status === 'Cancelled' && selectedBooking.cancellationReason && (
                                    <p className="text-danger">
                                        <strong>Cancellation Reason:</strong> {selectedBooking.cancellationReason}
                                    </p>
                                    )}
                                <p><strong>Payment Status:</strong> {selectedBooking.payment_status}</p>
                                <p><strong>Total Price:</strong> Rs. {selectedBooking.total_price}</p>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
                            </Modal.Footer>
                        </Modal>
                    )}

                    {/* Contact Modal */}
                    {selectedPlayer && (
                        <Modal show={showContactModal} onHide={handleCloseContactModal} centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Player Details</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <p><strong>Name:</strong> {selectedPlayer.firstName} {selectedPlayer.lastName}</p>
                                <p><strong>Email:</strong> {selectedPlayer.email}</p>
                                <p><strong>Mobile:</strong> {selectedPlayer.mobile}</p>
                                <p><strong>Created At:</strong> {new Date(selectedPlayer.booked_at).toLocaleString()}</p>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleCloseContactModal}>Close</Button>
                            </Modal.Footer>
                        </Modal>
                    )}

                    {/* Cancel Reason Modal */}
                    <Modal show={showCancelReasonModal} onHide={() => setShowCancelReasonModal(false)} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Reason for Cancellation</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form.Group>
                                <Form.Label>Provide a reason for cancelling this booking:</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    value={cancellationReason}
                                    onChange={(e) => setCancellationReason(e.target.value)}
                                    placeholder="E.g., Court maintenance issue, double booking, etc."
                                />
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowCancelReasonModal(false)}>Close</Button>
                            <Button variant="danger" onClick={submitCancellation}>Confirm Cancel</Button>
                        </Modal.Footer>
                    </Modal>

                </Col>
            </Row>
        </Container>
    );
};

export default OwnerArenaBookings;