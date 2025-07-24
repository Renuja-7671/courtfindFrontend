import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Button, Spinner } from "react-bootstrap";
import { FaStar } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { gerReviewStatsWithoutAuth, getAverageRatingByCourtWithoutAuth, getReviewsByCourt } from "../services/playerAuthService";

const ViewReviews = () => {
  const { courtId } = useParams();
  const navigate = useNavigate();
  const { isAuth, userRole, authToken } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0.0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showAll, setShowAll] = useState(false); // 👈 Toggle for see more/less
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviewData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        // if (!token) throw new Error("Authentication required");
        const statsData = await gerReviewStatsWithoutAuth(courtId);
        setTotalReviews(statsData.total_reviews || 0);

        const avgData = await getAverageRatingByCourtWithoutAuth(courtId);
        setAverageRating(avgData.averageRating || 0.0);

        const reviewsData = await getReviewsByCourt(courtId);
        // Sort reviews by date (latest first), assuming 'created_at' or 'date'
        const sortedReviews = reviewsData.sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
        setReviews(sortedReviews);
      } catch (error) {
        console.error("Failed to fetch review data:", error);
        setError(`Failed to load reviews: ${error.response?.data?.error || error.message}`);
        setError(error.message === "Authentication required" ? "Please log in to view reviews." : "Failed to load reviews.");
      } finally {
        setLoading(false);
      }
    };

fetchReviewData();
  }, [courtId]);

 const isLoggedInPlayer = () => {
  return isAuth && userRole === 'Player';
};


  const handleAddReview = () => {
    if (isLoggedInPlayer()) {
      navigate(`/feedback/${courtId}`);
    } else {
      localStorage.setItem('redirectAfterLogin', `/feedback/${courtId}`);
      navigate('/login');
    }
  };

  
  // Render stars based on rating (up to 5)
  const renderStars = (rating) => {
    const roundedRating = Math.min(5, Math.max(0, Math.round(rating))); // Round to nearest integer, cap at 5
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < roundedRating ? 'text-warning' : 'text-secondary'}
        style={{ marginRight: '2px' }}
      />
    ));
  };

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }
  const visibleReviews = showAll ? reviews : reviews.slice(0, 5);
  return (
    <Container className="my-4 p-5">
      <h3 className="mb-4">Player Reviews & Ratings</h3>
      <Card className="mb-4 p-3">
        <Card.Body>
          <h4>Average Rating: {Number(averageRating).toFixed(1)}</h4>
          <div className="mb-2">{renderStars(Math.round(averageRating))}</div> {/* Rounded up stars for average */}
          <p>Total Reviews: {totalReviews}</p>
         <Button
  variant={isLoggedInPlayer() ? "primary" : "outline-secondary"}
  onClick={() => {
    if (isLoggedInPlayer()) {
      handleAddReview();
    } else {
      navigate('/login');
    }
  }}
  className="mt-2"
  disabled={!isLoggedInPlayer()}
>
  Add a Review
</Button>

{!isLoggedInPlayer() && (
  <div className="mt-2 text-muted">
    You need to <span style={{ color: "#007bff", cursor: "pointer" }} onClick={() => navigate("/login")}>log in as a Player</span> to leave a review.
  </div>
)}
        </Card.Body>
      </Card>
      {reviews.length === 0 ? (
        <p>No reviews yet for this court.</p>
      ) : (
        <>
          <div className="d-flex flex-column gap-3">
            {visibleReviews.map((review) => (
              <Card key={review.reviewId} className="shadow-sm">
                <Card.Body>
                  <Card.Title>{review.firstName} {review.lastName}</Card.Title>
                  <Card.Text className="mb-2">{renderStars(review.rating)}</Card.Text>
                  <Card.Text>{review.comment || 'No comment'}</Card.Text>
                </Card.Body>
                <Card.Footer className="text-muted text-end">
                  {new Date(review.created_at || review.date).toLocaleDateString()}
                </Card.Footer>
              </Card>
            ))}
          </div>
         {reviews.length > 5 && (
            <div className="text-center mt-3">
              <Button variant="outline-primary" onClick={() => setShowAll(!showAll)}>
                {showAll ? "See Less" : "See More"}
              </Button>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default ViewReviews;