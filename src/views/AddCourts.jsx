import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/ownerSidebar";
import { getAllSports } from "../services/arenaService";
import { createCourt, uploadCourtImages } from "../services/courtService";

const generateTimeOptions = () => {
  const times = [];
  for (let hour = 4; hour <= 22; hour++) {
    times.push(`${hour.toString().padStart(2, "0")}:00`);
  }
  return times;
};

const AddCourts = () => {
  const timeOptions = generateTimeOptions();
  const location = useLocation();
  const navigate = useNavigate();
  const arenaId = location.state?.arenaId;
  const { authToken } = useAuth();

  const [sports, setSports] = useState([]);
  const [courts, setCourts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    size: "",
    rate: "",
    sport: "",
    otherSport: "",
    images: Array(5).fill(null),
    availability: {}
  });

  useEffect(() => {
    // Fetch available sports on mount
    const fetchSports = async () => {
      try {
        const res = await getAllSports(authToken);
        if (Array.isArray(res)) setSports(res);
        else console.error("Unexpected sports response:", res);
      } catch (err) {
        console.error("Error fetching sports:", err);
      }
    };
    fetchSports();
  }, [authToken]);

  // Handle input field changes
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Update images array for selected file at given index
  const handleImageChange = (index, file) => {
    const updatedImages = [...formData.images];
    updatedImages[index] = file;
    setFormData(prev => ({ ...prev, images: updatedImages }));
  };

  // Update availability time for given day and type (open/close)
  const handleAvailabilityChange = (day, type, value) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: { ...prev.availability[day], [type]: value }
      }
    }));
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: "",
      size: "",
      rate: "",
      sport: "",
      otherSport: "",
      images: Array(5).fill(null),
      availability: {}
    });
  };

  // Add current court data to courts list, reset form
  const handleAddCourt = () => {
    if (!formData.name || !formData.size || !formData.rate || (!formData.sport && !formData.otherSport)) {
      alert("Please fill in all required fields.");
      return;
    }
    setCourts(prev => [...prev, formData]);
    resetForm();
    alert("Court added. You can add another or submit all.");
  };

  // Submit all courts, including last form entry, to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    const allCourts = [...courts, formData];

    try {
      for (let court of allCourts) {
        const uploadedImageUrls = await uploadCourtImages(court.images, authToken);

        const courtPayload = {
          name: court.name,
          size: court.size,
          rate: court.rate,
          sport: court.otherSport || court.sport,
          images: uploadedImageUrls,
          availability: court.availability,
          arenaId
        };

        await createCourt(courtPayload, authToken);
      }

      alert("All courts created successfully!");
      setCourts([]);
      resetForm();
      
    // Modified navigation logic
    setTimeout(() => {
      if (arenaId && location.state?.arenaId) {
        // Came from Arena Management - return to manage arenas
        navigate("/owner-requests");
      } else {
        // Came from Add Arena flow - go to owner dashboard
        navigate("/owner-dashboard");
      }
    }, 500);
     } catch (error) {
      console.error("Error creating courts:", error);
      alert("Failed to create some courts. Please try again.");
    }
  };

  return (
    <Container className="min-vh-100 d-flex flex-column align-items-center">
      <Row className="w-100" text-center>
        <Col md={3} className="p-4 m-0"><Sidebar /></Col>
        <Col md={9} className="p-4">
          <h3 className="text-center mb-4">Add Court</h3>
          <Card className="p-4 shadow-sm">
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Court Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Court Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Court Size- In Square Feet</Form.Label>
                <Form.Control
                  type="text"
                  name="size"
                  placeholder="Court Size"
                  value={formData.size}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Hourly Rate</Form.Label>
                <Form.Control
                  type="number"
                  name="rate"
                  placeholder="Hourly Rate"
                  value={formData.rate}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <hr />

              <Form.Group className="mb-3">
                <Form.Label>Available Sport (Select One)</Form.Label>
                <div>
                  {sports.map((sport) => (
                    <Form.Check
                      inline
                      key={sport.id || sport.name}
                      label={sport.name}
                      name="sport"
                      type="radio"
                      id={`sport-${sport.name}`}
                      value={sport.name}
                      checked={formData.sport === sport.name}
                      onChange={handleChange}
                    />
                  ))}
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Other</Form.Label>
                <Form.Control
                  type="text"
                  name="otherSport"
                  placeholder="Enter if not listed above"
                  value={formData.otherSport}
                  onChange={handleChange}
                />
              </Form.Group>

              <hr />

              <Form.Group className="mb-3">
                <Form.Label>Add Images</Form.Label>
                {[...Array(5)].map((_, index) => (
                  <Form.Control
                    key={index}
                    type="file"
                    className="mb-2"
                    onChange={(e) => handleImageChange(index, e.target.files[0])}
                  />
                ))}
              </Form.Group>

              <hr />

              <h5>Available Time</h5>
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                <Row key={day} className="mb-2 align-items-center">
                  <Col xs={3}><strong>{day}</strong></Col>
                  <Col>
                    <Form.Select
                      value={formData.availability[day]?.open || ""}
                      onChange={(e) => handleAvailabilityChange(day, "open", e.target.value)}
                    >
                      <option value="">Open Time</option>
                      {timeOptions.map(time => <option key={time}>{time}</option>)}
                    </Form.Select>
                  </Col>
                  <Col>
                    <Form.Select
                      value={formData.availability[day]?.close || ""}
                      onChange={(e) => handleAvailabilityChange(day, "close", e.target.value)}
                    >
                      <option value="">Close Time</option>
                      {timeOptions.map(time => <option key={time}>{time}</option>)}
                    </Form.Select>
                  </Col>
                </Row>
              ))}

              <div className="text-center mt-4">
                <Button variant="success" type="button" onClick={handleAddCourt} className="me-2">
                  Add Another Court
                </Button>
                <Button variant="primary" type="submit" className="me-2">
                  Finish & Create
                </Button>
                <Button variant="secondary" type="button">
                  Cancel
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddCourts;
