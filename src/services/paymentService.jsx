import api from './api';

// Fetch booking details by bookingId
export const fetchBookingById = async (bookingId) => {
  const res = await api.get(`/booking/payment/${bookingId}`);
  return res.data;
};

// Create Stripe session
export const createStripeSession = async (bookingId, amount, ownerId) => {
  const res = await api.post('/stripe/create-checkout-session', {
    bookingId,
    amount,
    ownerId,
  });
  return res.data;
};
