import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Row, Spinner, Form, Carousel } from 'react-bootstrap';
import { getCourtsForBooking } from '../services/courtService';
import { createBooking, getBookingTimesByCourtId } from '../services/bookingService';
import { gerReviewStatsWithoutAuth, getAverageRatingByCourtWithoutAuth } from '../services/playerAuthService';
import { useParams } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhoneAlt, FaStar } from 'react-icons/fa';
import { MdOutlineSportsScore } from "react-icons/md";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion } from "framer-motion";



const ViewingPage = () => {
  const { courtId } = useParams();
  const [court, setCourt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState('');
  const availability = court?.availability || {};

  const isDayClosed = selectedDate && (() => {
    const dayName = new Date(selectedDate).toLocaleString('en-US', { weekday: 'long' });
    const dayAvail = availability[dayName];
    return !dayAvail || !dayAvail.open || !dayAvail.close;
  })();

  const { authToken } = useAuth();
  const { isAuth, userRole } = useAuth();
  const navigate = useNavigate();
  const [bookedSlots, setBookedSlots] = useState([]);
  const [startTime, setStartTime] = useState('');
  // State for review statistics
  const [reviewStats, setReviewStats] = useState([]);
  const [averageRating, setAverageRating] = useState(0.0);

  const handleStartTimeChange = (e) => {
    const time = e.target.value;
    setStartTime(time);
    setSelectedTime(time);
  };

  function convertToYMD(dateString) {
  // Assumes input is in 'DD/MM/YYYY' format
  const [day, month, year] = dateString.split('/');
  return `${year}/${month}/${day}`;
}

  //To fetch the booked times in a selected date
  useEffect(() => {
  const fetchBookedTimes = async () => {
    if (!selectedDate || !courtId) return;
    const formattedDate = selectedDate.toLocaleDateString(); 
    console.log("The first conversion is: ",formattedDate);
    // Convert date to YYYY-MM-DD format
    const dateParts = convertToYMD(formattedDate);
    console.log("The second conversion is: ",dateParts);
    const response = await getBookingTimesByCourtId(courtId, dateParts);
    if (Array.isArray(response)) {
      setBookedSlots(response);
    } else {
      setBookedSlots([]);
    }
  };

  fetchBookedTimes();
}, [selectedDate, courtId]);
  

  useEffect(() => {
    const fetchCourt = async () => {
      try {
        const response = await getCourtsForBooking(courtId);
        if (response.success) {
            const fetchedCourt = response.court;
            // Convert images from JSON string to array
            if (typeof fetchedCourt.images === 'string') 
            {
                try {
                    fetchedCourt.images = JSON.parse(fetchedCourt.images);
                } catch (err) {
                    console.error("Invalid images JSON format", err);
                    fetchedCourt.images = [];
                }
            }

                // Parse availability
            if (typeof fetchedCourt.availability === 'string') {
              try {
                fetchedCourt.availability = JSON.parse(fetchedCourt.availability);
              } catch (err) {
                console.error("Invalid availability JSON format", err);
                fetchedCourt.availability = {};
              }
            }
            setCourt(fetchedCourt);
        }
        } catch (error) {
        console.error("Error fetching court:", error);
      } finally {
        setLoading(false);
      }
    };    

    fetchCourt();
  }, [courtId,authToken]);

  useEffect(() => {
    const fetchReviewData = async () => {
      try {
        const statsData = await gerReviewStatsWithoutAuth(courtId);
        console.log("Review stats fetched:", statsData);
        setReviewStats(statsData);
        const avgData = await getAverageRatingByCourtWithoutAuth(courtId);
        console.log("Average rating fetched:", avgData);
        setAverageRating(avgData.averageRating || 0.0);
      } catch (error) {
        console.error("Error fetching review data:", error);
      }
    };
    fetchReviewData();
  }, [courtId]);

  // Handle booking submission
  const handleBooking = async () => {
    if (!isLoggedInPlayer()) {
    alert("You must be logged in as a player to book a court.");
    navigate('/login', { replace: true, state: { from: location.pathname } });
    return;
  }
    if (!selectedDate || !selectedTime || !duration) return;

    const date = selectedDate.toLocaleDateString();
    const dateParts = convertToYMD(date);

    const startHour = parseInt(selectedTime.split(':')[0]);
    const endHour = startHour + parseInt(duration);
    const endTime = `${endHour}:00`;

    const bookingData = {
      courtId: court.courtId,
      booking_date: dateParts,
      start_time: selectedTime,
      end_time: endTime,
      total_price: court.hourly_rate * parseInt(duration),
      payment_status: 'Pending',
      status: 'Booked',
      owner_id: court.owner_id,
      arenaId: court.arenaId,
    };

    try {
      const bookingId = await createBooking(bookingData, authToken);
      console.log("Booking ID sent for payment:", bookingId); // Debug log
      if (bookingId) {
        alert("Booking Pending! Proceed to payment.");
        navigate(`/payment/${bookingId}/${bookingData.total_price}`); // Redirect to payment page with bookingId
        // Reset form fields
        setSelectedDate('');
        setSelectedTime('');
        setDuration('');

      } else {
        alert("Booking failed: " + res.error);
      }
    } catch (err) {
      alert("An unexpected error occurred.");
    }
  };

  // Check if the logged-in user is a player
  const isLoggedInPlayer = () => {
    return isAuth && userRole === 'Player';
  };

// Generate time slots based on opening and closing hours
  const generateTimeSlots = (open, close) => {
  const slots = [];
  for (let hour = open; hour < close; hour++) {
    slots.push(`${hour}:00`);
  }
  return slots;
};
// Handle viewing reviews
const handleViewReviews = () => {
      navigate(`/reviews/${courtId}`);
  };

  // Handle logging in as a player
  const handleLoggingInPlayer = () => {
    if (!isLoggedInPlayer()) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
    }
  };



  if (loading) return <Spinner animation="border" variant="primary" />;

  return (
    <Container className="my-5 px-5">
      <style>{`
        .timeline-bar {
          display: flex;
          border: 1px solid #ccc;
          border-radius: 8px;
          overflow: hidden;
          margin-top: 10px;
        }
        .timeline-slot {
          flex: 1;
          min-width: 60px;
          height: 40px;
          text-align: center;
          line-height: 40px;
          font-size: 0.9rem;
          font-weight: 500;
          color: #fff;
          border-right: 1px solid #fff;
        }
        .timeline-slot:last-child {
          border-right: none;
        }
        .booked {
          background-color: #dc3545;
        }
        .available {
          background-color: #28a745;
        }
        .booking-summary-card {
          border-left: 5px solid #0d6efd;
          padding: 1rem;
          background-color: #f8f9fa;
        }
        .modern-card {
          border-radius: 15px;
          overflow: hidden;
          border: none;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      <h2>{court.arenaName} <br/> {court.courtName}</h2>
      <p>{court.city}, {court.country}</p>
      <Row className="mb-4">
        <Col md={6}>
          <Card className="modern-card">
            {court.images?.length > 0 ? (
              <Carousel indicators={false}>
                {court.images.map((img, idx) => (
                  <Carousel.Item key={idx}>
                    <img
                      className="d-block w-100"
                      src={`${process.env.REACT_APP_API_BASE_URL}/${img}`}
                      alt={`Court image ${idx + 1}`}
                      style={{ height: '400px', objectFit: 'cover', borderRadius: '15px' }}
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
            ) : (
              <Card.Img variant="top" src="/default-court.jpg" />
            )}
          </Card>
        </Col>

        <Col md={6}>
          <Card className="modern-card">
            <Card.Body className="text-center">
              <h3 className="fw-bold mb-3">{court.arenaName} - {court.courtName}</h3>
              <p className="text-muted">{court.city}, {court.country}</p>
              <p><strong>Description:</strong> {court.description}</p>
              <p><FaPhoneAlt className="me-1" /><strong>Contact:</strong> {court.mobile}</p>

              <div className="mt-3">
                <h4 className="text-warning">{averageRating} <FaStar /></h4>
                <p>Total Reviews: {reviewStats.total_reviews || 0}</p>
                <Button
                  variant="link"
                  className="text-decoration-none"
                  onClick={handleViewReviews}
                  //style={{ cursor: isLoggedInPlayer() ? 'pointer' : 'not-allowed', color: isLoggedInPlayer() ? '#007bff' : '#6c757d' }}
                >
                  <FaStar /> {'Add or View Reviews'}
                </Button>
              </div>
            </Card.Body>

            <Card.Footer className="bg-white border-0 text-center">
              <p>
                <span className="badge bg-danger px-3 py-2 fs-6">
                  <MdOutlineSportsScore className="me-1" /> {court.sport}
                </span>
              </p>
              <div className="badge bg-primary text-white fs-5 p-3 my-2 rounded-pill">
                <strong>Price:</strong> {court.hourly_rate} LKR / Hr
              </div>
              <p><strong>Size:</strong> {court.size} sq ft</p>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col className="text-center my-4">
          <hr/>
          <div className="bg-light p-3 rounded d-flex flex-column align-items-center">
            <h4 className="text-center mb-3">Weekly Availability</h4>
            <table className="table table-hover shadow-sm rounded text-center w-75 mx-auto">
              <thead className="table-light">
                <tr>
                  <th>Day</th>
                  <th>Opening</th>
                  <th>Closing</th>
                </tr>
              </thead>
              <tbody>
                {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => {
                  const info = availability[day];
                  const isToday = day === new Date().toLocaleString('en-US', { weekday: 'long' });
                  return (
                    <tr key={day} className={isToday ? 'table-primary' : ''}>
                      <td>{day}</td>
                      <td>{info?.open || 'Closed'}</td>
                      <td>{info?.close || 'Closed'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Col> 
        </Row>
        <Row>
        <Col md={12} className="text-center my-4">
        <hr />
        <h4>Live Booking Status</h4>

        <div className="mb-1">
          <span style={{ display: 'inline-block', width: '20px', height: '20px', backgroundColor: 'red', borderRadius: '4px', marginRight: '5px' }}></span>
          <span className="me-3">Booked Time</span>

          <span style={{ display: 'inline-block', width: '20px', height: '20px', backgroundColor: 'green', borderRadius: '4px', marginRight: '5px' }}></span>
          <span>Free Time</span>
        </div>

        <div className="timeline-bar mt-3">
          {(() => {
            if (!selectedDate) return <p>Select a date to view availability.</p>;

            const dayName = new Date(selectedDate).toLocaleString('en-US', { weekday: 'long' });
            const dayAvail = availability[dayName];
            if (!dayAvail || !dayAvail.open || !dayAvail.close) return <p>This day is closed.</p>;

            const openHour = parseInt(dayAvail.open.split(':')[0]);
            const closeHour = parseInt(dayAvail.close.split(':')[0]);

            // Create an array of all booked hours
            const bookedHours = new Set();
            bookedSlots.forEach(slot => {
              const startHour = parseInt(slot.start_time.split(':')[0]);
              const endHour = parseInt(slot.end_time.split(':')[0]);
              for (let h = startHour; h < endHour; h++) {
                bookedHours.add(h);
              }
            });

            const slots = [];
            for (let hour = openHour; hour < closeHour; hour++) {
              const isBooked = bookedHours.has(hour);
              slots.push(
                <div
                  key={hour}
                  className={`timeline-slot ${isBooked ? 'booked' : 'available'}`}
                >
                  {hour}:00
                </div>
              );
            }

            return slots;
          })()}
        </div>
      </Col>

      </Row>

      <Row>
        <Row className="text-center my-4">
          <Col className="text-center my-4">
            <hr />
            <h3>Reserve Your Spot</h3>
            <p>Select a date and time to book your court.</p>
          </Col>
        </Row>
        <Row>
        <Col md={6}>
          <Card className="modern-card p-4">
            <Card.Body>
              <h5>Make a Booking</h5>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Select Date</Form.Label>
                  <DatePicker
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      className="form-control"
                      placeholderText="Select a date"
                      minDate={new Date()}
                      dateFormat="yyyy-MM-dd"
                    />                
                </Form.Group>
            <Form.Group>
              <Form.Label>Start Time</Form.Label>
              <Form.Select value={startTime} onChange={handleStartTimeChange}>
                <option value="">Select Start Time</option>
                {(() => {
                  if (!selectedDate) return null;
                  const formattedDate = selectedDate.toLocaleDateString(); 
                  const dateParts = convertToYMD(formattedDate);
                  const dayName = new Date(dateParts).toLocaleString('en-US', { weekday: 'long' });
                  const dayAvail = availability[dayName];
                  if (!dayAvail) return null;

                  const openHour = parseInt(dayAvail.open.split(':')[0]);
                  const closeHour = parseInt(dayAvail.close.split(':')[0]);

                  // Create a set of all booked hours
                  const bookedHours = new Set();
                  bookedSlots.forEach(slot => {
                    const startHour = parseInt(slot.start_time.split(':')[0]);
                    const endHour = parseInt(slot.end_time.split(':')[0]);
                    for (let h = startHour; h < endHour; h++) {
                      bookedHours.add(h);
                    }
                  });

                  const options = [];
                  for (let hour = openHour; hour < closeHour; hour++) {
                    if (!bookedHours.has(hour)) {
                      options.push(
                        <option key={hour} value={`${hour}:00`}>
                          {`${hour}:00`}
                        </option>
                      );
                    }
                  }

                  return options;
                })()}
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Duration (in hours)</Form.Label>
              <Form.Select value={duration} onChange={(e) => setDuration(parseInt(e.target.value))}>
                <option value="">Select Duration</option>
                {(() => {
                  if (!startTime || !selectedDate) return null;
                  const formattedDate = selectedDate.toLocaleDateString();
                  const dateParts = convertToYMD(formattedDate);

                  const dayName = new Date(dateParts).toLocaleString('en-US', { weekday: 'long' });
                  const dayAvail = availability[dayName];
                  if (!dayAvail) return null;

                  const startHour = parseInt(startTime.split(':')[0]);
                  const closeHour = parseInt(dayAvail.close.split(':')[0]);

                  // Get all booked hours
                  const bookedHours = new Set();
                  bookedSlots.forEach(slot => {
                    const bStart = parseInt(slot.start_time.split(':')[0]);
                    const bEnd = parseInt(slot.end_time.split(':')[0]);
                    for (let h = bStart; h < bEnd; h++) {
                      bookedHours.add(h);
                    }
                  });

                  // Determine how many consecutive free hours are available from selected start
                  let maxDuration = 0;
                  for (let h = startHour; h < closeHour; h++) {
                    if (bookedHours.has(h)) break;
                    maxDuration++;
                  }

                  // Render duration options up to maxDuration
                  return Array.from({ length: maxDuration }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} hour{(i + 1) > 1 ? 's' : ''}
                    </option>
                  ));
                })()}
              </Form.Select>
            </Form.Group>

            <Button
              className="w-100 rounded-pill mt-3"
              disabled={!selectedDate || !selectedTime || !duration || isDayClosed || !isLoggedInPlayer()}
              onClick={handleBooking}
            >
              Reserve and Book Now
            </Button>

            {!isLoggedInPlayer() && (
              <p className="text-danger mt-2">
                Please&nbsp;
                <span
                  className="text-decoration-underline"
                  style={{ cursor: 'pointer' }}
                  onClick={handleLoggingInPlayer}
                >
                  log&nbsp;in&nbsp;as&nbsp;a&nbsp;Player
                </span>
                &nbsp;to make a booking.
              </p>
            )}

            {isDayClosed && <p className="text-danger mt-2">The selected day is closed for bookings.</p>}
          </Form>
          </Card.Body>
        </Card>
        </Col>
        <Col md={6}>
          <Card className="booking-summary-card mt-3">
            <h5>Booking Summary</h5>
            <p><strong>Date:</strong> {selectedDate ? selectedDate.toLocaleDateString() : 'Not selected'}</p>
            <p><strong>Time:</strong> {selectedTime || 'Not selected'}</p>
            <p><strong>Duration:</strong> {duration ? `${duration} Hour(s)` : 'Not selected'}</p>
            <p className="fs-5"><strong>Total Cost:</strong> {selectedTime && duration ? `${court.hourly_rate * duration} LKR` : 'N/A'}</p>
          </Card>
        </Col>
        </Row>
      </Row>
    </Container>
  );
};

export default ViewingPage;
