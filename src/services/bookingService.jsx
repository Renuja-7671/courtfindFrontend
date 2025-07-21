import api from "./api";

//create a booking
export const createBooking = async (bookingData, token) => {
  try {
    console.log("Booking Data:", bookingData);
    const response = await api.post('/player/create-booking', bookingData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }); 
    console.log("Booking Response:", response.data.bookingId);
    return response.data.bookingId;
  } catch (error) {
    console.error("Booking failed:", error);
    return { success: false, error: error.response?.data?.error || "Unknown error" };
  }
};

// Get booking times by court ID
export const getBookingTimesByCourtId = async (courtId, date) => {
  try {
    const response = await api.get(`/common/courtBookedTimes/${courtId}?date=${date}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch booking times:", error);
    return { success: false, error: error.response?.data?.error || "Unknown error" };
  }
};

export const generateInvoice = async (bookingId) => {
  const res = await api.get(`/player/generate-invoice/${bookingId}`);
  return res.data.invoiceUrl;
};

export const downloadInvoice = async (filename) => {
  try {
    const response = await api.get(`/player/download-invoice/${filename}`, {
      responseType: 'blob', // Important for downloading files
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    return url;
  } catch (error) {
    console.error("Failed to download invoice:", error);
    throw error; // Propagate the error to be handled by the caller
  }
};

export const getOwnerIdAndArenaIdForBooking = async (bookingId) => {
  try {
    const response = await api.get(`/player/get-owner-id/${bookingId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      }});
    return response.data;
  } catch (error) {
    console.error("Failed to fetch owner ID for booking:", error);
    throw error; // Propagate the error to be handled by the caller
  }
};

export const updatePaymentsTable = async (bookingId, ownerId, arenaId, total) => {
  try {
    const response = await api.post('/player/update-payments-table', {
      bookingId,
      ownerId,
      arenaId,
      total
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to update payments table:", error);
    throw error; // Propagate the error to be handled by the caller
  }
}

export const generateInvoiceForArenaAdd = async (arenaId) => {
  try {
    const response = await api.get(`/owner/generate-invoice-for-arena-add/${arenaId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      }
    });
    return response.data.invoiceUrl;
  } catch (error) {
    console.error("Failed to generate invoice for arena add:", error);
    throw error; // Propagate the error to be handled by the caller
  }
};
