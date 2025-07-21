import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

const PaymentCancel = () => {
  return (
    <Container className="py-5 text-center">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow p-4">
            <Card.Body>
              <h3 className="text-danger">Payment Cancelled</h3>
              <p className="text-muted">
                Something went wrong, or the payment was cancelled. Please try again or contact support.
              </p>
              <Button variant="danger" href="/explore-now">
                Try Again
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentCancel;
