import api from './api';

// Fetch booking details by bookingId
export const fetchBookingById = async (bookingId) => {
  const res = await api.get(`/booking/payment/${bookingId}`);
  return res.data;
};

