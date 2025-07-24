import React, { useEffect, useState } from "react";
import { getPlayerNotifications } from "../services/playerAuthService";
import { Container, Card, Alert, Spinner, Row, Col } from "react-bootstrap";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import Sidebar from "../components/playerSidebar"; //Import  sidebar

const PlayerNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    // Utility function for customizing notification messages
const getNotificationMessage = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return "Booking info not available";

    const bookingDateTime = new Date(`${dateStr}T${timeStr}`);
    const now = new Date();

    const diffMs = bookingDateTime - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    const isTomorrow =
        bookingDateTime.getDate() === now.getDate() + 1 &&
        bookingDateTime.getMonth() === now.getMonth() &&
        bookingDateTime.getFullYear() === now.getFullYear();

    if (isTomorrow) {
        return `📅 You have a booking tomorrow at ${timeStr.slice(0, 5)}`;
    } else if (diffHours > 2) {
        return `⏳ Your booking is in ${diffHours} hours`;
    } else if (diffHours >= 1) {
        return `⏰ Only ${diffHours} hour(s) and ${diffMinutes} mins to go!`;
    } else if (diffHours === 0 && diffMinutes > 0) {
        return `⚠️ Your session starts in ${diffMinutes} minute(s)!`;
    } else if (diffMs < 0) {
        return `✅ This session has already started or finished.`;
    } else {
        return `🕒 Upcoming session soon!`;
    }
};


    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await getPlayerNotifications(token);
                setNotifications(data);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [token]);

    return (
         <Container className="min-vh-100 d-flex flex-column  align-items-center">
                    <Row className="w-100" text-center>
                        <Col className="p-4 m-0"  md={3}>
                            <Sidebar />
                        </Col>
                        <Col className="p-4 m-0"  md={9}>
                    <h3 className="mb-4 text-primary">📢 Notifications</h3>
                    {loading ? (
                        <Spinner animation="border" />
                    ) : notifications.length === 0 ? (
                        <Alert variant="info">No notifications for now.</Alert>
                    ) : (
                        notifications.map((item) => (
                        <Card key={item.bookingId} className="mb-3 shadow-sm">
    <Card.Body>
  {/* Custom Notification Message */}
  <Card.Text
    className="fw-semibold"
    style={{ color: '#0d6efd', fontSize: '1.25rem', marginBottom: '0.75rem' }}
  >
    {getNotificationMessage(item.booking_date, item.start_time)}
  </Card.Text>

  {/* Court and Arena Title */}
  <Card.Title>
    {item.courtName} @ {item.arenaName}
  </Card.Title>

  {/* Date */}
  <Card.Text>
    <FaCalendarAlt className="me-2 text-secondary" />
    {item.booking_date
      ? new Date(item.booking_date).toLocaleDateString()
      : "Date not available"}
  </Card.Text>

  {/* Time */}
  <Card.Text>
    <FaClock className="me-2 text-secondary" />
    {item.start_time && item.end_time
      ? `${item.start_time} - ${item.end_time}`
      : "Time not available"}
  </Card.Text>
</Card.Body>

</Card>

                        ))
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default PlayerNotifications;
