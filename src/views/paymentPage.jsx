import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Form, Spinner, Alert } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import {
  Elements,
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { FaCreditCard, FaCcVisa, FaCcMastercard, FaCcAmex, FaCcDiscover } from "react-icons/fa";

const stripePromise = loadStripe("pk_test_51RirFIFwBYKnL5Z3swzBJJ1N9TUIe9fIJKvXcnw6NH1V3pSWagHy9fHBiuIbMAEsKj6rvxIyUyGBde8CCvy0arXB00ToVFYydf");

const ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#212529",
      letterSpacing: "0.025em",
      fontFamily: "system-ui, sans-serif",
      "::placeholder": {
        color: "#adb5bd",
      },
    },
    invalid: {
      color: "#dc3545",
    },
  },
};

const brandIcons = {
  visa: <FaCcVisa size={24} color="#1a1f71" />,
  mastercard: <FaCcMastercard size={24} color="#eb001b" />,
  amex: <FaCcAmex size={24} color="#2e77bc" />,
  discover: <FaCcDiscover size={24} color="#f58220" />,
  default: <FaCreditCard size={24} color="#6c757d" />,
};

const CheckoutForm = () => {
  const { bookingId, total } = useParams();
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [absoluteAmount, setAbsoluteAmount] = useState();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cardBrand, setCardBrand] = useState("default");
  const [paymentCompleted, setPaymentCompleted] = useState(false);


  useEffect(() => {
    if (total) {
      setAmount(total);
      setAbsoluteAmount(parseInt(total));
    }
  }, [total]);

  useEffect(() => {
    if (!elements) return;

    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) return;

    cardNumber.on("change", (event) => {
      if (event.brand) {
        setCardBrand(event.brand);
      }
    });
  }, [elements]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    const conversionRate = 300;
    const amountInUSD = total / conversionRate;
    const amountInCents = Math.round(amountInUSD * 100);
    setAmount(amountInCents);

    if (!stripe || !elements) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/stripe/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInCents }),
      });

      const { clientSecret, error } = await res.json();
      if (error) {
        setMessage({ type: "danger", text: error });
        setLoading(false);
        return;
      }

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
        },
      });
      if (result.error) {
        setMessage({ type: "danger", text: result.error.message });
      } else if (result.paymentIntent.status === "requires_action") {
        setMessage({ type: "warning", text: "Payment requires additional action." });
      } else if (result.paymentIntent.status === "succeeded") {
        setMessage({ type: "success", text: "✅ Payment successful! Thank you." });
        setPaymentCompleted(true);
        setTimeout(() => navigate(`/payment-success/${bookingId}/${absoluteAmount}`), 2000);
      }
    } catch (err) {
      setMessage({ type: "danger", text: "❌ Server error: " + err.message });
    }

    setLoading(false);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow rounded-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4 px-3"
                style={{ borderBottom: "1px solid #dee2e6", paddingBottom: "8px" }}>
                <img
                  src="/assets/cf_only.png"
                  alt="CourtFind Logo"
                  style={{ height: "70px", objectFit: "contain" }}
                />
                <img
                  src="/assets/stripeLogo.jpg"
                  alt="Stripe Logo"
                  style={{ height: "70px", objectFit: "contain" }}
                />
              </div>

              <h4 className="text-center mb-2">Stripe Secure Payment for CourtFind</h4>
              <p className="text-center text-muted mb-1">Pay with your credit or debit card</p>
              
              <div className="d-flex justify-content-center align-items-center gap-3 mb-3">
                <p>We accept:</p>
                <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" style={{ height: "30px" }} />
                <img src="https://img.icons8.com/color/48/000000/mastercard.png" alt="MasterCard" style={{ height: "30px" }} />
                <img src="https://img.icons8.com/color/48/000000/amex.png" alt="Amex" style={{ height: "30px" }} />
              </div>

              <div className="text-center mb-4">{brandIcons[cardBrand] || brandIcons.default}</div>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Card Number</Form.Label>
                  <div className="p-2 border rounded">
                    <CardNumberElement options={ELEMENT_OPTIONS} />
                  </div>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Expiry</Form.Label>
                      <div className="p-2 border rounded">
                        <CardExpiryElement options={ELEMENT_OPTIONS} />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>CVC</Form.Label>
                      <div className="p-2 border rounded">
                        <CardCvcElement options={ELEMENT_OPTIONS} />
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Amount (LKR)</Form.Label>
                  <Form.Control
                    type="number"
                    value={absoluteAmount || ""}
                    disabled
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 rounded-pill"
                  disabled={!stripe || loading || paymentCompleted}
                >
                  {loading ? <Spinner size="sm" animation="border" /> : `Pay LKR ${absoluteAmount || 0}`}
                </Button>

                {message && (
                  <Alert variant={message.type} className="mt-3">
                    {message.text}
                  </Alert>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

const PaymentPage = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default PaymentPage;
