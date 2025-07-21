import api from "./api"; 


export const getAdminProfile = async (token) => {
try{
    const response = await api.get("/admin/profile", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
} catch (error) {
    console.error("Error fetching admin profile:", error);
    throw error;
}
};

export const getAllOwners = async (token) => {
  try{
    const response = await api.get("/admin/owners", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching owners:", error);
    throw error;
  }
};

export const getAllPlayers = async (token) => {
  try{
    const response = await api.get("/admin/players", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching players:", error);
    throw error;
  }
};

export const getAllSports = async (token) => {
  try{
    const response = await api.get("/admin/sports", {
        headers: { Authorization: `Bearer ${token}` },
    });
    console.log("The response is: ", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching sports:", error);
    throw error;
  }
};

export const getAllReviews = async (token) => {
  try{
    const response = await api.get("/admin/reviews", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error;
  }
};

export const getAllMessages = async (token) => {
  try{
    const response = await api.get("/admin/messages", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

export const updateMessageStatus = async (id, status, token) => {
  try {
    const response = await api.put(`/admin/messages/${id}/status`, 
      { status }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating status:", error);
    throw error;
  }
};


export const getAllPricing = async (token) => {
  try{
    const response = await api.get("/admin/pricing", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
    } catch (error) {
    console.error("Error fetching pricing:", error);
    throw error;
  }
};

export const getAllProfit = async (token) => {
  try{
    const response = await api.get("/admin/profit", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching profit:", error);
    throw error;
  }
};

export const updateAdminProfile = async (token, profileData) => {
    try {
        const response = await api.put("/admin/profile", profileData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating admin profile:", error);
        throw error;
    }
};

export const uploadAdminProfileImage = async (file, token) => {
    const formData = new FormData();
    formData.append("image", file);
    console.log("The form data is added:", formData);
  
    const response = await api.post("/admin/profile/upload", formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
        },
    });
  
    return response.data.imageUrl;
};

export const getAdminProfileImage = async (token) => {
    const response = await api.get("/admin/profile/image", {
        headers: { Authorization: `Bearer ${token}` }, // Add auth token
    });
    console.log("The response is: ", response);
    console.log("The image service URL: ", response.data);
    return response.data;
};

export const updateSportDetails = async (token, sportId, updatedData) => {
    try {
        //console.log("The updated data is: ", updatedData);
        //console.log("The sport ID is: ", sportId);
      const response = await api.put(`/admin/sports/${sportId}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating sport details:", error);
      throw error;
    }
};

  export const createSport = async (token, sportData) => {
    try {
        const response = await api.post("/admin/sports", sportData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error creating sport:", error);
        throw error;
    }
};

export const deleteSport = async (token, sportId) => {
    try {
        const response = await api.delete(`/admin/sports/${sportId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting sport:", error);
        throw error;
    }
};

export const getAllPendingArenas = async (token) => {
    try {
        const response = await api.get("/arena/pending-for-admin", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching pending arenas:", error);
        throw error;
    }
};

export const updateArenaStatus = async (arenaId, status, declinedReason, token) => {
    try {
        const response = await api.put(`/arena/update-status/${arenaId}`, { declinedReason, status }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating arena status:", error);
        throw error;
    }
};
  

