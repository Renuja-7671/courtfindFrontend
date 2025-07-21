import React from "react";
import { Container, Row, Col, Image, Card } from "react-bootstrap";
import { motion } from "framer-motion";

const AboutUs = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        backgroundColor: "#f9f9f9",
        minHeight: "100vh",
        paddingTop: "60px",
        paddingBottom: "60px",
      }}
    >
      <Container>
        <Row className="justify-content-center mb-5 text-center">
          <Col md={8}>
            <h1 className="display-5 fw-bold">About CourtFind</h1>
            <p className="text-muted fs-5 mt-3">
              Your ultimate platform for discovering and booking sports courts across Sri Lanka. 
              We connect players and arena owners with ease and transparency.
            </p>
          </Col>
        </Row>

        <Row className="align-items-center mb-5">
          <Col md={6}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type:"tween", stiffness: 300 }}
            >
              <Image
                src="/assets/aboutus.jpg"
                alt="About Us"
                fluid
                rounded
                className="shadow"
              />
            </motion.div>
          </Col>
          <Col md={6}>
            <h3>Who We Are</h3>
            <p className="text-muted">
              We are a passionate team of sports and tech enthusiasts dedicated to
              revolutionizing the way sports courts are discovered and booked.
              Our mission is to simplify the booking experience for players and
              empower court owners to reach more users effortlessly.
            </p>
          </Col>
        </Row>

        <Row className="text-center">
          <Col md={4}>
            <Card className="border-0 shadow-sm p-3 mb-4 rounded-4">
              <Card.Body>
                <h5 className="fw-bold">🧭 Our Mission</h5>
                <p className="text-muted">
                  To bridge the gap between sports lovers and venues by
                  offering a seamless court booking experience.
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="border-0 shadow-sm p-3 mb-4 rounded-4">
              <Card.Body>
                <h5 className="fw-bold">🚀 Our Vision</h5>
                <p className="text-muted">
                  To become Sri Lanka's most trusted platform for sports
                  arena discovery and management.
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="border-0 shadow-sm p-3 mb-4 rounded-4">
              <Card.Body>
                <h5 className="fw-bold">💡 Why Choose Us?</h5>
                <p className="text-muted">
                  Fast bookings, real-time availability, secure payments, and
                  a user-first approach to sports engagement.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </motion.div>
  );
};

export default AboutUs;
