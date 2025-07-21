import React, { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col, Card, Image } from "react-bootstrap";
import { getOwnerProfile, updateOwnerProfile, uploadProfileImage, getProfileImage } from "../services/ownerAuthService";
import { getOwnerActivitySummary, getOwnerLoginTimes } from "../services/ownerInsights";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/ownerSidebar";
import { Bar } from "react-chartjs-2";
import 'chart.js/auto';

const OwnerProfile = () => {
  const navigate = useNavigate();
  const { authToken } = useAuth();

  const [profile, setProfile] = useState({ firstName: "", lastName: "", email: "", mobile: "", country: "", province: "", zip: "", address: "" });
  const [profileImage, setProfileImage] = useState(null);
  const [editing, setEditing] = useState(false);
  const [activitySummary, setActivitySummary] = useState(null);
  const [loginTimes, setLoginTimes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, imageUrl, summary, loginData] = await Promise.all([
          getOwnerProfile(authToken),
          getProfileImage(authToken),
          getOwnerActivitySummary(authToken),
          getOwnerLoginTimes(authToken)
        ]);
        setProfile(profileData);
        setProfileImage(`${process.env.REACT_APP_API_BASE_URL}${imageUrl}`);
        setActivitySummary(summary);
        setLoginTimes(loginData.loginByHour);
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };
    fetchData();
  }, [authToken]);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateOwnerProfile(authToken, profile);
      setEditing(false);
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const imageUrl = await uploadProfileImage(file, authToken);
      setProfileImage(`${process.env.REACT_APP_API_BASE_URL}${imageUrl}`);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <Container className="min-vh-100 d-flex flex-column  align-items-center">
      <Row className="w-100" text-center>
        <Col className="p-4 m-0"  md={3}>
          <Sidebar />
        </Col>

        <Col md={9} className="p-4">

          <Row className="g-4">
            <Col md={4}>
              <Card className="shadow rounded-4">
                <Card.Body className="text-center">
                  {profileImage && (
                    <Image src={profileImage} roundedCircle style={{ height: "180px", width: "180px", objectFit: "cover", border: "4px solid #4e73df" }} />
                  )}
                  <h5 className="mt-3">{profile.firstName} {profile.lastName}</h5>
                  <Form.Control type="file" accept="image/*" onChange={handleImageUpload} className="mt-2" size="sm" />
                  <Button variant="outline-primary" className="mt-3 w-100" onClick={() => navigate("/change-password")}>
                    Change Password
                  </Button>
                </Card.Body>
              </Card>

              <Card className="shadow rounded-4 mt-4">
                <Card.Body>
                  <h6 className="text-muted">Profile </h6>
                  {activitySummary ? (
                    <>
                      <div><strong>Registered Date: </strong> {new Date(activitySummary.lastProfileUpdate).toLocaleDateString()}</div>
                      <div><strong>Number of Logins (Within last 30 days):</strong> {activitySummary.loginCountLast30Days}</div>
                    </>
                  ) : <div>Loading...</div>}
                </Card.Body>
              </Card>
            </Col>

            <Col md={8}>
              <Card className="shadow rounded-4 p-3">
                <Form onSubmit={handleSubmit}>
                  <Row className="g-3">
                    {[
                      { label: "First Name", name: "firstName" },
                      { label: "Last Name", name: "lastName" },
                      { label: "Email", name: "email", disabled: true },
                      { label: "Phone", name: "mobile" },
                      { label: "Country", name: "country" },
                      { label: "Province", name: "province" },
                      { label: "Postal Code", name: "zip" },
                    ].map(({ label, name, disabled }) => (
                      <Col md={6} key={name}>
                        <Form.Group>
                          <Form.Label>{label}</Form.Label>
                          <Form.Control
                            type="text"
                            name={name}
                            value={profile[name]}
                            onChange={handleChange}
                            disabled={disabled || !editing}
                          />
                        </Form.Group>
                      </Col>
                    ))}
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Address</Form.Label>
                        <Form.Control as="textarea" rows={2} name="address" value={profile.address} onChange={handleChange} disabled={!editing} />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="mt-3 text-end">
                    <Button variant="primary" type="button" className="me-2" onClick={() => setEditing(!editing)}>
                      {editing ? "Cancel" : "Edit"}
                    </Button>
                    {editing && <Button variant="success" type="submit">Save Changes</Button>}
                  </div>
                </Form>
              </Card>

             <Card className="shadow rounded-4 mt-4 p-3">
                <h6 className="text-muted">Peak Login Hours</h6>
                {loginTimes.length ? (
                  <Bar
                    data={{
                      labels: loginTimes.map(item => `${item.hour}:00`),
                      datasets: [{ label: 'Logins', data: loginTimes.map(item => item.count), backgroundColor: '#3143bdff' }]
                    }}
                    height={250}
                  />
                ) : <div>Loading chart...</div>}
              </Card> 
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default OwnerProfile;
