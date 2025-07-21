import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Form, Button } from "react-bootstrap";
import { FaStar } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { submitReview } from "../services/playerAuthService";

const FeedbackPage = () => {
  const { courtId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  // Assuming authToken contains user info or fetch playerId dynamically
  
  const handleStarClick = (selectedRating) => {
    setRating(selectedRating); // Update rating based on clicked star
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(rating==0){
        setError('Please select a rating before submitting.');
        return;
    }
        if (!comment) {
    setError("Missing required fields.");
    return;
  }
  const token = localStorage.getItem('authToken');
    if (!token) {
      setError("Authentication required. Please log in.");
      return;
    }
  console.log("Auth Token from localStorage:", courtId);
    try {
      await submitReview(token, { courtId, rating, comment });
      navigate(`/reviews/${courtId}`);
    } catch (err) {
      console.error("Submit review error:", err.response ? err.response.data : err.message);
      setError(err.message || 'Failed to submit review');
    }
  };

  return (
    <Container className="my-4">
      <h3>Add a Review for Court {courtId}</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Rating</Form.Label>
            <div>
            {[...Array(5)].map((_, index) => {
              const starValue = index + 1;
              return (
                <FaStar
                  key={starValue}
                  className={starValue <= rating ? 'text-warning' : 'text-secondary'}
                  style={{ cursor: 'pointer', marginRight: '5px', fontSize: '1.5em' }}
                  onClick={() => handleStarClick(starValue)}
                />
              );
            })}
          </div>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Comment</Form.Label>
          <Form.Control
            as="textarea"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </Form.Group>
        {error && <p className="text-danger">{error}</p>}
        <Button variant="primary" type="submit">
          Submit Review
        </Button>
      </Form>
    </Container>
  );
};

export default FeedbackPage;