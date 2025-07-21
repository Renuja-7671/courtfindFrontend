import React, { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col, Image, Card  } from "react-bootstrap";
import { getPlayerProfile, updatePlayerProfile, uploadProfileImage, getProfileImage } from "../services/playerAuthService";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/playerSidebar";


const PlayerProfile = () => {
    const navigate = useNavigate();
    const { authToken } = useAuth(); // Get the auth token from context
    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
        country: "",
        province: "",
        zip: "",
        address: "",
    });
    const [profileImage, setProfileImage] = useState(null);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getPlayerProfile(authToken); // Call API to get profile
                setProfile(data);  // Update state with fetched profile    
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

        fetchProfile(); // Call function
    }, [authToken]);    // Dependency on authToken

     // Fetch profile image on component mount or when authToken changes
    useEffect(() => {
        const fetchProfileImage = async () => {
            try {
                const imageUrl = await getProfileImage(authToken); // Get image URL from backend
                console.log("The image URL: ", imageUrl);
                setProfileImage(`${process.env.REACT_APP_API_BASE_URL}${imageUrl}`); // Prepend backend host
            } catch (error) {
                console.error("Error fetching profile image:", error);
            }
        };
        fetchProfileImage();
    }, [authToken]);

 // Handle input field changes
    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value }); // Update corresponding profile field
    };

    
    // Handle profile form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updatePlayerProfile(authToken, profile); // Send updated profile to backend
            setEditing(false); //Exit editing mode
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];// Get the selected file
        console.log("The created file is: ",file);
        if (!file) return;

        try {
            const imageUrl = await uploadProfileImage(file, authToken); // Upload image to backend
            setProfileImage(`${process.env.REACT_APP_API_BASE_URL}${imageUrl}?t=${Date.now()}`);// Set image URL to display
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };

    return (
        <Container className="min-vh-100 d-flex flex-column  align-items-center">
            <Row className="w-100" text-center>
                <Col className="p-4 m-0"  md={3}>
                    <Sidebar />
                </Col>
                
                <Col className="p-4 m-0"  md={3}>
                    <Card className="shadow-sm p-3 mb-5 bg-white rounded">
                        <Card.Body className="text-center">
                            {profileImage && <Image src={profileImage} alt="Profile" roundedCircle style={{ height: "200px", width: "100%", objectFit: "cover" }}/>}
                            <Form.Group>
                                <h4>{profile.firstName} {profile.lastName}</h4>
                                <Form.Control type="file" accept="image/*" onChange={handleImageUpload} />
                            </Form.Group>
                            <br />
                            <Button variant="primary" onClick={() => navigate("/player-change-password")}>Change Password</Button>
                        </Card.Body>
                    </Card>
                </Col>
            
                <Col className="pb-4" md={5} lg={5}>
                    <br />
                    <div className="p-4 shadow-sm border rounded">
                    <h2 className="p-4" style={{ textAlign:"center" }}>My Profile</h2>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group>
                            <Form.Label>First Name</Form.Label>
                            <Form.Control type="text" name="firstName" value={profile.firstName} onChange={handleChange} disabled={!editing} />
                        </Form.Group>
                        <br />

                        <Form.Group>
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control type="text" name="lastName" value={profile.lastName} onChange={handleChange} disabled={!editing} />
                        </Form.Group>
                        <br />

                        <Form.Group>
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" name="email" value={profile.email} disabled />
                        </Form.Group>
                        <br />

                        <Form.Group>
                            <Form.Label>Phone</Form.Label>
                            <Form.Control type="text" name="mobile" value={profile.mobile} onChange={handleChange} disabled={!editing} />
                        </Form.Group>
                        <br />

                        <Form.Group>
                            <Form.Label>Country</Form.Label>
                            <Form.Control type="text" name="country" value={profile.country} onChange={handleChange} disabled={!editing} />
                        </Form.Group>
                        <br />

                        <Form.Group>
                            <Form.Label>Province</Form.Label>
                            <Form.Select
        name="province"
        value={profile.province}
        onChange={handleChange}
        disabled={!editing}
    >
        <option value="">Select Province</option>
        <option value="Central">Central</option>
        <option value="Eastern">Eastern</option>
        <option value="Northern">Northern</option>
        <option value="Southern">Southern</option>
        <option value="Western">Western</option>
        <option value="North Western">North Western</option>
        <option value="North Central">North Central</option>
        <option value="Uva">Uva</option>
        <option value="Sabaragamuwa">Sabaragamuwa</option>
    </Form.Select>
                        </Form.Group>
                        <br />

                        <Form.Group>
                            <Form.Label>Postal Code</Form.Label>
                            <Form.Control type="text" name="zip" value={profile.zip} onChange={handleChange} disabled={!editing} />
                        </Form.Group>
                        <br />

                        <Form.Group>
                            <Form.Label>Address</Form.Label>
                            <Form.Control as="textarea" name="address" value={profile.address} onChange={handleChange} disabled={!editing} />
                        </Form.Group>
                        <br />
                        <div className="d-flex justify-content-center">
                        <Button variant="primary" type="button" onClick={() => setEditing(!editing)} className="me-2 text-center ">
                            {editing ? "Cancel" : "Update Profile"}
                        </Button>
                        {editing && <Button variant="success" type="submit">Save</Button>}
                        </div>
                    </Form>
                    </div>
                </Col>
            
            </Row>
        </Container>
    );
};

export default PlayerProfile;
