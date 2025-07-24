import api from "./api";

//get all bookings of the player
export const getPlayerBookings = async (token) => {
    try {
        const response = await api.get('/player/bookings', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching player bookings:', error);
        throw error;
    }
};

// Fetch player profile
export const getPlayerProfile = async (token) => {
    try {
        const response = await api.get("/player/profile", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching profile:", error);
        throw error;
    }
};

// Update player profile
export const updatePlayerProfile = async (token, profileData) => {
    try {
        const response = await api.put("/player/profile", profileData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};

// Upload profile image
export const uploadProfileImage = async (file, token) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await api.post("/player/profile/upload", formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
        },
    });
    console.log("The profile image path is:", response.data.imageUrl);
    return response.data.imageUrl;
};

// Get profile image (playerAuthService.jsx)
export const getProfileImage = async (token) => {
    const response = await api.get("/player/profile/image", {
        headers: { Authorization: `Bearer ${token}` }, // Add auth token
    });
    return response.data;
};


// Player change password
export const changePassword = async (currentPassword, newPassword) => {
  try {
      const response = await api.put("/player/change-password", { currentPassword, newPassword });
      return response.data;
  } catch (error) {
      throw error.response?.data?.message || "Failed to change password";
  }
};
//get invoices details
export const getPlayerInvoices = async (token) => {
    try {
        const response = await api.get('/player/invoices', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching player invoices:', error);
        throw error;
    }
};

// Add a review
export const submitReview = async (token, reviewData) => {
    try{
  const response = await api.post("/player/reviews",reviewData,{
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
});
    return response.data;
  }catch(error) {
        console.error("Error submitting review:", error);
        throw error.response?.data?.message || "Failed to submit review";
    }  
}; 

// Get reviews for court
export const getReviewStats = async (courtId,token) => {
  const response = await api.get(`/player/reviews/${courtId}/stats`,{
    headers:{Authorization: `Bearer ${token}`},
});
  return response.data;
};

// Get average rating for court
export const getAverageRatingByCourt = async (courtId,token) => {
  const response = await api.get(`/player/reviews/${courtId}/average`,{
  headers: { Authorization: `Bearer ${token}` }
});
  return response.data;
};

// Get individual reviews for a court
export const getReviewsByCourt = async (courtId, token) => {
  try {
    const response = await api.get(`/player/reviewsNoAuth/${courtId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Reviews fetched:", response.data);
    return response.data; // Expected: [{ rating, comment, playerName, date }, ...]
  } catch (error) {
    console.error('Error fetching reviews by court:', error);
    throw error;
  }
};

export const gerReviewStatsWithoutAuth = async (courtId) => {
  try {
    const response = await api.get(`/player/reviewsNoAuth/${courtId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching review stats without auth:', error);
    throw error;
  }
};

export const getAverageRatingByCourtWithoutAuth = async (courtId) => {
  try {
    const response = await api.get(`/player/reviewsNoAuth/${courtId}/average`);
    return response.data;
  } catch (error) {
    console.error('Error fetching average rating without auth:', error);
    throw error;
  }
};

//notifications 
export const getPlayerNotifications = async (token) => {
    try {
        const response = await api.get('/player/notifications', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.notifications; // assuming the backend returns { notifications: [...] }
    } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
    }
};